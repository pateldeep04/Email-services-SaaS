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

export async function sendEmail({ to, subject, html, text }, customSmtp = null, senderProfile = null) {
  let transporter = null;
  let fromName = process.env.FROM_NAME || "MailBridge";
  let fromEmail = process.env.GMAIL_USER;
  let replyTo = undefined;
  let isSimulated = false;

  if (customSmtp && customSmtp.enabled) {
    // Construct dynamic custom SMTP transporter
    transporter = nodemailer.createTransport({
      host: customSmtp.host,
      port: Number(customSmtp.port),
      secure: Boolean(customSmtp.secure),
      auth: {
        user: customSmtp.user,
        pass: customSmtp.pass
      }
    });
    fromName = customSmtp.fromName || "MailBridge";
    fromEmail = customSmtp.fromEmail || customSmtp.user;
  } else {
    // Use system SMTP config from .env
    transporter = getTransporter();
    if (!transporter) {
      isSimulated = true;
    }
  }

  // Allow sender profile / API request override to take precedence
  if (senderProfile) {
    if (senderProfile.fromName) {
      fromName = senderProfile.fromName;
    }
    if (senderProfile.fromEmail) {
      fromEmail = senderProfile.fromEmail;
      replyTo = senderProfile.fromEmail;
    }
  }

  if (isSimulated) {
    return {
      status: "simulated",
      messageId: "simulated-gmail-message",
      note: "Gmail SMTP is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to send real emails."
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      replyTo,
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
      const isCustom = !!(customSmtp && customSmtp.enabled);
      const target = isCustom ? "custom SMTP" : "GMAIL_USER and GMAIL_APP_PASSWORD in your .env configuration";
      const authError = new Error(`SMTP Authentication Failed. Please verify your ${target}. Make sure you use a valid password or App Password.`);
      authError.status = 400;
      throw authError;
    }
    throw error;
  }
}
