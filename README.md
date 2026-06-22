# 📬 MailBridge MERN Email & SMS Service Platform

MailBridge is a sellable Email and SMS service platform built as a MERN college project. It provides a web dashboard, developer portal, client account registration, and client-issued API keys to trigger transactional emails and SMS messages for OTP verifications, welcome emails, forgot password recovery flows, custom notifications, and custom transactional messages.

---

## 🌟 Features

* **User Authentication:** Support for traditional email/password registration (secured with Bcrypt & JWT sessions) and integrated **Google Authentication** (Sign in / Register with Google).
* **Developer API Keys:** Automatic API key generation per client with secure `x-api-key` header verification and key rotation capabilities.
* **Direct Email Delivery:** Standard Gmail SMTP integration using Google App Passwords via Nodemailer (no paid email provider required).
* **Multi-Mode SMS Delivery Pipeline:** Real SMS dispatch capabilities with support for:
  * **Android Debug Bridge (ADB):** Send SMS programmatically via a USB-connected Android phone using shell commands.
  * **Android Local Gateway:** Send SMS via an Android gateway app running over HTTP.
  * **Carrier Gateways:** SMTP-to-SMS email forwarding (e.g. routing messages to domains like `phone@vtext.com`).
  * **Simulation Mode:** Automatically logs messages to the console and emails a copy to the sandbox owner.
* **Resilient Database Design:** Persistent data logging with MongoDB and a built-in custom in-memory database fallback (`memoryStore.js`) for lightweight local demos.
* **Interactive Sandbox Portal:** Full web portal containing dynamic documentation, template saving, and a live request tester with automatic shell `cURL` command generation.

---

## 🏗️ Technology Stack

* **Frontend:** React 19, Vite, React Router DOM, Vanilla CSS, Lucide Icons, Google OAuth 2.0
* **Backend:** Node.js, Express.js (v5.x), Nodemailer, Bcrypt.js, JSON Web Tokens (JWT)
* **Database:** MongoDB & Mongoose ODM (with hybrid in-memory fallback support)

---

## 🚀 Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
copy .env.example .env
```

Ensure your `.env` contains:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/mailbridge
JWT_SECRET=supersecretkey
MAILBRIDGE_API_KEY=mb_test_college_demo_key

# Gmail SMTP Settings
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
FROM_NAME=MailBridge

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Writing Assistant (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start the application
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend:** `http://localhost:5000`

---

## 🔐 Google OAuth Configuration

To enable Google sign-in:
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services** > **OAuth consent screen** (Set to *External*).
3. Under **Credentials**, click **Create Credentials** > **OAuth client ID** (Web application).
4. Add the following redirect settings:
   * **Authorized JavaScript origins:** `http://localhost:5173`
   * **Authorized redirect URIs:** `http://localhost:5173`
5. Copy the generated **Client ID** and **Client Secret** into your `.env` file.

---

## 📲 SMS Gateway Configuration

MailBridge supports multiple methods for dispatching SMS messages:
* **USB Debugging (ADB):** Set `SMS_USE_ADB=true` and `ADB_PATH` in your `.env`. Make sure your Android device is connected via USB with USB Debugging authorized.
* **SMS Gateway HTTP API:** If using a local SMS Gateway app, set `SMS_GATEWAY_URL`, `SMS_GATEWAY_USER`, and `SMS_GATEWAY_PASS`.
* **Carrier Gateway:** Forward emails via SMTP to carrier email-to-SMS domains. Set `smsSettings.carrierGateway` under user settings.

---

## 📡 API Reference

Use the Header `x-api-key: your_api_key` for client-facing endpoints.

### Authentication Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new client user account. |
| `POST` | `/api/v1/auth/login` | Traditional email & password login. |
| `POST` | `/api/v1/auth/google` | Sign in / register using Google ID Token. |
| `GET` | `/api/v1/auth/me` | Fetch currently logged in user info. |
| `POST` | `/api/v1/auth/rotate` | Rotate and generate a new client API Key. |

### Email Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/emails/welcome` | Send a welcome email template. |
| `POST` | `/api/v1/emails/otp` | Generate and send a 6-digit email OTP. |
| `POST` | `/api/v1/emails/verify-otp` | Verify an email OTP. |
| `POST` | `/api/v1/emails/forgot-password` | Send a password reset email link. |
| `POST` | `/api/v1/emails/notification` | Send system or custom notification alerts. |
| `POST` | `/api/v1/emails/custom` | Send custom subject/body transactional emails. |
| `GET` | `/api/v1/emails/logs` | Fetch client email logs. |

### SMS Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/sms/otp` | Generate and dispatch a 6-digit SMS OTP. |
| `POST` | `/api/v1/sms/verify-otp` | Verify an SMS OTP. |
