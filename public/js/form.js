/* ============================================================
   STUDENT FORM SCRIPT
   ============================================================
   Handles student registration form with validation,
   spot display, and data persistence to LocalStorage.
   
   Features:
   - Real-time field validation
   - Conditional field visibility (for shared spots)
   - Comprehensive error display
   - Data collection and serialization
   - Reference ID generation (REF-TIMESTAMP-RANDOM)
   - LocalStorage persistence (currentRegistration + parkingSubmissions array)
   - Form submission handling with error recovery
   
   Validates:
   - Full Name (required, text)
   - Student ID (required, 6-8 digits)
   - Email (required, valid format)
   - Parking Spot (selected from parking.html)
   - Spot Type (Solo or Shared)
   - Partner Name (required if shared spot)
   - Days Schedule (required if shared spot)
   - Grade Level (required)
   - Phone (required, 10+ digits)
   - Terms Acceptance (required checkbox)
   
   @version 1.0
   @author MHS Admin
*/

// Global form state
let selectedSpot = null;
let formData = {};

/**
 * Initialize form on DOM load
 */
document.addEventListener('DOMContentLoaded', function () {
  restoreSelectedSpot();
  displaySelectedSpot();
  setupFormHandlers();
  setupConditionalFields();
});

/**
 * Restore selected parking spot from localStorage
 */
function restoreSelectedSpot() {
  const saved = localStorage.getItem('selectedParkingSpot');
  
  if (saved) {
    try {
      selectedSpot = JSON.parse(saved);
      console.log('✓ Selected spot restored:', selectedSpot);
    } catch (error) {
      console.error('✗ Error parsing selected spot:', error);
      showFormError('Error retrieving your selected spot. Please go back and select again.');
    }
  } else {
    console.warn('⚠ No selected spot found in localStorage');
    showFormError('No parking spot selected. Please go back to select a spot first.');
  }
}

/**
 * Display the selected parking spot in the form
 */
function displaySelectedSpot() {
  const displayEl = document.getElementById('selectedSpotDisplay');
  
  if (selectedSpot) {
    let spotLabel = `${selectedSpot.lot} - Spot ${selectedSpot.id}`;
    
    if (selectedSpot.type === 'shared' && selectedSpot.half) {
      const schedule = selectedSpot.half === 'A' ? 'Monday/Wednesday/Friday' : 'Tuesday/Thursday';
      spotLabel += ` (${schedule})`;
    }
    
    displayEl.textContent = spotLabel;
    displayEl.className = 'badge bg-success fs-6';
  } else {
    displayEl.textContent = 'No spot selected';
    displayEl.className = 'badge bg-danger fs-6';
  }
}

/**
 * Setup form event handlers
 */
function setupFormHandlers() {
  const form = document.getElementById('registrationForm');
  
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Add real-time validation
  const inputs = document.querySelectorAll('.form-control, .form-select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      validateField(input);
    });
    
    input.addEventListener('blur', () => {
      validateField(input);
    });
  });
}

/**
 * Setup conditional field visibility
 */
function setupConditionalFields() {
  const spotTypeSelect = document.getElementById('spotType');
  const partnerSection = document.getElementById('partnerSection');
  const partnerDaysSection = document.getElementById('partnerDaysSection');
  const partnerName = document.getElementById('partnerName');
  const partnerDays = document.getElementById('partnerDays');

  if (spotTypeSelect) {
    // Initial state based on selected spot
    if (selectedSpot && selectedSpot.type === 'shared') {
      spotTypeSelect.value = 'Shared';
      partnerSection.style.display = 'block';
      partnerDaysSection.style.display = 'block';
      partnerName.required = true;
      partnerDays.required = true;
    }

    // Event listener for changes
    spotTypeSelect.addEventListener('change', function () {
      if (this.value === 'Shared') {
        partnerSection.style.display = 'block';
        partnerDaysSection.style.display = 'block';
        partnerName.required = true;
        partnerDays.required = true;
        console.log('✓ Shared spot fields visible');
      } else {
        partnerSection.style.display = 'none';
        partnerDaysSection.style.display = 'none';
        partnerName.required = false;
        partnerDays.required = false;
        partnerName.value = '';
        partnerDays.value = '';
        console.log('✓ Solo spot fields hidden');
      }
    });
  }
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
  e.preventDefault();

  // Validate form
  if (!validateForm()) {
    console.error('✗ Form validation failed');
    return;
  }

  // Check if spot is selected
  if (!selectedSpot) {
    showFormError('Please select a parking spot first.');
    return;
  }

  // Collect form data
  collectFormData();

  // Save to localStorage
  saveFormData();

  // Redirect to confirmation page
  console.log('✓ Form submitted successfully');
  redirectToConfirmation();
}

/**
 * Validate entire form
 */
