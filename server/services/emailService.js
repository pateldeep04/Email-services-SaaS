import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

export async function testSmtpConnection() {
  const transporter = getTransporter();
  if (!transporter) {
    return { status: "unconfigured", error: "Gmail credentials not set in environment." };
  }
  try {
    await transporter.verify();
    return { status: "valid" };
  } catch (error) {
    return { status: "invalid", error: error.message };
  }
}

export async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      status: "simulated",
      messageId: "simulated-gmail-message",
      note: "Gmail SMTP is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to send real emails."
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "MailBridge"}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    return {
      status: "sent",
      messageId: info.messageId
    };
  } catch (error) {
    if (error.code === "EAUTH" || error.message.toLowerCase().includes("username and password not accepted")) {
      const authError = new Error("SMTP Authentication Failed. Please verify your GMAIL_USER and GMAIL_APP_PASSWORD in your .env configuration. Make sure you use a 16-character App Password.");
      authError.status = 400;
      throw authError;
    }
    throw error;
  }
}
