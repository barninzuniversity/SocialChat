// Script to ensure password help text is white in dark mode
document.addEventListener('DOMContentLoaded', function() {
  // Function to style the password help text
  const stylePasswordHelpText = function() {
    // Target all form-text elements and their children
    const helpTexts = document.querySelectorAll('.form-text, .password-help-text');
    
    helpTexts.forEach(helpText => {
      // Set text color to white if in dark mode
      if (document.body.classList.contains('dark')) {
        helpText.style.color = '#ffffff !important';
        
        // Also target the list items and other elements inside
        const helpTextElements = helpText.querySelectorAll('ul, li, small, p');
        helpTextElements.forEach(element => {
          element.style.color = '#ffffff';
        });
      }
    });
  };
  
  // Run the function on page load
  stylePasswordHelpText();
  
  // Also run when the dark mode toggle is clicked
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      // Wait a bit for the dark mode class to be applied
      setTimeout(stylePasswordHelpText, 50);
    });
  }
  
  // Observer to detect class changes on body element for dark mode
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        stylePasswordHelpText();
      }
    });
  });
  
  // Start observing the body for class changes
  observer.observe(document.body, { attributes: true });
}); 