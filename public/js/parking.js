/* ============================================================
   PARKING PAGE SCRIPT
   ============================================================
   Handles parking lot grid rendering, spot selection,
   and lot switching with interactive UI.
*/

// Vue 3 App for Parking Page
const { createApp } = Vue;

const ParkingApp = {
  data() {
    return {
      parkingData: {},
      currentLot: 'Lot A',
      selectedSpot: null,
      spots: [],
      lots: ['Lot A', 'Lot B', 'Lot C']
    };
  },

  mounted() {
    this.loadParkingData();
    this.renderLot(this.currentLot);
    this.setupLotButtons();
    this.setupContinueButton();
    this.restoreSelectedSpot();
  },

  methods: {
    /**
     * Load parking data from JSON file
     */
    loadParkingData() {
      fetch('public/data/parkingData.json')
        .then(response => response.json())
        .then(data => {
          this.parkingData = data;
          console.log('Parking data loaded:', data);
        })
        .catch(error => console.error('Error loading parking data:', error));
    },

    /**
     * Render a specific parking lot
     */
    renderLot(lot) {
      const lotKey = lot.toLowerCase().replace(' ', '');
      if (!this.parkingData[lotKey]) {
        console.error('Lot not found:', lot);
        return;
      }

      this.currentLot = lot;
      this.spots = this.parkingData[lotKey].spots || [];
      this.$nextTick(() => {
        this.renderGrid();
      });
    },

    /**
     * Render the parking grid with Vue
     */
    renderGrid() {
      const container = document.getElementById('parkingLot');
      if (!container) return;

      container.innerHTML = '';

      this.spots.forEach((spot, index) => {
        const spotElement = document.createElement('div');
        spotElement.className = `parking-spot ${spot.status} ${spot.type}`;
        spotElement.id = `spot-${spot.id}`;

        // Determine if spot should be selected
        const isSelected = this.selectedSpot && this.selectedSpot.id === spot.id;
        if (isSelected) {
          spotElement.classList.add('selected');
        }

        // For shared spots, create two halves; for solo spots, create one
        if (spot.type === 'shared') {
          const half1 = document.createElement('div');
          half1.className = 'parking-spot-half';
          half1.innerHTML = `<span>${spot.id} A</span>`;
          half1.style.cursor = spot.status === 'taken' ? 'not-allowed' : 'pointer';
          half1.addEventListener('click', () => {
            if (spot.status !== 'taken') {
              this.selectSpot(spot, 'A');
            }
          });

          const half2 = document.createElement('div');
          half2.className = 'parking-spot-half';
          half2.innerHTML = `<span>${spot.id} B</span>`;
          half2.style.cursor = spot.status === 'taken' ? 'not-allowed' : 'pointer';
          half2.addEventListener('click', () => {
            if (spot.status !== 'taken') {
              this.selectSpot(spot, 'B');
            }
          });

          spotElement.appendChild(half1);
          spotElement.appendChild(half2);
        } else {
          // Solo spot - single clickable area
          spotElement.innerHTML = `<div class="parking-spot-half" style="height: 100%; width: 100%; display: flex; align-items: center; justify-content: center;">
            <span>${spot.id}</span>
          </div>`;
          spotElement.style.cursor = spot.status === 'taken' ? 'not-allowed' : 'pointer';

          if (spot.status !== 'taken') {
            spotElement.addEventListener('click', () => {
              this.selectSpot(spot);
            });
          }
        }

        container.appendChild(spotElement);
      });
    },

    /**
     * Select a parking spot
     */
    selectSpot(spot, half = null) {
      // Deselect previous spot
      if (this.selectedSpot) {
        const prevElement = document.getElementById(`spot-${this.selectedSpot.id}`);
        if (prevElement) {
          prevElement.classList.remove('selected');
        }
      }

      // Select new spot
      this.selectedSpot = {
        id: spot.id,
        lot: this.currentLot,
        type: spot.type,
        half: half
      };

      // Update UI
      const spotElement = document.getElementById(`spot-${spot.id}`);
      if (spotElement) {
        spotElement.classList.add('selected');
      }

      this.updateSelectedSpotDisplay();
      this.saveSelectedSpot();
      this.enableContinueButton();
    },

    /**
     * Update the selected spot alert display
     */
    updateSelectedSpotDisplay() {
      const alert = document.getElementById('selectedSpotAlert');
      const spotText = document.getElementById('selectedSpotText');

      if (this.selectedSpot) {
        let spotLabel = `${this.selectedSpot.lot} - Spot ${this.selectedSpot.id}`;
        if (this.selectedSpot.half) {
          spotLabel += ` (${this.selectedSpot.half === 'A' ? 'Schedule A' : 'Schedule B'})`;
        }
        spotText.textContent = spotLabel;
        alert.style.display = 'block';
      } else {
        alert.style.display = 'none';
      }
    },

    /**
     * Save selected spot to localStorage
     */
    saveSelectedSpot() {
      if (this.selectedSpot) {
        localStorage.setItem('selectedParkingSpot', JSON.stringify(this.selectedSpot));
      }
    },

    /**
     * Restore selected spot from localStorage
     */
    restoreSelectedSpot() {
      const saved = localStorage.getItem('selectedParkingSpot');
      if (saved) {
        this.selectedSpot = JSON.parse(saved);
        // If saved spot is in current lot, render it
        if (this.selectedSpot.lot === this.currentLot) {
          this.$nextTick(() => {
            const spotElement = document.getElementById(`spot-${this.selectedSpot.id}`);
            if (spotElement) {
              spotElement.classList.add('selected');
            }
            this.updateSelectedSpotDisplay();
            this.enableContinueButton();
          });
        }
      }
    },

    /**
     * Setup lot button click handlers
     */
    setupLotButtons() {
      const lotButtons = document.querySelectorAll('.lot-btn');
      lotButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Remove active class from all buttons
          lotButtons.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          e.target.classList.add('active');
          // Render new lot
          this.renderLot(e.target.dataset.lot);
          this.restoreSelectedSpot();
        });
      });
    },

    /**
     * Setup continue button
     */
    setupContinueButton() {
      const continueBtn = document.getElementById('continueBtn');
      if (continueBtn) {
        continueBtn.addEventListener('click', (e) => {
          if (!this.selectedSpot) {
            e.preventDefault();
            alert('Please select a parking spot first.');
          }
        });
      }
    },

    /**
     * Enable continue button when spot is selected
     */
    enableContinueButton() {
      const continueBtn = document.getElementById('continueBtn');
      if (continueBtn && this.selectedSpot) {
        continueBtn.disabled = false;
      }
    }
  }
};

