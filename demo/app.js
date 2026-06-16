// Configuration
const API_URL = 'http://localhost:5000/api/v1';
const DEFAULT_API_KEY = 'mb_52babc2aa868f0a36c562c241118fda6';

// DOM Pages
const pageLogin = document.getElementById('page-login');
const pageRegister = document.getElementById('page-register');
const pageHome = document.getElementById('page-home');
const pageAdmin = document.getElementById('page-admin');
const pageLoginOtp = document.getElementById('page-login-otp');

// DOM Forms & Buttons
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formOtpSend = document.getElementById('form-otp-send');
const formOtpVerify = document.getElementById('form-otp-verify');

const linkToRegister = document.getElementById('link-to-register');
const linkToLogin = document.getElementById('link-to-login');
const btnLogout = document.getElementById('btn-logout');
const btnToAdmin = document.getElementById('btn-to-admin');
const btnAdminBack = document.getElementById('btn-admin-back');

const btnLoginSubmit = document.getElementById('btn-login-submit');
const btnRegisterSubmit = document.getElementById('btn-register-submit');
const btnOtpSendSubmit = document.getElementById('btn-otp-send-submit');
const btnOtpVerifySubmit = document.getElementById('btn-otp-verify-submit');
const btnOtpResend = document.getElementById('btn-otp-resend');

const linkToOtpLogin = document.getElementById('link-to-otp-login');
const linkToPasswordLogin = document.getElementById('link-to-password-login');
const linkOtpToRegister = document.getElementById('link-otp-to-register');

// Dashboard Elements
const homeGreeting = document.getElementById('home-greeting');
const apiKeyInput = document.getElementById('api-key-input');
const btnCopyKey = document.getElementById('btn-copy-key');
const logList = document.getElementById('log-list');

// Admin Elements
const brandNameInput = document.getElementById('brand-name');
const colorHeaderBgInput = document.getElementById('color-header-bg');
const colorHeaderTextInput = document.getElementById('color-header-text');
const colorButtonBgInput = document.getElementById('color-button-bg');
const colorBgLightInput = document.getElementById('color-bg-light');
const emailTitleInput = document.getElementById('email-title');
const emailMessageInput = document.getElementById('email-message');
const emailActionTextInput = document.getElementById('email-action-text');
const emailActionUrlInput = document.getElementById('email-action-url');
const emailFooterInput = document.getElementById('email-footer');
const testRecipientInput = document.getElementById('test-recipient');
const btnSendTest = document.getElementById('btn-send-test');

const previewEmailSubject = document.getElementById('preview-email-subject');
const emailPreviewContainer = document.getElementById('email-preview-container');

// Tabs
const tabBtnPreview = document.getElementById('tab-btn-preview');
const tabBtnApi = document.getElementById('tab-btn-api');
const tabContentPreview = document.getElementById('tab-content-preview');
const tabContentApi = document.getElementById('tab-content-api');
const apiPayloadCode = document.getElementById('api-payload-code');
const btnCopyCode = document.getElementById('btn-copy-code');

const toastContainer = document.getElementById('toast-container');

