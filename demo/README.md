# MailBridge Isolated Demo Application

This is a standalone, isolated client application designed to demonstrate the MailBridge Email API using the provided API key. 

It implements a mock user sign-up and login flow stored entirely in the browser's `localStorage` (making it completely isolated with no shared resources).

## Features
- **Register Screen**: Sign up an isolated user and trigger a **Welcome Email** via the `/api/v1/emails/welcome` endpoint.
- **Login Screen**: Log in using stored local credentials and trigger a **Custom Login Alert Email** via the `/api/v1/emails/custom` endpoint.
- **Home Screen**: A clean dashboard greeting the user (`Hello, [Name]!`) and listing session logs for triggered MailBridge API requests.
- **Preconfigured API Key**: Preloaded with `mb_174263ffaf8ed464635e566abbf7c58d`.

## How to Run

1. Make sure your MailBridge backend server is running:
   ```bash
   npm run dev
   ```
   *(Ensure MongoDB is running or it will fallback to demo in-memory storage)*

2. In a separate terminal, start the demo client:
   ```bash
   npm run demo
   ```

3. Open your browser and navigate to:
   [http://localhost:5174](http://localhost:5174)