// Initialize Vue app when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  createApp(ParkingApp).mount('#parkingLot');

  // Also need to initialize the app container
  const app = createApp(ParkingApp);
  
  // Create a wrapper div for the app
  const wrapper = document.createElement('div');
  const container = document.getElementById('parkingLot');
  
  // Move container to wrapper and mount
  container.parentElement.insertBefore(wrapper, container);
  wrapper.appendChild(container);
  
  // Simpler approach: just initialize directly
  const parkingApp = { ...ParkingApp };
  parkingApp.mounted = ParkingApp.mounted;
  parkingApp.data = ParkingApp.data;
  
  // Initialize manually
  const data = ParkingApp.data();
  
  // Load parking data
  fetch('public/data/parkingData.json')
    .then(response => response.json())
    .then(data => {
      window.parkingData = data;
      window.currentLot = 'Lot A';
      window.selectedSpot = null;
      
      // Restore from localStorage
      const saved = localStorage.getItem('selectedParkingSpot');
      if (saved) {
        window.selectedSpot = JSON.parse(saved);
      }
      
      // Render initial lot
      renderLot('Lot A');
      setupLotButtons();
      setupContinueButton();
    })
    .catch(error => console.error('Error loading parking data:', error));
});

/**
 * Render a specific parking lot
 */