// Session memory logs
let sessionLogs = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check login state
  checkSession();
  
  // Set default API key
  apiKeyInput.value = DEFAULT_API_KEY;
  
  // Event listeners for page switching
  linkToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage('register');
  });

  linkToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage('login');
  });

  linkToOtpLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage('login-otp');
  });

  linkToPasswordLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage('login');
  });

  linkOtpToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage('register');
  });

  btnOtpResend.addEventListener('click', () => {
    formOtpVerify.classList.add('hidden');
    formOtpSend.classList.remove('hidden');
    document.getElementById('otp-code').value = '';
  });

  btnLogout.addEventListener('click', () => {
    logout();
  });

  btnToAdmin.addEventListener('click', () => {
    switchPage('admin');
    updatePreview();
  });

  btnAdminBack.addEventListener('click', () => {
    switchPage('home');
  });

  // Admin template live binding
  const inputs = [
    brandNameInput, colorHeaderBgInput, colorHeaderTextInput,
    colorButtonBgInput, colorBgLightInput, emailTitleInput,
    emailMessageInput, emailActionTextInput, emailActionUrlInput,
    emailFooterInput
  ];

  inputs.forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  // Tab switching in Admin
  tabBtnPreview.addEventListener('click', () => {
    tabBtnPreview.classList.add('active');
    tabBtnApi.classList.remove('active');
    tabContentPreview.style.display = 'block';
    tabContentApi.style.display = 'none';
  });

  tabBtnApi.addEventListener('click', () => {
    tabBtnApi.classList.add('active');
    tabBtnPreview.classList.remove('active');
    tabContentApi.style.display = 'block';
    tabContentPreview.style.display = 'none';
    updatePreview(); // ensure up to date code is shown
  });

  // Copy buttons
  btnCopyKey.addEventListener('click', () => {
    navigator.clipboard.writeText(apiKeyInput.value);
    showToast('API Key copied to clipboard!', 'info');
  });

  btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(apiPayloadCode.textContent);
    showToast('Integration code copied to clipboard!', 'info');
  });

  // Form Submissions
  formRegister.addEventListener('submit', handleRegister);
  formLogin.addEventListener('submit', handleLogin);
  formOtpSend.addEventListener('submit', handleOtpSend);
  formOtpVerify.addEventListener('submit', handleOtpVerify);
  btnSendTest.addEventListener('click', handleSendTest);

  // Playground Bindings
  const playEndpoint = document.getElementById('play-endpoint');
  const playSenderOverrideToggle = document.getElementById('play-sender-override-toggle');
  const playSenderOverrideFields = document.getElementById('play-sender-override-fields');
  const formPlayground = document.getElementById('form-playground');

  playEndpoint.addEventListener('change', (e) => {
    const selected = e.target.value;
    document.querySelectorAll('.play-param-group').forEach(group => {
      group.classList.add('hidden');
    });
    const targetGroup = document.getElementById(`play-group-${selected}`);
    if (targetGroup) {
      targetGroup.classList.remove('hidden');
    }
  });

  playSenderOverrideToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      playSenderOverrideFields.classList.remove('hidden');
    } else {
      playSenderOverrideFields.classList.add('hidden');
    }
  });

  formPlayground.addEventListener('submit', handlePlaygroundSubmit);
});

// Navigation / View Router
function switchPage(pageId) {
  pageLogin.classList.remove('active');
  pageRegister.classList.remove('active');
  pageHome.classList.remove('active');
  pageAdmin.classList.remove('active');
  pageLoginOtp.classList.remove('active');

  // Reset OTP forms when switching
  if (pageId !== 'login-otp') {
    formOtpVerify.classList.add('hidden');
    formOtpSend.classList.remove('hidden');
    formOtpSend.reset();
    formOtpVerify.reset();
  }

  // Display page with slide animation
  setTimeout(() => {
    if (pageId === 'login') {
      pageLogin.classList.add('active');
    } else if (pageId === 'register') {
      pageRegister.classList.add('active');
    } else if (pageId === 'home') {
      pageHome.classList.add('active');
    } else if (pageId === 'admin') {
      pageAdmin.classList.add('active');
    } else if (pageId === 'login-otp') {
      pageLoginOtp.classList.add('active');
    }
  }, 100);
}

// Session Management
function checkSession() {
  const currentUser = JSON.parse(sessionStorage.getItem('mailbridge_demo_current_user'));
  if (currentUser) {
    setupDashboard(currentUser);
    switchPage('home');
  } else {
    switchPage('login');
  }
}

function setupDashboard(user) {
  homeGreeting.textContent = `Hello, ${user.name}!`;
  const playToInput = document.getElementById('play-to');
  if (playToInput) {
    playToInput.value = user.email || '';
  }
  renderLogs();
}

function logout() {
  sessionStorage.removeItem('mailbridge_demo_current_user');
  showToast('Logged out successfully', 'info');
  switchPage('login');
}

