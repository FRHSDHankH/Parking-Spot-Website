/* ============================================================
   FORM PAGE SCRIPT
   ============================================================
   This file handles form validation, submission, and data
   storage. Will be fully implemented in Commit 6.
*/

document.addEventListener('DOMContentLoaded', function () {
  const spotTypeSelect = document.getElementById('spotType');
  const partnerSection = document.getElementById('partnerSection');
  const partnerDaysSection = document.getElementById('partnerDaysSection');

  // Show/hide partner fields based on spot type
  if (spotTypeSelect) {
    spotTypeSelect.addEventListener('change', function () {
      if (this.value === 'Shared') {
        partnerSection.style.display = 'block';
        partnerDaysSection.style.display = 'block';
      } else {
        partnerSection.style.display = 'none';
        partnerDaysSection.style.display = 'none';
      }
    });
  }

  console.log('Form page loaded - full functionality coming in Commit 6');
});