function renderLot(lot) {
  const lotKey = lot.toLowerCase().replace(' ', '');
  if (!window.parkingData[lotKey]) {
    console.error('Lot not found:', lot);
    return;
  }

  window.currentLot = lot;
  const spots = window.parkingData[lotKey].spots || [];
  
  const container = document.getElementById('parkingLot');
  if (!container) return;

  container.innerHTML = '';

  spots.forEach((spot) => {
    const spotElement = document.createElement('div');
    spotElement.className = `parking-spot ${spot.status} ${spot.type}`;
    spotElement.id = `spot-${spot.id}`;

    // Check if this spot is selected
    if (window.selectedSpot && window.selectedSpot.id === spot.id && window.selectedSpot.lot === lot) {
      spotElement.classList.add('selected');
    }

    // For shared spots, create two halves
    if (spot.type === 'shared') {
      const half1 = document.createElement('div');
      half1.className = 'parking-spot-half';
      half1.innerHTML = `<span>${spot.id} A</span>`;
      half1.style.cursor = spot.status === 'taken' ? 'not-allowed' : 'pointer';
      
      if (spot.status !== 'taken') {
        half1.addEventListener('click', () => selectSpot(spot, 'A'));
      }

      const half2 = document.createElement('div');
      half2.className = 'parking-spot-half';
      half2.innerHTML = `<span>${spot.id} B</span>`;
      half2.style.cursor = spot.status === 'taken' ? 'not-allowed' : 'pointer';
      
      if (spot.status !== 'taken') {
        half2.addEventListener('click', () => selectSpot(spot, 'B'));
      }

      spotElement.appendChild(half1);
      spotElement.appendChild(half2);
    } else {
      // Solo spot
      spotElement.innerHTML = `<div class="parking-spot-half" style="height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; cursor: ${spot.status === 'taken' ? 'not-allowed' : 'pointer'};">
        <span>${spot.id}</span>
      </div>`;

      if (spot.status !== 'taken') {
        spotElement.addEventListener('click', () => selectSpot(spot));
      }
    }

    container.appendChild(spotElement);
  });

  updateSelectedSpotDisplay();
}

/**
 * Select a parking spot
 */
function selectSpot(spot, half = null) {
  // Deselect previous spot
  if (window.selectedSpot) {
    const prevElement = document.getElementById(`spot-${window.selectedSpot.id}`);
    if (prevElement) {
      prevElement.classList.remove('selected');
    }
  }

  // Select new spot
  window.selectedSpot = {
    id: spot.id,
    lot: window.currentLot,
    type: spot.type,
    half: half
  };

  // Update UI
  const spotElement = document.getElementById(`spot-${spot.id}`);
  if (spotElement) {
    spotElement.classList.add('selected');
  }

  updateSelectedSpotDisplay();
  localStorage.setItem('selectedParkingSpot', JSON.stringify(window.selectedSpot));
  enableContinueButton();
}

/**
 * Update the selected spot alert display
 */
function updateSelectedSpotDisplay() {
  const alert = document.getElementById('selectedSpotAlert');
  const spotText = document.getElementById('selectedSpotText');

  if (window.selectedSpot) {
    let spotLabel = `${window.selectedSpot.lot} - Spot ${window.selectedSpot.id}`;
    if (window.selectedSpot.half) {
      spotLabel += ` (${window.selectedSpot.half === 'A' ? 'Schedule A' : 'Schedule B'})`;
    }
    spotText.textContent = spotLabel;
    alert.style.display = 'block';
  } else {
    alert.style.display = 'none';
  }
}

/**
 * Setup lot button click handlers
 */
function setupLotButtons() {
  const lotButtons = document.querySelectorAll('.lot-btn');
  lotButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      lotButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderLot(e.target.dataset.lot);
    });
  });
}

/**
 * Setup continue button
 */
function setupContinueButton() {
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) {
    if (window.selectedSpot) {
      continueBtn.disabled = false;
    }
    continueBtn.addEventListener('click', (e) => {
      if (!window.selectedSpot) {
        e.preventDefault();
        alert('Please select a parking spot first.');
      }
    });
  }
}

/**
 * Enable continue button when spot is selected
 */
function enableContinueButton() {
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn && window.selectedSpot) {
    continueBtn.disabled = false;
  }
}
