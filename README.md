# MailBridge MERN Email Platform

MailBridge is a sellable email service platform built as a MERN college project. It provides a website, backend API, account registration, and client-issued API keys for OTP, welcome emails, forgot password flows, notifications, and custom transactional messages.

## Features

- User registration and login for client accounts
- **Google Authentication** (Sign in with Google / Register with Google)
- Automatic API key generation per client
- Secure API key validation for email endpoints
- Gmail SMTP delivery using Google App Passwords
- MongoDB persistence with in-memory fallback for demos
- Full website with documentation, live request tester, and account portal

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment variables

Copy `.env.example` to `.env` and update the values.

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/mailbridge
MAILBRIDGE_API_KEY=mb_test_college_demo_key
JWT_SECRET=supersecretkey
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
FROM_NAME=MailBridge

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Google OAuth Setup

To enable Google Authentication:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services** > **OAuth consent screen**.
3. Create an **External** application.
4. Go to **Credentials**, click **Create Credentials** > **OAuth client ID**.
5. Select **Web application** and add the following:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173`
6. Copy the Client ID and Client Secret into your `.env` file.

## API documentation

### Auth endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google` (Google OAuth ID Token verification)
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/rotate`

### Email endpoints

- `POST /api/v1/emails/welcome`
- `POST /api/v1/emails/otp`
- `POST /api/v1/emails/verify-otp`
- `POST /api/v1/emails/forgot-password`
- `POST /api/v1/emails/notification`
- `POST /api/v1/emails/custom`
- `GET /api/v1/emails/logs`

## Notes

- Use `x-api-key` with the API key returned from your account.
- The service uses Gmail SMTP directly, so no paid email provider is required.
- MongoDB is optional; if unavailable, the server continues in memory mode for demos.
