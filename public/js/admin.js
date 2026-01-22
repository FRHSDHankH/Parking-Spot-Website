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
    
    // Initialize dashboard after a brief delay to ensure DOM is ready
    setTimeout(initializeDashboard, 100);
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

/* ============================================================
   DASHBOARD FUNCTIONALITY
   ============================================================ */

let parkingData = null;
let studentSubmissions = [];

/**
 * Initialize dashboard on page load
 * (called after session check in checkAdminSession)
 */
function initializeDashboard() {
  const dashboardScreen = document.getElementById(DASHBOARD_SCREEN_ID);
  
  if (dashboardScreen && dashboardScreen.style.display === 'block') {
    loadParkingData();
    loadStudentSubmissions();
    calculateStatistics();
    setupDashboardButtons();
    setupTableActions();
    setupLotFilter();
    console.log('✓ Dashboard initialized');
  }
}

/**
 * Load parking data from JSON file
 */
function loadParkingData() {
  fetch('public/data/parkingData.json')
    .then(response => response.json())
    .then(data => {
      parkingData = data;
      console.log('✓ Parking data loaded');
      populateSpotTable();
    })
    .catch(error => {
      console.error('✗ Error loading parking data:', error);
      showToastMessage('Error loading parking data', 'error');
    });
}

/**
 * Load student submissions from localStorage
 */
function loadStudentSubmissions() {
  const submissions = localStorage.getItem('parkingSubmissions');
  
  if (submissions) {
    try {
      studentSubmissions = JSON.parse(submissions);
      console.log('✓ Student submissions loaded:', studentSubmissions.length);
    } catch (error) {
      console.error('✗ Error parsing submissions:', error);
      studentSubmissions = [];
    }
  } else {
    studentSubmissions = [];
    console.log('→ No student submissions found');
  }
  
  populateStudentTable();
}

/**
 * Calculate and display statistics
 */
function calculateStatistics() {
  let totalSpots = 0;
  let takenSpots = 0;
  let availableSpots = 0;
  
  // Count spots from parking data
  if (parkingData) {
    Object.values(parkingData).forEach(lot => {
      lot.spots.forEach(spot => {
        totalSpots++;
        if (spot.status === 'taken') {
          takenSpots++;
        } else if (spot.status === 'available') {
          availableSpots++;
        }
      });
    });
  }
  
  // Display statistics
  const totalSpotsEl = document.getElementById('totalSpots');
  const availableSpotsEl = document.getElementById('availableSpots');
  const takenSpotsEl = document.getElementById('takenSpots');
  const registrationsEl = document.getElementById('totalRegistrations');
  
  if (totalSpotsEl) totalSpotsEl.textContent = totalSpots;
  if (availableSpotsEl) availableSpotsEl.textContent = availableSpots;
  if (takenSpotsEl) takenSpotsEl.textContent = takenSpots;
  if (registrationsEl) registrationsEl.textContent = studentSubmissions.length;
  
  console.log(`✓ Statistics: Total=${totalSpots}, Available=${availableSpots}, Taken=${takenSpots}, Registrations=${studentSubmissions.length}`);
}

/**
 * Populate student registration table
 */
function populateStudentTable() {
  const tableBody = document.getElementById('studentTableBody');
  const noStudentsMsg = document.getElementById('noStudentsMsg');
  
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  if (studentSubmissions.length === 0) {
    // Show no students message
    if (noStudentsMsg) noStudentsMsg.style.display = 'block';
    console.log('→ No student data to display');
    return;
  }
  
  // Hide no students message
  if (noStudentsMsg) noStudentsMsg.style.display = 'none';
  
  // Populate table rows
  studentSubmissions.forEach((student, index) => {
    const row = document.createElement('tr');
    row.dataset.index = index;
    
    const partnerName = student.parkingPartner || '-';
    const spotType = student.spotType || 'Solo';
    const spotDisplay = `${student.parkingLot}-${student.parkingSpot}`;
    
    row.innerHTML = `
      <td><strong>${student.fullName}</strong></td>
      <td>${student.studentId}</td>
      <td><small>${student.email}</small></td>
      <td>${spotDisplay}</td>
      <td>${partnerName}</td>
      <td><span class="badge ${spotType === 'Shared' ? 'badge-shared' : 'badge-available'}">${spotType}</span></td>
      <td>
        <button class="btn btn-sm btn-info btn-copy" title="Copy student info">📋</button>
        <button class="btn btn-sm btn-danger btn-remove" title="Remove student">🗑️</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  console.log(`✓ Student table populated with ${studentSubmissions.length} entries`);
}

/**
 * Populate parking spots table
 */
function populateSpotTable() {
  const tableBody = document.getElementById('spotTableBody');
  
  if (!tableBody || !parkingData) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Populate table rows from all lots
  Object.entries(parkingData).forEach(([lotKey, lot]) => {
    lot.spots.forEach(spot => {
      const row = document.createElement('tr');
      row.dataset.lotKey = lotKey;
      row.dataset.spotId = spot.id;
      
      const statusBadge = `<span class="badge badge-${spot.status}">${spot.status}</span>`;
      const assignedTo = spot.assignedTo || '-';
      
      row.innerHTML = `
        <td><strong>${spot.id}</strong></td>
        <td>${lot.name}</td>
        <td>${statusBadge}</td>
        <td>${assignedTo}</td>
        <td><span class="badge ${spot.type === 'shared' ? 'badge-shared' : 'badge-available'}">${spot.type}</span></td>
        <td>
          <button class="btn btn-sm btn-warning btn-clear" title="Clear spot">🔄</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  });
  
  console.log('✓ Spot table populated');
}

