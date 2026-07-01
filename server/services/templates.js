const shell = ({ title, body, action, settings }) => {
  const brandName = settings?.brandName || "My Brand";
  const colorHeaderBg = settings?.colorHeaderBg || "#0f766e";
  const colorHeaderText = settings?.colorHeaderText || "#ffffff";
  const colorButtonBg = settings?.colorButtonBg || "#0f766e";
  const colorBgLight = settings?.colorBgLight || "#f1f5f9";
  const emailFooter = settings?.emailFooter || "© 2026 MailBridge. All rights reserved.";

  return `
    <div style="font-family:Arial,sans-serif;background:${colorBgLight};padding:28px">
      <div style="max-width:620px;margin:auto;background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background:${colorHeaderBg};color:${colorHeaderText};padding:22px 26px;text-align:center;">
          <h2 style="margin:0;font-size:20px;font-weight:bold;letter-spacing:0.5px;color:${colorHeaderText} !important;">${brandName}</h2>
        </div>
        <div style="padding:26px;color:#1f2937;line-height:1.6">
          <h1 style="margin-top:0;margin-bottom:16px;font-size:22px;color:#111827;font-weight:bold;">${title}</h1>
          ${body}
          ${action ? `<div style="text-align:center;margin-top:24px">${action}</div>` : ""}
        </div>
        <div style="padding:16px 26px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;border-top:1px solid #f1f5f9;">
          ${emailFooter}
        </div>
      </div>
    </div>
  `;
};

export function welcomeTemplate({ name, company }, settings) {
  const brand = settings?.brandName || company || "our platform";
  return {
    subject: `Welcome to ${brand}`,
    text: `Hi ${name}, welcome to ${brand}.`,
    html: shell({
      title: "Welcome aboard",
      body: `<p>Hi <strong>${name}</strong>,</p><p>Your account is ready. We are happy to have you with ${brand}.</p>`,
      settings
    })
  };
}

export function otpTemplate({ code, purpose }, settings) {
  const buttonBg = settings?.colorButtonBg || "#0f766e";
  return {
    subject: "Your verification OTP",
    text: `Your OTP for ${purpose} is ${code}. It expires in 10 minutes.`,
    html: shell({
      title: "Verification code",
      body: `<p>Use this OTP for <strong>${purpose}</strong>:</p><p style="font-size:30px;letter-spacing:6px;font-weight:700;margin:20px 0;text-align:center;color:${buttonBg}">${code}</p><p>This code expires in 10 minutes.</p>`,
      settings
    })
  };
}

export function forgotPasswordTemplate({ resetUrl }, settings) {
  const btnBg = settings?.colorButtonBg || "#0f766e";
  return {
    subject: "Reset your password",
    text: `Reset your password using this link: ${resetUrl}`,
    html: shell({
      title: "Password reset",
      body: `<p>We received a request to reset your password.</p>`,
      action: `<a href="${resetUrl}" style="background-color:${btnBg};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset password</a>`,
      settings
    })
  };
}

export function customTemplate({ subject, message }, settings) {
  return {
    subject,
    text: message,
    html: shell({
      title: subject,
      body: `<p>${message}</p>`,
      settings
    })
  };
}

export function notificationTemplate({ title, message }, settings) {
  return {
    subject: title,
    text: message,
    html: shell({
      title,
      body: `<p>${message}</p>`,
      settings
    })
  };
}

export function simpleTemplate({ subject, message, buttonText, buttonUrl }, settings) {
  const btnBg = settings?.colorButtonBg || "#0f766e";
  const finalButtonText = buttonText || settings?.emailActionText || "Get Started";
  const finalButtonUrl = buttonUrl || settings?.emailActionUrl;
  const finalShowButton = settings?.showButton !== false;
  const actionHtml = (finalShowButton && finalButtonText && finalButtonUrl)
    ? `<a href="${finalButtonUrl}" style="background-color:${btnBg};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">${finalButtonText}</a>`
    : "";
  return {
    subject,
    text: (finalShowButton && finalButtonUrl) ? `${message}\n\n${finalButtonText}: ${finalButtonUrl}` : message,
    html: shell({
      title: subject,
      body: `<p style="white-space: pre-line;">${message}</p>`,
      action: actionHtml,
      settings
    })
  };
}
