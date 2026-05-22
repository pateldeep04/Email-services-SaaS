# Security Guidelines for MailBridge

## 🔐 Handling Sensitive Data

### Environment Variables
Never commit `.env` file to Git. The `.gitignore` file already excludes it, but be careful:

**✓ SAFE:**
- `.env` file (locally on your machine)
- `.env.example` (template with placeholder values)
- Environment variables set in CI/CD platforms

**✗ UNSAFE:**
- Hardcoded secrets in source code
- Committing `.env` to Git
- Sharing API keys via email/chat
- Storing secrets in client-side code

### Required Environment Variables
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
MAILBRIDGE_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
FROM_NAME=MailBridge
```

### Getting Gmail App Password
1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select Mail and Windows Computer
4. Generate 16-character password
5. Add it to `.env` as `GMAIL_APP_PASSWORD`

## 🚨 If You Exposed a Secret

**IMMEDIATELY DO THIS:**
1. Regenerate the exposed secret in the service dashboard
2. Run: `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all`
3. Force push: `git push --force-with-lease --all`
4. Delete the repository and re-create if it was public

## ✅ Security Checklist

- [ ] `.env` is in `.gitignore` ✓ (already done)
- [ ] `.env.example` contains only placeholders ✓ (already done)
- [ ] No hardcoded secrets in code ✓ (already fixed)
- [ ] All secrets use `process.env` ✓ (already done)
- [ ] Never share API keys with anyone
- [ ] Rotate keys periodically (monthly recommended)
- [ ] Use different keys for dev/staging/production

## API Key Rotation

Generate a new API key when:
- Developer leaves the team
- You suspect compromise
- Monthly maintenance rotation
- Environment changes (dev → prod)

## Questions?
If you find any hardcoded secrets in the code, fix them immediately and regenerate credentials.
