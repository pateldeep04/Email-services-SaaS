# 🚀 MailBridge PM2 Production Deployment Guide

Deploying MailBridge with **PM2** is lightweight, consumes minimal disk space, and avoids Docker layer caching issues on smaller VPS/EC2 instances (e.g. AWS t2/t3.micro).

---

## 1. Remove Docker from Hosting Server (Reclaim Disk Space)

Run these commands in your server terminal as `root` (or with `sudo`):

```bash
# 1. Stop and remove all running Docker containers
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# 2. Remove all Docker images, volumes, and networks
docker system prune -a --volumes -f

# 3. Stop Docker services
systemctl stop docker.socket docker.service containerd.service

# 4. Uninstall Docker packages
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker.io

# 5. Delete remaining Docker & containerd data directories (reclaims all disk space)
rm -rf /var/lib/docker
rm -rf /var/lib/containerd
apt-get autoremove -y --purge
apt-get clean
```

Check your disk space:
```bash
df -h /
```
*(You will see several gigabytes instantly freed up).*

---

## 2. Install Node.js 20 & PM2

If Node.js is not already installed on the server:

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2
```

Verify installations:
```bash
node -v
npm -v
pm2 -v
```

---

## 3. Build & Run MailBridge with PM2

Navigate to your project directory on the server:

```bash
cd /home/ubuntu/Email-services-SaaS

# 1. Pull the latest code
git pull origin main

# 2. Install project dependencies
npm install

# 3. Build the frontend production bundle (Vite -> dist/)
npm run build

# 4. Start MailBridge using PM2
pm2 start ecosystem.config.cjs

# 5. Configure PM2 to auto-start on server reboots
pm2 save
pm2 startup
# (Run the sudo env PATH... command printed in the terminal by pm2 startup)
```

---

## 4. Useful PM2 Commands

* **View running status:** `pm2 status`
* **View real-time logs:** `pm2 logs mailbridge`
* **Restart service:** `pm2 restart mailbridge`
* **Stop service:** `pm2 stop mailbridge`
* **Monitor CPU & RAM:** `pm2 monit`

---

## 5. Nginx Reverse Proxy (Optional for Port 80/443 -> Port 5000)

If you want your app to be accessible on standard port 80/443 without typing `:5000`:

```bash
apt-get install -y nginx
```

Create `/etc/nginx/sites-available/mailbridge`:

```nginx
server {
    listen 80;
    server_name yourdomain.com; # or your server IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/mailbridge /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```
