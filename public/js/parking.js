/* ============================================================
   PARKING PAGE SCRIPT
   ============================================================
   Handles parking lot data loading, spot selection,
   lot switching, and LocalStorage persistence.
   
   Features:
   - Loads parking lot data from JSON
   - Dynamic spot rendering with status (available/taken)
   - Supports solo and shared spot types
   - Lot switching (A, B, C)
   - Spot selection with visual feedback
   - LocalStorage persistence of selected spot
   - Availability statistics display
   
   @version 1.0
   @author MHS Admin
*/

// Global variables
let parkingData = {};
let currentLot = 'Lot A';
let selectedSpot = null;

/**
 * Initialize parking page on DOM load
 */
document.addEventListener('DOMContentLoaded', function () {
  loadParkingData();
  restoreSelectedSpot();
  setupEventListeners();
});

/**
 * Load parking data from JSON file
 */
function loadParkingData() {
  fetch('public/data/parkingData.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load parking data');
      }
      return response.json();
    })
    .then(data => {
      parkingData = data;
      console.log('✓ Parking data loaded successfully');
      renderLot(currentLot);
      updateAvailabilityStats();
    })
    .catch(error => {
      console.error('✗ Error loading parking data:', error);
      showErrorMessage('Failed to load parking data. Please refresh the page.');
    });
}

/**
 * Render a specific parking lot
 * @param {string} lot - Lot identifier (e.g., 'Lot A')
 */
function renderLot(lot) {
  const lotKey = lot.toLowerCase().replace(' ', '');
  
  if (!parkingData[lotKey]) {
    console.error('✗ Lot not found:', lot);
    return;
  }

  currentLot = lot;
  const spots = parkingData[lotKey].spots || [];
  
  const container = document.getElementById('parkingLot');
  if (!container) return;

  // Clear previous grid
  container.innerHTML = '';

  // Render each spot
  spots.forEach((spot, index) => {
    const spotElement = createSpotElement(spot);
    container.appendChild(spotElement);
    
    // Stagger animation
    spotElement.style.animationDelay = `${index * 0.05}s`;
  });

  // Update lot buttons
  updateLotButtons(lot);
  updateAvailabilityStats();
}

/**
 * Create a parking spot DOM element
 * @param {object} spot - Spot data object
 * @returns {HTMLElement} Spot element
 */
function createSpotElement(spot) {
  const spotElement = document.createElement('div');
  spotElement.className = `parking-spot ${spot.status} ${spot.type}`;
  spotElement.id = `spot-${spot.id}`;

  // Check if this spot is currently selected
  if (selectedSpot && selectedSpot.id === spot.id && selectedSpot.lot === currentLot) {
    spotElement.classList.add('selected');
  }

  // Render spot content
  if (spot.type === 'shared') {
    // Shared spot with two halves
    const half1 = createSpotHalf(spot, 'A', spot.status);
    const half2 = createSpotHalf(spot, 'B', spot.status);
    spotElement.appendChild(half1);
    spotElement.appendChild(half2);
  } else {
    // Solo spot with single clickable area
    const half = createSpotHalf(spot, null, spot.status);
    half.style.height = '100%';
    half.style.borderBottom = 'none';
    spotElement.appendChild(half);
  }

  return spotElement;
}

/**
 * Create a parking spot half (for shared) or full area (for solo)
 * @param {object} spot - Spot data
 * @param {string|null} half - Half identifier ('A', 'B', or null for solo)
 * @param {string} status - Spot status ('available' or 'taken')
 * @returns {HTMLElement} Half element
 */
function createSpotHalf(spot, half, status) {
  const halfElement = document.createElement('div');
  halfElement.className = 'parking-spot-half';
  
  // Create label
  const label = half ? `${spot.id} ${half}` : spot.id;
  halfElement.innerHTML = `<span>${label}</span>`;

  // Set cursor based on availability
  halfElement.style.cursor = status === 'taken' ? 'not-allowed' : 'pointer';

  // Add click handler for available spots
  if (status !== 'taken') {
    halfElement.addEventListener('click', () => {
      selectSpot(spot, half);
    });
  }

  return halfElement;
}

/**
 * Select a parking spot
 * @param {object} spot - Spot data
 * @param {string|null} half - Half identifier for shared spots
 */