/**
 * Setup dashboard control buttons
 */
function setupDashboardButtons() {
  const refreshBtn = document.getElementById('refreshBtn');
  const resetAllBtn = document.getElementById('resetAllBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      console.log('→ Refreshing dashboard data...');
      loadParkingData();
      loadStudentSubmissions();
      calculateStatistics();
      showToastMessage('Dashboard refreshed', 'success');
    });
  }
  
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', function () {
      const confirmed = confirm('⚠️ WARNING: This will delete ALL student registrations and reset all parking spots. This action cannot be undone. Are you sure?');
      
      if (confirmed) {
        const finalConfirm = confirm('Are you REALLY sure? All data will be permanently deleted.');
        
        if (finalConfirm) {
          // Reset parking data
          if (parkingData) {
            Object.values(parkingData).forEach(lot => {
              lot.spots.forEach(spot => {
                spot.status = 'available';
                spot.assignedTo = null;
              });
            });
          }
          
          // Clear student submissions
          localStorage.removeItem('parkingSubmissions');
          localStorage.removeItem('currentRegistration');
          
          studentSubmissions = [];
          
          // Refresh display
          loadParkingData();
          calculateStatistics();
          populateStudentTable();
          
          showToastMessage('All data has been reset', 'success');
          console.log('✓ All data reset');
        }
      }
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      exportDataAsJSON();
    });
  }
}

/**
 * Setup table action buttons
 */
function setupTableActions() {
  // Student table actions
  document.addEventListener('click', function (e) {
    // Copy student info button
    if (e.target.closest('.btn-copy')) {
      const row = e.target.closest('tr');
      const index = parseInt(row.dataset.index);
      const student = studentSubmissions[index];
      
      if (student) {
        const summary = `
Name: ${student.fullName}
ID: ${student.studentId}
Email: ${student.email}
Phone: ${student.phone || 'N/A'}
Parking Spot: ${student.parkingLot}-${student.parkingSpot}
Spot Type: ${student.spotType}
Grade: ${student.gradeLevel}
Reference: ${student.referenceId}
        `.trim();
        
        copyToClipboard(summary);
        showToastMessage('Student info copied to clipboard', 'success');
      }
    }
    
    // Remove student button
    if (e.target.closest('.btn-remove')) {
      const row = e.target.closest('tr');
      const index = parseInt(row.dataset.index);
      const student = studentSubmissions[index];
      
      if (student && confirm(`Remove registration for ${student.fullName}?`)) {
        studentSubmissions.splice(index, 1);
        localStorage.setItem('parkingSubmissions', JSON.stringify(studentSubmissions));
        
        populateStudentTable();
        calculateStatistics();
        
        showToastMessage('Student removed successfully', 'success');
        console.log('✓ Student removed');
      }
    }
    
    // Clear spot button
    if (e.target.closest('.btn-clear')) {
      const row = e.target.closest('tr');
      const lotKey = row.dataset.lotKey;
      const spotId = row.dataset.spotId;
      
      if (confirm(`Clear parking spot ${spotId}?`)) {
        if (parkingData && parkingData[lotKey]) {
          const spot = parkingData[lotKey].spots.find(s => s.id === spotId);
          if (spot) {
            spot.status = 'available';
            spot.assignedTo = null;
            
            // Remove student with this spot
            const studentIndex = studentSubmissions.findIndex(s => s.parkingSpot === spotId);
            if (studentIndex !== -1) {
              studentSubmissions.splice(studentIndex, 1);
              localStorage.setItem('parkingSubmissions', JSON.stringify(studentSubmissions));
            }
            
            populateSpotTable();
            populateStudentTable();
            calculateStatistics();
            
            showToastMessage(`Spot ${spotId} cleared`, 'success');
            console.log('✓ Spot cleared');
          }
        }
      }
    }
  });
}

/**
 * Setup lot filter for spots table
 */
function setupLotFilter() {
  const filter = document.getElementById('spotLotFilter');
  
  if (filter) {
    filter.addEventListener('change', function () {
      const selectedLot = this.value;
      const tableBody = document.getElementById('spotTableBody');
      
      if (!tableBody) return;
      
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const lotKey = row.dataset.lotKey;
        const lot = parkingData[lotKey];
        const lotName = lot ? lot.name : '';
        
        if (selectedLot === '' || lotName === selectedLot) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
      
      console.log(`✓ Filtered spots by lot: ${selectedLot || 'All'}`);
    });
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Clipboard copy failed:', err);
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textarea);
}

/**
 * Export all data as JSON file
 */
function exportDataAsJSON() {
  const exportData = {
    exportDate: new Date().toISOString(),
    parkingData: parkingData,
    studentSubmissions: studentSubmissions,
    statistics: {
      totalRegistrations: studentSubmissions.length,
      exportedSpots: parkingData ? Object.values(parkingData).reduce((sum, lot) => sum + lot.spots.length, 0) : 0
    }
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `mhs-parking-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToastMessage('Data exported successfully', 'success');
  console.log('✓ Data exported');
}