// Local Storage Helper (Isolated database emulation)
function getUsers() {
  const users = localStorage.getItem('mailbridge_demo_users');
  return users ? JSON.parse(users) : [];
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('mailbridge_demo_users', JSON.stringify(users));
}

// Toast Notification Engine
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️ ';
  if (type === 'success') icon = '✅ ';
  if (type === 'error') icon = '❌ ';
  
  toast.textContent = `${icon}${message}`;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

// Log actions to the session UI list
function logAction(type, recipient, success, details) {
  const timestamp = new Date().toLocaleTimeString();
  const logItem = { type, recipient, success, details, timestamp };
  sessionLogs.unshift(logItem);
  renderLogs();
}

function renderLogs() {
  if (sessionLogs.length === 0) {
    logList.innerHTML = '<div class="empty-log">No actions logged yet in this session.</div>';
    return;
  }

  logList.innerHTML = sessionLogs.map(log => `
    <div class="log-item ${log.type}">
      <div class="log-item-header">
        <span>Email: ${log.type.toUpperCase()}</span>
        <span style="color: ${log.success ? '#10b981' : '#ef4444'}">
          ${log.success ? 'Success' : 'Failed'}
        </span>
      </div>
      <div class="log-item-body">
        <strong>Sent To:</strong> ${log.recipient}<br>
        <strong>Details:</strong> ${log.details}
      </div>
      <div class="log-item-time">${log.timestamp}</div>
    </div>
  `).join('');
}

// Live Email & Code Generator
function generateEmailHtml() {
  const brandName = brandNameInput.value.trim();
  const headerBg = colorHeaderBgInput.value;
  const headerText = colorHeaderTextInput.value;
  const buttonBg = colorButtonBgInput.value;
  const bgLight = colorBgLightInput.value;
  const emailTitle = emailTitleInput.value.trim();
  const emailMessage = emailMessageInput.value.trim();
  const actionText = emailActionTextInput.value.trim();
  const actionUrl = emailActionUrlInput.value.trim();
  const emailFooter = emailFooterInput.value.trim();

  return `
<div style="font-family: Arial, sans-serif; background-color: ${bgLight}; padding: 30px; margin: 0; border-radius: 8px;">
  <div style="max-width: 580px; margin: auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: ${headerBg}; color: ${headerText}; padding: 24px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">${brandName}</h2>
    </div>
    <div style="padding: 30px; color: #374151; line-height: 1.6; font-size: 15px;">
      <h1 style="margin-top: 0; margin-bottom: 16px; font-size: 22px; color: #111827; font-weight: bold;">${emailTitle}</h1>
      <p style="margin-bottom: 24px; color: #4b5563; white-space: pre-line;">${emailMessage}</p>
      ${actionText ? `
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${actionUrl}" target="_blank" style="background-color: ${buttonBg}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${actionText}</a>
      </div>
      ` : ''}
    </div>
    <div style="padding: 16px 30px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; text-align: center;">
      ${emailFooter}
    </div>
  </div>
</div>`.trim();
}

