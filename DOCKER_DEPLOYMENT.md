# 🚀 AWS EC2 Docker Deployment Guide for MailBridge

This guide explains how to host **MailBridge** on an **AWS EC2 instance** using Docker and Docker Compose.

---

## 📋 Prerequisites
1. An AWS Account.
2. An active EC2 instance (e.g., **Ubuntu 22.04 LTS** or **Amazon Linux 2023**, `t2.micro` / `t3.micro` or larger).
3. Security Group rules configured on EC2:
   - **Inbound Rules**:
     - `HTTP` (Port 80) -> `0.0.0.0/0`
     - `Custom TCP` (Port 5000) -> `0.0.0.0/0`
     - `SSH` (Port 22) -> Your IP

---

## 🛠️ Step 1: Connect to your EC2 Instance
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

## 🐳 Step 2: Install Docker & Docker Compose on EC2

### For Ubuntu:
```bash
# Update package index
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose-v2

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (so you don't need 'sudo' for docker commands)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
exit
```

---

## 📦 Step 3: Clone Code & Configure Environment

```bash
# Clone your repository
git clone https://github.com/pateldeep04/Email-services-SaaS.git
cd Email-services-SaaS

# Create your production environment file
nano .env
```

Add your environment variables inside `.env`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/mailbridge
JWT_SECRET=your_custom_secure_jwt_secret_here
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
CLIENT_URL=http://<YOUR-EC2-PUBLIC-IP>
```

---

## 🚀 Step 4: Run with Docker Compose

Build and launch the containers in background mode:
```bash
docker compose up -d --build
```

### Check Container Status:
```bash
docker compose ps
```

### View Application Logs:
```bash
docker compose logs -f app
```

---

## 🌐 Step 5: Access Your Live Application

Open your browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>
```
or
```
http://<YOUR-EC2-PUBLIC-IP>:5000
```

---

## 🔄 Useful Docker Commands

- **Stop application**: `docker compose down`
- **Rebuild & restart**: `docker compose up -d --build`
- **View Mongo logs**: `docker compose logs -f mongo`
- **Check resource usage**: `docker stats`