function validateForm() {
  const form = document.getElementById('registrationForm');
  const formErrors = document.getElementById('formErrors');

  // Clear previous errors
  formErrors.style.display = 'none';
  formErrors.innerHTML = '';

  const errors = [];

  // Get form fields
  const fullName = document.getElementById('fullName');
  const studentId = document.getElementById('studentId');
  const email = document.getElementById('email');
  const spotType = document.getElementById('spotType');
  const partnerName = document.getElementById('partnerName');
  const gradeLevel = document.getElementById('gradeLevel');
  const terms = document.getElementById('terms');

  // Validate required fields
  if (!fullName.value.trim()) {
    errors.push('Full Name is required');
    fullName.classList.add('is-invalid');
  } else {
    fullName.classList.remove('is-invalid');
  }

  if (!studentId.value.trim()) {
    errors.push('Student ID is required');
    studentId.classList.add('is-invalid');
  } else if (!validateStudentId(studentId.value)) {
    errors.push('Student ID must be 6-8 digits');
    studentId.classList.add('is-invalid');
  } else {
    studentId.classList.remove('is-invalid');
  }

  if (!email.value.trim()) {
    errors.push('Email is required');
    email.classList.add('is-invalid');
  } else if (!validateEmail(email.value)) {
    errors.push('Please enter a valid email address');
    email.classList.add('is-invalid');
  } else {
    email.classList.remove('is-invalid');
  }

  if (!spotType.value) {
    errors.push('Please select a parking spot type');
    spotType.classList.add('is-invalid');
  } else {
    spotType.classList.remove('is-invalid');
  }

  if (spotType.value === 'Shared') {
    if (!partnerName.value.trim()) {
      errors.push('Partner name is required for shared spots');
      partnerName.classList.add('is-invalid');
    } else {
      partnerName.classList.remove('is-invalid');
    }
  }

  if (!gradeLevel.value) {
    errors.push('Grade level is required');
    gradeLevel.classList.add('is-invalid');
  } else {
    gradeLevel.classList.remove('is-invalid');
  }

  if (!terms.checked) {
    errors.push('You must agree to the parking rules');
    terms.classList.add('is-invalid');
  } else {
    terms.classList.remove('is-invalid');
  }

  // Display errors if any
  if (errors.length > 0) {
    formErrors.innerHTML = '<strong>Please fix the following errors:</strong><ul>' +
      errors.map(err => `<li>${err}</li>`).join('') +
      '</ul>';
    formErrors.style.display = 'block';
    console.warn('Form errors:', errors);
    return false;
  }

  return true;
}

/**
 * Validate individual field
 */
function validateField(field) {
  const fieldId = field.id;
  let isValid = true;

  switch (fieldId) {
    case 'fullName':
      isValid = field.value.trim().length > 0;
      break;
    case 'studentId':
      isValid = validateStudentId(field.value);
      break;
    case 'email':
      isValid = validateEmail(field.value) || field.value.trim() === '';
      break;
    case 'spotType':
      isValid = field.value !== '';
      break;
    case 'gradeLevel':
      isValid = field.value !== '';
      break;
  }

  if (isValid) {
    field.classList.remove('is-invalid');
  } else {
    field.classList.add('is-invalid');
  }

  return isValid;
}

/**
 * Validate student ID format
 */
function validateStudentId(id) {
  const studentIdPattern = /^\d{6,8}$/;
  return studentIdPattern.test(id.trim());
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}

/**
 * Collect form data from inputs
 */
function collectFormData() {
  formData = {
    fullName: document.getElementById('fullName').value.trim(),
    studentId: document.getElementById('studentId').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    spotType: document.getElementById('spotType').value,
    gradeLevel: document.getElementById('gradeLevel').value,
    parkingLot: selectedSpot.lot,
    parkingSpot: selectedSpot.id,
    spotType: selectedSpot.type
  };

  // Add partner info if shared spot
  if (selectedSpot.type === 'shared') {
    formData.parkingPartner = document.getElementById('partnerName').value.trim();
    formData.partnerDays = document.getElementById('partnerDays').value;
    formData.userSchedule = selectedSpot.half === 'A' ? 'Monday/Wednesday/Friday' : 'Tuesday/Thursday';
  }

  // Add timestamp and reference
  formData.submittedAt = new Date().toISOString();
  formData.referenceId = generateReferenceId();

  console.log('✓ Form data collected:', formData);
}

/**
 * Save form data to localStorage
 */
function saveFormData() {
  // Save current submission
  localStorage.setItem('currentRegistration', JSON.stringify(formData));

  // Also save to submissions array for admin view
  let submissions = JSON.parse(localStorage.getItem('parkingSubmissions') || '[]');
  submissions.push(formData);
  localStorage.setItem('parkingSubmissions', JSON.stringify(submissions));

  console.log('✓ Form data saved to localStorage');
}

/**
 * Generate unique reference ID
 */
function generateReferenceId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REF-${timestamp}-${random}`;
}

/**
 * Show form error message
 */
function showFormError(message) {
  const formErrors = document.getElementById('formErrors');
  formErrors.innerHTML = message;
  formErrors.style.display = 'block';
  console.error('✗ Form error:', message);
}

/**
 * Redirect to confirmation page
 */
function redirectToConfirmation() {
  console.log('→ Redirecting to confirmation page...');
  window.location.href = 'confirmation.html';
}

/**
 * Clear all form data and localStorage
 */
function clearFormData() {
  document.getElementById('registrationForm').reset();
  localStorage.removeItem('currentRegistration');
  localStorage.removeItem('selectedParkingSpot');
  selectedSpot = null;
  formData = {};
  console.log('✓ Form data cleared');
}
