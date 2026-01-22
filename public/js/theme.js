/* ============================================================
   THEME MODE TOGGLE - Global Light/Dark Mode System
   ============================================================
   Manages light/dark mode toggle across all pages.
   Preferences are stored in LocalStorage for persistence.
   Smooth transitions between modes.
*/

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'mhs_theme_mode';
    this.LIGHT_MODE = 'light-mode';
    this.DARK_MODE = 'dark-mode';
    this.init();
  }

  /**
   * Initialize theme on page load
   */
  init() {
    // Get stored preference or default to light mode
    const savedMode = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode || (prefersDark ? this.DARK_MODE : this.LIGHT_MODE);

    // Apply theme on page load
    this.applyTheme(initialMode);

    // Set up toggle button
    this.setupToggleButton();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.applyTheme(e.matches ? this.DARK_MODE : this.LIGHT_MODE);
      }
    });
  }

  /**
   * Apply theme to the page
   * @param {string} mode - 'light-mode' or 'dark-mode'
   */
  applyTheme(mode) {
    const body = document.body;
    const navbar = document.querySelector('.navbar');

    // Remove existing classes
    body.classList.remove(this.LIGHT_MODE, this.DARK_MODE);
    if (navbar) {
      navbar.classList.remove(this.LIGHT_MODE, this.DARK_MODE);
    }

    // Add new class
    body.classList.add(mode);
    if (navbar) {
      navbar.classList.add(mode);
    }

    // Update toggle button icon
    this.updateToggleIcon(mode);

    // Save preference to localStorage
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  /**
   * Setup toggle button click handler
   */
  setupToggleButton() {
    const modeToggle = document.getElementById('modeToggle');

    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        const currentMode = document.body.classList.contains(this.DARK_MODE)
          ? this.DARK_MODE
          : this.LIGHT_MODE;

        const newMode = currentMode === this.LIGHT_MODE ? this.DARK_MODE : this.LIGHT_MODE;
        this.applyTheme(newMode);
      });
    }
  }

  /**
   * Update toggle button icon based on current mode
   * @param {string} mode - 'light-mode' or 'dark-mode'
   */
  updateToggleIcon(mode) {
    const modeToggle = document.getElementById('modeToggle');

    if (modeToggle) {
      // Show sun icon in dark mode (to switch to light), moon icon in light mode (to switch to dark)
      modeToggle.textContent = mode === this.LIGHT_MODE ? '🌙' : '☀️';
    }
  }

  /**
   * Get current theme mode
   * @returns {string} Current mode
   */
  getCurrentMode() {
    return document.body.classList.contains(this.DARK_MODE) ? this.DARK_MODE : this.LIGHT_MODE;
  }

  /**
   * Force a specific mode
   * @param {string} mode - 'light-mode' or 'dark-mode'
   */
  setMode(mode) {
    if (mode === this.LIGHT_MODE || mode === this.DARK_MODE) {
      this.applyTheme(mode);
    }
  }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  window.themeManager = new ThemeManager();
});
