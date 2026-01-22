/* ============================================================
   CONFIRMATION PAGE SCRIPT
   ============================================================
   Displays confirmation details retrieved from student
   registration form submission. Pulls data from localStorage
   and populates the confirmation page dynamically.
   
   Features:
   - Loads registration data from localStorage
   - Displays parking assignment (lot and spot)
   - Shows student information (name, ID, email, grade)
   - Conditionally displays shared spot details (partner, schedule)
   - Shows unique reference number with copy functionality
   - Print-friendly layout with optimized print styles
   - Responsive design for mobile/tablet/desktop
   - Toast notifications for user feedback
   - Error handling with fallback messages
   
   Data Source: currentRegistration object in localStorage
   Structure: {fullName, studentId, email, phone, spotType, 
              gradeLevel, parkingLot, parkingSpot, 
              parkingPartner (if shared), userSchedule (if shared),
              submittedAt (ISO string), referenceId}
   
   @version 1.0
   @author MHS Admin
*/

// Global registration data
let registrationData = null;

/**
 * Initialize confirmation page on DOM load
 */
document.addEventListener('DOMContentLoaded', function () {
  loadRegistrationData();
  displayConfirmationData();
  setupPrintButton();
});

/**
 * Load registration data from localStorage
 */
function loadRegistrationData() {
  const saved = localStorage.getItem('currentRegistration');
  
  if (!saved) {
    console.warn('⚠ No registration data found in localStorage');
    showConfirmationError('No registration data found. Please complete the registration form first.');
    return false;
  }

  try {
    registrationData = JSON.parse(saved);
    console.log('✓ Registration data loaded:', registrationData);
    return true;
  } catch (error) {
    console.error('✗ Error parsing registration data:', error);
    showConfirmationError('Error loading registration data. Please try again.');
    return false;
  }
}

/**
 * Display confirmation data on the page
 */
function displayConfirmationData() {
  if (!registrationData) {
    return;
  }

  // Display parking assignment
  displayParkingAssignment();

  // Display student information
  displayStudentInfo();

  // Display reference number
  displayReferenceNumber();

  // Show shared spot info if applicable
  if (registrationData.parkingSpot && registrationData.spotType === 'shared') {
    displaySharedSpotInfo();
  }

  console.log('✓ Confirmation data displayed');
}

/**
 * Display parking lot and spot assignment
 */
function displayParkingAssignment() {
  const lotElement = document.getElementById('confirmLot');
  const spotElement = document.getElementById('confirmSpot');

  if (lotElement && registrationData.parkingLot) {
    lotElement.textContent = registrationData.parkingLot;
  }

  if (spotElement && registrationData.parkingSpot) {
    spotElement.textContent = `#${registrationData.parkingSpot}`;
  }

  console.log(`✓ Parking assignment: ${registrationData.parkingLot} - ${registrationData.parkingSpot}`);
}

/**
 * Display student information
 */
function displayStudentInfo() {
  const nameElement = document.getElementById('confirmName');
  const idElement = document.getElementById('confirmId');
  const emailElement = document.getElementById('confirmEmail');
  const gradeElement = document.getElementById('confirmGrade');

  if (nameElement && registrationData.fullName) {
    nameElement.textContent = registrationData.fullName;
  }

  if (idElement && registrationData.studentId) {
    idElement.textContent = registrationData.studentId;
  }

  if (emailElement && registrationData.email) {
    emailElement.textContent = registrationData.email;
  }

  if (gradeElement && registrationData.gradeLevel) {
    gradeElement.textContent = registrationData.gradeLevel;
  }

  console.log('✓ Student information displayed');
}

/**
 * Display shared spot information
 */
function displaySharedSpotInfo() {
  const sharedSection = document.getElementById('sharedSpotInfo');
  const daysElement = document.getElementById('confirmDays');
  const partnerElement = document.getElementById('confirmPartner');

  if (sharedSection) {
    sharedSection.style.display = 'block';
  }

  if (daysElement && registrationData.userSchedule) {
    daysElement.textContent = registrationData.userSchedule;
  }

  if (partnerElement && registrationData.parkingPartner) {
    partnerElement.textContent = registrationData.parkingPartner;
  }

  console.log('✓ Shared spot information displayed');
}

/**
 * Display reference number
 */
function displayReferenceNumber() {
  const refElement = document.getElementById('confirmReference');

  if (refElement && registrationData.referenceId) {
    refElement.textContent = registrationData.referenceId;
  }

  console.log(`✓ Reference ID: ${registrationData.referenceId}`);
}

/**
 * Setup print button functionality
 */
function setupPrintButton() {
  const printBtn = document.getElementById('printBtn');

  if (printBtn) {
    printBtn.addEventListener('click', function () {
      console.log('→ Printing confirmation page...');
      window.print();
    });
  }
}

/**
 * Show confirmation error message
 */
function showConfirmationError(message) {
  const mainContent = document.querySelector('main');
  
  if (mainContent) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-4';
    errorAlert.setAttribute('role', 'alert');
    errorAlert.innerHTML = `
      <strong>Error:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    mainContent.insertBefore(errorAlert, mainContent.firstChild);
  }

  console.error('✗ Confirmation error:', message);
}

/**
 * Clear registration data (for testing/reset)
 */
function clearRegistrationData() {
  localStorage.removeItem('currentRegistration');
  localStorage.removeItem('selectedParkingSpot');
  registrationData = null;
  console.log('✓ Registration data cleared');
}

/**
 * Get formatted confirmation summary for sharing
 */
function getConfirmationSummary() {
  if (!registrationData) return '';

  let summary = `Parking Confirmation\n`;
  summary += `================================\n\n`;
  summary += `Reference: ${registrationData.referenceId}\n\n`;
  summary += `Student: ${registrationData.fullName}\n`;
  summary += `ID: ${registrationData.studentId}\n`;
  summary += `Email: ${registrationData.email}\n\n`;
  summary += `Parking Assignment:\n`;
  summary += `Lot: ${registrationData.parkingLot}\n`;
  summary += `Spot: ${registrationData.parkingSpot}\n`;

  if (registrationData.spotType === 'shared') {
    summary += `Type: Shared\n`;
    summary += `Your Days: ${registrationData.userSchedule}\n`;
    summary += `Partner: ${registrationData.parkingPartner}\n`;
  }

  summary += `\nSubmitted: ${new Date(registrationData.submittedAt).toLocaleString()}\n`;

  return summary;
}

/**
 * Copy confirmation summary to clipboard
 */
function copyConfirmationToClipboard() {
  const summary = getConfirmationSummary();
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(summary).then(() => {
      console.log('✓ Confirmation copied to clipboard');
      showToast('Confirmation copied to clipboard!');
    }).catch(err => {
      console.error('✗ Failed to copy to clipboard:', err);
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = summary;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    console.log('✓ Confirmation copied to clipboard (fallback)');
    showToast('Confirmation copied to clipboard!');
  }
}

/**
 * Show temporary toast notification
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'alert alert-success alert-dismissible fade show';
  toast.setAttribute('role', 'alert');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.style.maxWidth = '300px';
  toast.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