function updatePreview() {
  const html = generateEmailHtml();
  const subject = emailTitleInput.value.trim();

  // Update Preview Screen
  previewEmailSubject.textContent = subject;
  emailPreviewContainer.innerHTML = html;

  // Generate Integration Code snippet
  const escapedSubject = subject.replace(/'/g, "\\'");
  const escapedHtml = html.replace(/`/g, '\\`').replace(/\${/g, '\\${');
  
  const codeSnippet = `fetch('${API_URL}/emails/custom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    to: 'recipient@domain.com',
    subject: '${escapedSubject}',
    html: \`${escapedHtml}\`
  })
})
.then(res => res.json())
.then(data => console.log('Mail sent successfully:', data))
.catch(err => console.error('API Error:', err));`;

  apiPayloadCode.textContent = codeSnippet;
}

// Register Handler
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    showToast('A user with that email already exists in this isolated demo.', 'error');
    return;
  }

  setLoading(btnRegisterSubmit, true);

  try {
    const response = await fetch(`${API_URL}/emails/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyInput.value
      },
      body: JSON.stringify({
        to: email,
        name: name,
        company: 'MailBridge Sandbox Client'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send welcome email');
    }

    saveUser({ name, email, password });
    
    showToast('Registration successful! Welcome email triggered.', 'success');
    logAction('welcome', email, true, `Welcome email sent. MessageId: ${data.messageId || 'Simulated'}`);
    
    formRegister.reset();
    switchPage('login');

  } catch (error) {
    showToast(error.message, 'error');
    logAction('welcome', email, false, error.message);
  } finally {
    setLoading(btnRegisterSubmit, false);
  }
}

// Login Handler
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    showToast('Invalid email or password in this isolated sandbox.', 'error');
    return;
  }

  setLoading(btnLoginSubmit, true);

  try {
    const response = await fetch(`${API_URL}/emails/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyInput.value
      },
      body: JSON.stringify({
        to: email,
        subject: 'Security Alert: New Sign-in Detected',
        message: `Hello ${user.name},\n\nWe detected a new login to your isolated sandbox account at ${new Date().toLocaleString()}.\n\nIf this was you, no action is needed.\n\nBest regards,\nMailBridge Demo Client`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send login alert');
    }

    showToast('Login successful! Security alert email sent.', 'success');
    logAction('custom', email, true, `Custom login alert email sent. MessageId: ${data.messageId || 'Simulated'}`);
    
    sessionStorage.setItem('mailbridge_demo_current_user', JSON.stringify({ name: user.name, email: user.email }));
    setupDashboard(user);
    
    formLogin.reset();
    switchPage('home');

  } catch (error) {
    showToast(error.message, 'error');
    logAction('custom', email, false, error.message);
  } finally {
    setLoading(btnLoginSubmit, false);
  }
}

// Admin Send Test Delivery Handler
async function handleSendTest() {
  const recipient = testRecipientInput.value.trim();
  if (!recipient) {
    showToast('Please enter a valid recipient email address.', 'error');
    return;
  }

  setLoading(btnSendTest, true);

  try {
    const html = generateEmailHtml();
    const subject = emailTitleInput.value.trim();

    const response = await fetch(`${API_URL}/emails/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyInput.value
      },
      body: JSON.stringify({
        to: recipient,
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send custom template email');
    }

    showToast('Custom styled email sent successfully!', 'success');
    logAction('custom-design', recipient, true, `Custom designed email sent. MessageId: ${data.messageId || 'Simulated'}`);

  } catch (error) {
    showToast(error.message, 'error');
    logAction('custom-design', recipient, false, error.message);
  } finally {
    setLoading(btnSendTest, false);
  }
}

// Loading Utility
function setLoading(button, isLoading) {
  const textEl = button.querySelector('.btn-text');
  const loaderEl = button.querySelector('.loader');
  
  if (isLoading) {
    button.disabled = true;
    textEl.style.opacity = '0.3';
    loaderEl.classList.remove('hidden');
  } else {
    button.disabled = false;
    textEl.style.opacity = '1';
    loaderEl.classList.add('hidden');
  }
}

// OTP Send Handler
async function handleOtpSend(e) {
  e.preventDefault();
  const email = document.getElementById('otp-email').value.trim();

  // Validate that user exists in localStorage
  const users = getUsers();
  const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!userExists) {
    showToast('Email not registered. Please sign up first.', 'error');
    return;
  }

  setLoading(btnOtpSendSubmit, true);

  try {
    const response = await fetch(`${API_URL}/emails/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyInput.value
      },
      body: JSON.stringify({
        to: email,
        purpose: 'login'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP code');
    }

    showToast('OTP sent successfully! Check your email.', 'success');
    logAction('otp', email, true, `OTP code generated and sent. MessageId: ${data.messageId || 'Simulated'}`);

    // Transition to Step 2
    document.getElementById('otp-verify-email-readonly').value = email;
    formOtpSend.classList.add('hidden');
    formOtpVerify.classList.remove('hidden');
    document.getElementById('otp-code').focus();

  } catch (error) {
    showToast(error.message, 'error');
    logAction('otp', email, false, error.message);
  } finally {
    setLoading(btnOtpSendSubmit, false);
  }
}

// OTP Verify Handler
async function handleOtpVerify(e) {
  e.preventDefault();
  const email = document.getElementById('otp-verify-email-readonly').value.trim();
  const code = document.getElementById('otp-code').value.trim();

  setLoading(btnOtpVerifySubmit, true);

  try {
    const response = await fetch(`${API_URL}/emails/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyInput.value
      },
      body: JSON.stringify({
        to: email,
        code: code,
        purpose: 'login'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid or expired OTP');
    }

    if (data.verified) {
      showToast('OTP verified successfully! Welcome back.', 'success');
      logAction('verify-otp', email, true, `OTP successfully verified.`);

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      sessionStorage.setItem('mailbridge_demo_current_user', JSON.stringify({ name: user.name, email: user.email }));
      setupDashboard(user);

      formOtpSend.reset();
      formOtpVerify.reset();
      switchPage('home');
    } else {
      throw new Error(data.error || 'Verification failed');
    }

  } catch (error) {
    showToast(error.message, 'error');
    logAction('verify-otp', email, false, error.message);
  } finally {
    setLoading(btnOtpVerifySubmit, false);
  }
}

// Playground API Request Handler
async function handlePlaygroundSubmit(e) {
  e.preventDefault();
  
  const endpoint = document.getElementById('play-endpoint').value;
  const to = document.getElementById('play-to').value.trim();
  const btnPlaySubmit = document.getElementById('btn-play-submit');
  const responseContainer = document.getElementById('play-response-container');
  const responseCode = document.getElementById('play-response-code');

  setLoading(btnPlaySubmit, true);
  responseContainer.classList.add('hidden');
  responseCode.textContent = '';

  let body = { to };

  // Collect specific parameters
  if (endpoint === 'welcome') {
    body.name = document.getElementById('play-welcome-name').value.trim();
    body.company = document.getElementById('play-welcome-company').value.trim();
  } else if (endpoint === 'otp') {
    body.purpose = document.getElementById('play-otp-purpose').value.trim();
  } else if (endpoint === 'verify-otp') {
    body.code = document.getElementById('play-verify-code').value.trim();
    body.purpose = document.getElementById('play-verify-purpose').value.trim();
  } else if (endpoint === 'forgot-password') {
    body.resetUrl = document.getElementById('play-forgot-reset-url').value.trim();
  } else if (endpoint === 'notification') {
    body.title = document.getElementById('play-notif-title').value.trim();
    body.message = document.getElementById('play-notif-message').value.trim();
  } else if (endpoint === 'custom') {
    body.subject = document.getElementById('play-custom-subject').value.trim();
    const plainMsg = document.getElementById('play-custom-message').value.trim();
    if (plainMsg) body.message = plainMsg;
    const htmlMsg = document.getElementById('play-custom-html').value.trim();
    if (htmlMsg) body.html = htmlMsg;
  }

  // Sender override options
  const senderOverride = document.getElementById('play-sender-override-toggle').checked;
  if (senderOverride) {
    const fromName = document.getElementById('play-from-name').value.trim();
    const fromEmail = document.getElementById('play-from-email').value.trim();
    if (fromName) body.fromName = fromName;
    if (fromEmail) body.fromEmail = fromEmail;
  }

  try {
    const response = await fetch(`${API_URL}/emails/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyInput.value
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    responseCode.textContent = JSON.stringify(data, null, 2);
    responseContainer.classList.remove('hidden');

    if (!response.ok) {
      throw new Error(data.error || `Failed to execute ${endpoint} API call`);
    }

    showToast(`API Call to /emails/${endpoint} executed successfully!`, 'success');
    logAction(endpoint, to, true, `API Executed. Response: ${data.messageId || JSON.stringify(data)}`);
  } catch (error) {
    showToast(error.message, 'error');
    logAction(endpoint, to, false, error.message);
  } finally {
    setLoading(btnPlaySubmit, false);
  }
}