function selectSpot(spot, half = null) {
  // Deselect previous spot visually
  if (selectedSpot) {
    const prevElement = document.getElementById(`spot-${selectedSpot.id}`);
    if (prevElement) {
      prevElement.classList.remove('selected');
    }
  }

  // Store new selection
  selectedSpot = {
    id: spot.id,
    lot: currentLot,
    type: spot.type,
    half: half
  };

  // Update UI
  const spotElement = document.getElementById(`spot-${spot.id}`);
  if (spotElement) {
    spotElement.classList.add('selected');
  }

  // Update display
  updateSelectedSpotDisplay();
  saveSelectedSpot();
  enableContinueButton();

  console.log('✓ Spot selected:', selectedSpot);
}

/**
 * Update the selected spot alert display
 */
function updateSelectedSpotDisplay() {
  const alert = document.getElementById('selectedSpotAlert');
  const spotText = document.getElementById('selectedSpotText');

  if (selectedSpot) {
    let spotLabel = `${selectedSpot.lot} - Spot ${selectedSpot.id}`;
    
    if (selectedSpot.half) {
      const schedule = selectedSpot.half === 'A' ? 'Mon/Wed/Fri' : 'Tue/Thu';
      spotLabel += ` (${selectedSpot.half} - ${schedule})`;
    }
    
    spotText.textContent = spotLabel;
    alert.style.display = 'block';
  } else {
    alert.style.display = 'none';
  }
}

/**
 * Save selected spot to LocalStorage
 */
function saveSelectedSpot() {
  if (selectedSpot) {
    localStorage.setItem('selectedParkingSpot', JSON.stringify(selectedSpot));
    localStorage.setItem('selectedParkingSpotTime', new Date().toISOString());
    console.log('✓ Selected spot saved to LocalStorage');
  }
}

/**
 * Restore selected spot from LocalStorage
 */
function restoreSelectedSpot() {
  const saved = localStorage.getItem('selectedParkingSpot');
  
  if (saved) {
    try {
      selectedSpot = JSON.parse(saved);
      console.log('✓ Selected spot restored from LocalStorage:', selectedSpot);
    } catch (error) {
      console.error('✗ Error parsing saved spot:', error);
      localStorage.removeItem('selectedParkingSpot');
    }
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  setupLotButtons();
  setupContinueButton();
}

/**
 * Setup lot button click handlers
 */
function setupLotButtons() {
  const lotButtons = document.querySelectorAll('.lot-btn');
  
  lotButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedLot = e.target.dataset.lot;
      
      // Update active button
      lotButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Render selected lot
      renderLot(selectedLot);
      
      console.log('✓ Switched to lot:', selectedLot);
    });
  });
}

/**
 * Setup continue button
 */
function setupContinueButton() {
  const continueBtn = document.getElementById('continueBtn');
  
  if (continueBtn) {
    // Enable if spot already selected
    if (selectedSpot) {
      continueBtn.disabled = false;
    }
    
    // Handle click
    continueBtn.addEventListener('click', (e) => {
      if (!selectedSpot) {
        e.preventDefault();
        showErrorMessage('Please select a parking spot first.');
      }
    });
  }
}

/**
 * Enable continue button when spot is selected
 */
function enableContinueButton() {
  const continueBtn = document.getElementById('continueBtn');
  
  if (continueBtn) {
    continueBtn.disabled = false;
  }
}

/**
 * Update lot button styles
 * @param {string} lot - Currently selected lot
 */
function updateLotButtons(lot) {
  const lotButtons = document.querySelectorAll('.lot-btn');
  
  lotButtons.forEach(btn => {
    if (btn.dataset.lot === lot) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Update and display availability statistics
 */
function updateAvailabilityStats() {
  const lotKey = currentLot.toLowerCase().replace(' ', '');
  if (!parkingData[lotKey]) return;

  const spots = parkingData[lotKey].spots;
  const totalSpots = spots.length;
  const takenSpots = spots.filter(s => s.status === 'taken').length;
  const availableSpots = totalSpots - takenSpots;
  const availabilityPercent = Math.round((availableSpots / totalSpots) * 100);

  // Log to console
  console.log(`${currentLot}: ${availableSpots}/${totalSpots} available (${availabilityPercent}%)`);
}

/**
 * Clear selected spot from LocalStorage
 */
function clearSelectedSpot() {
  selectedSpot = null;
  localStorage.removeItem('selectedParkingSpot');
  localStorage.removeItem('selectedParkingSpotTime');
  updateSelectedSpotDisplay();
  
  // Update UI
  const allSpots = document.querySelectorAll('.parking-spot.selected');
  allSpots.forEach(spot => spot.classList.remove('selected'));
  
  console.log('✓ Selected spot cleared');
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger alert-dismissible fade show';
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  const container = document.querySelector('main');
  if (container) {
    container.insertBefore(alert, container.firstChild);
  }
}
