// Profile Page Animations
document.addEventListener('DOMContentLoaded', function() {
  // Enhance profile avatar
  const enhanceProfileAvatar = function() {
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      // Add subtle pulse animation
      profileAvatar.classList.add('animate-pulse');
      
      // Add hover effect with glow
      profileAvatar.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 0 25px rgba(79, 70, 229, 0.6)';
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'all 0.3s ease';
      });
      
      profileAvatar.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
        this.style.transform = '';
      });
    }
  };

  // Enhance file upload for profile
  const enhanceFileUpload = function() {
    const dropZone = document.getElementById('upload-drop-zone');
    const fileInput = document.querySelector('input[type="file"]');
    
    if (dropZone) {
      // Add drag and drop animations
      dropZone.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('dragover');
        
        // Add particle effect
        createParticles(this);
      });
      
      dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('dragover');
      });
      
      dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
      });
      
      dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
        
        // Add success animation
        this.classList.add('animate-pulse');
        setTimeout(() => this.classList.remove('animate-pulse'), 1000);
      });
      
      // Click animation
      dropZone.addEventListener('click', function() {
        this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        this.style.transform = 'scale(0.98)';
        this.style.boxShadow = '0 0 15px rgba(79, 70, 229, 0.4)';
        
        setTimeout(() => {
          this.style.transform = '';
          this.style.boxShadow = '';
        }, 300);
      });
    }
    
    // Add file selection animation
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          const previewContainer = document.getElementById('preview-container');
          
          if (previewContainer) {
            previewContainer.classList.add('animate-fade-in');
            
            // Add confetti animation
            for (let i = 0; i < 30; i++) {
              createConfetti(dropZone || previewContainer);
            }
          }
        }
      });
    }
  };
  
  // Create particles for drag effect
  const createParticles = function(parent) {
    if (!parent) return;
    
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'upload-particle';
      
      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: rgba(79, 70, 229, 0.6);
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        pointer-events: none;
      `;
      
      parent.appendChild(particle);
      
      // Animate and remove
      particle.animate([
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(1.5)', opacity: 0 }
      ], {
        duration: 800,
        easing: 'ease-out'
      });
      
      setTimeout(function() {
        particle.remove();
      }, 800);
    }
  };
  
  // Create confetti for celebration
  const createConfetti = function(parent) {
    if (!parent) return;
    
    const confetti = document.createElement('div');
    const colors = ['#FFC700', '#FF0055', '#0066FF', '#44FF00'];
    
    confetti.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      top: 50%;
      left: 50%;
      opacity: 0;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      transform: rotate(${Math.random() * 360}deg);
    `;
    
    parent.appendChild(confetti);
    
    // Animate confetti
    const animateX = -50 + Math.random() * 100;
    const animateY = -50 + Math.random() * 100;
    
    confetti.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${animateX}px, ${animateY}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 1000,
      easing: 'cubic-bezier(0,.9,.57,1)',
      fill: 'forwards'
    });
    
    setTimeout(function() {
      confetti.remove();
    }, 2000);
  };
  
  // Add animations to form inputs
  const enhanceFormInputs = function() {
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(function(input) {
      input.addEventListener('focus', function() {
        this.style.transition = 'all 0.3s ease';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      });
      
      input.addEventListener('blur', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  };
  
  // Add save button animation
  const enhanceSaveButton = function() {
    const saveBtn = document.querySelector('button[type="submit"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function(e) {
        // Don't animate if form is invalid
        if (!document.querySelector('form').checkValidity()) {
          return;
        }
        
        // Add loading animation
        this.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...`;
        this.classList.add('disabled');
        
        // Add success animation after delay (in a real app, this would be after the AJAX call completes)
        setTimeout(() => {
          this.innerHTML = `<i class="fas fa-check me-2"></i> Saved!`;
          this.classList.remove('btn-primary');
          this.classList.add('btn-success');
          
          // Reset after showing success
          setTimeout(() => {
            this.innerHTML = `Save Changes`;
            this.classList.remove('btn-success', 'disabled');
            this.classList.add('btn-primary');
          }, 2000);
        }, 1000);
      });
    }
  };
  
  // Run only on profile pages
  if (document.querySelector('.profile-avatar') || document.getElementById('upload-drop-zone')) {
    enhanceProfileAvatar();
    enhanceFileUpload();
    enhanceFormInputs();
    enhanceSaveButton();
    
    // Add custom CSS for profile animations
    if (!document.querySelector('style#profile-styles')) {
      const style = document.createElement('style');
      style.id = 'profile-styles';
      style.textContent = `
        .upload-drop-zone {
          transition: all 0.3s ease;
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
        
        .upload-drop-zone.dragover {
          transform: scale(1.02);
          border-color: #4F46E5;
          background-color: rgba(79, 70, 229, 0.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .profile-avatar {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }
}); 