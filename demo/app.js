// Configuration
const API_URL = 'http://localhost:5000/api/v1';
const DEFAULT_API_KEY = 'mb_1dd8f478be6f69da6431c69133fb2374';

// DOM Pages
const pageLogin = document.getElementById('page-login');
const pageRegister = document.getElementById('page-register');
const pageHome = document.getElementById('page-home');
const pageAdmin = document.getElementById('page-admin');

// DOM Forms & Buttons
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

const linkToRegister = document.getElementById('link-to-register');
const linkToLogin = document.getElementById('link-to-login');
const btnLogout = document.getElementById('btn-logout');
const btnToAdmin = document.getElementById('btn-to-admin');
const btnAdminBack = document.getElementById('btn-admin-back');

const btnLoginSubmit = document.getElementById('btn-login-submit');
const btnRegisterSubmit = document.getElementById('btn-register-submit');

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
  btnSendTest.addEventListener('click', handleSendTest);
});

// Navigation / View Router
function switchPage(pageId) {
  pageLogin.classList.remove('active');
  pageRegister.classList.remove('active');
  pageHome.classList.remove('active');
  pageAdmin.classList.remove('active');

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
