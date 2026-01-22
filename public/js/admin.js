/* ============================================================
   ADMIN PAGE SCRIPT
   ============================================================
   Handles admin authentication, session management, and
   provides secure access to the admin dashboard.
*/

// Admin configuration
const ADMIN_SESSION_KEY = 'adminSession';
const LOGIN_SCREEN_ID = 'loginScreen';
const DASHBOARD_SCREEN_ID = 'dashboardScreen';

/**
 * Initialize admin page on DOM load
 */
document.addEventListener('DOMContentLoaded', function () {
  checkAdminSession();
  setupLoginFormListener();
  setupLogoutButtonListener();
  applyTheme();
});

/**
 * Check if admin session exists and show appropriate screen
 */
function checkAdminSession() {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  const loginScreen = document.getElementById(LOGIN_SCREEN_ID);
  const dashboardScreen = document.getElementById(DASHBOARD_SCREEN_ID);

  if (session && isSessionValid(session)) {
    // Session exists and is valid - show dashboard
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'block';
    console.log('✓ Valid admin session found');
  } else {
    // No valid session - show login screen
    if (loginScreen) loginScreen.style.display = 'block';
    if (dashboardScreen) dashboardScreen.style.display = 'none';
    clearAdminSession();
    console.log('→ No valid session, showing login screen');
  }
}

/**
 * Setup login form event listener
 */
function setupLoginFormListener() {
  const loginForm = document.getElementById('adminLoginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleAdminLogin();
    });
  }
}

/**
 * Setup logout button event listener
 */
function setupLogoutButtonListener() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleAdminLogout();
    });
  }
}

/**
 * Handle admin login attempt
 */
function handleAdminLogin() {
  const passwordInput = document.getElementById('adminPassword');
  const errorDiv = document.getElementById('loginError');
  const password = passwordInput ? passwordInput.value.trim() : '';

  // Clear previous error
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }

  // Validate password input
  if (!password) {
    showLoginError('Please enter a password.', errorDiv);
    console.warn('⚠ Login attempt with empty password');
    return;
  }

  // Fetch config to get correct password
  fetch('public/data/config.json')
    .then(response => response.json())
    .then(config => {
      const correctPassword = config.adminPassword;

      // Verify password
      if (password === correctPassword) {
        // Password correct - create session
        createAdminSession();
        console.log('✓ Admin login successful');
        
        // Clear password field and show dashboard
        if (passwordInput) passwordInput.value = '';
        checkAdminSession();
      } else {
        // Password incorrect
        showLoginError('Invalid password. Please try again.', errorDiv);
        console.warn('✗ Admin login failed - incorrect password');
        
        // Clear password field for security
        if (passwordInput) passwordInput.value = '';
        if (passwordInput) passwordInput.focus();
      }
    })
    .catch(error => {
      console.error('✗ Error loading config:', error);
      showLoginError('Error loading system configuration. Please refresh the page.', errorDiv);
    });
}

/**
 * Create admin session in localStorage
 */
function createAdminSession() {
  const sessionData = {
    authenticated: true,
    loginTime: new Date().toISOString(),
    sessionId: generateSessionId()
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Check if session is valid
 * @param {string} sessionData - JSON string of session data
 * @returns {boolean} - True if session is valid
 */
function isSessionValid(sessionData) {
  try {
    const session = JSON.parse(sessionData);
    
    // Check if session has required fields
    if (!session.authenticated || !session.loginTime) {
      return false;
    }

    // Session is valid (no expiration time set for now)
    return true;
  } catch (error) {
    console.error('✗ Error parsing session data:', error);
    return false;
  }
}

/**
 * Generate unique session ID
 * @returns {string} - Session ID
 */
function generateSessionId() {
  return 'SESSION-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Handle admin logout
 */
function handleAdminLogout() {
  const confirmed = confirm('Are you sure you want to logout?');

  if (confirmed) {
    clearAdminSession();
    console.log('✓ Admin logged out successfully');
    
    // Show login screen
    checkAdminSession();
    
    // Show logout confirmation
    showToastMessage('You have been logged out.', 'success');
  }
}

/**
 * Clear admin session from localStorage
 */
function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  console.log('✓ Admin session cleared');
}

/**
 * Show login error message
 * @param {string} message - Error message
 * @param {HTMLElement} errorDiv - Error display element
 */
function showLoginError(message, errorDiv) {
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

/**
 * Show toast notification message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showToastMessage(message, type = 'info') {
  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-success' : 
                  type === 'error' ? 'bg-danger' : 'bg-info';
  
  toast.className = `alert ${bgClass} alert-dismissible fade show`;
  toast.setAttribute('role', 'alert');
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.style.minWidth = '300px';
  toast.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(toast);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/**
 * Apply current theme to admin page
 */
function applyTheme() {
  if (window.ThemeManager) {
    const currentMode = window.ThemeManager.getCurrentMode();
    document.body.classList.toggle('dark-mode', currentMode === 'dark');
  }
}
