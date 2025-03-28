// Home Feed Animations
document.addEventListener('DOMContentLoaded', function() {
  // Add staggered animations to posts
  const animatePosts = function() {
    const posts = document.querySelectorAll('.card');
    
    posts.forEach(function(post, index) {
      post.style.opacity = '0';
      post.style.transform = 'translateY(20px)';
      
      setTimeout(function() {
        post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        post.style.opacity = '1';
        post.style.transform = 'translateY(0)';
      }, 100 + (index * 150));
    });
  };

  // Enhance post reactions
  const enhanceReactions = function() {
    const reactions = document.querySelectorAll('.btn-reaction');
    
    reactions.forEach(function(btn) {
      // Add hover animation
      btn.addEventListener('mouseenter', function() {
        const emoji = this.querySelector('.reaction-emoji');
        if (emoji) {
          emoji.style.transform = 'scale(1.3)';
          emoji.style.transition = 'transform 0.3s ease';
        }
      });
      
      btn.addEventListener('mouseleave', function() {
        const emoji = this.querySelector('.reaction-emoji');
        if (emoji) {
          emoji.style.transform = 'scale(1)';
        }
      });
      
      // Add click animation
      btn.addEventListener('click', function() {
        // Add heart animation on like
        if (this.classList.contains('like-button') || this.querySelector('.fa-heart')) {
          createHeartAnimation(this);
        }
      });
    });
  };

  // Create heart animation for likes
  const createHeartAnimation = function(button) {
    // Create floating heart
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.className = 'floating-heart';
    heart.style.cssText = `
      position: absolute;
      font-size: 1.5rem;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      animation: float-up 1s forwards ease-out;
      pointer-events: none;
      opacity: 1;
    `;
    
    button.style.position = 'relative';
    button.appendChild(heart);
    
    // Remove after animation completes
    setTimeout(function() {
      heart.remove();
    }, 1000);
    
    // Add animation keyframes if not already added
    if (!document.querySelector('style#heart-animation')) {
      const style = document.createElement('style');
      style.id = 'heart-animation';
      style.textContent = `
        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -20px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Enhance comments section
  const enhanceComments = function() {
    const commentBtns = document.querySelectorAll('.comment-toggle-btn');
    
    commentBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const target = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
        if (target) {
          const commentSection = document.querySelector(target);
          if (commentSection) {
            // Add animation to comments after they're shown
            setTimeout(function() {
              const comments = commentSection.querySelectorAll('.comment');
              comments.forEach(function(comment, index) {
                comment.style.opacity = '0';
                comment.style.transform = 'translateY(10px)';
                
                setTimeout(function() {
                  comment.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                  comment.style.opacity = '1';
                  comment.style.transform = 'translateY(0)';
                }, 50 * index);
              });
            }, 300);
          }
        }
      });
    });
    
    // Enhance comment form
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        // Prevent actual form submission for demo
        // In a real app, this would be handled with AJAX
        // e.preventDefault();
        
        // Animate the submission
        const textarea = this.querySelector('textarea');
        const submitBtn = this.querySelector('button[type="submit"]');
        
        if (textarea && submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          
          // Create a preview comment with animation
          const commentPreview = document.createElement('div');
          commentPreview.className = 'comment animate-fade-in mb-2';
          commentPreview.innerHTML = `
            <div class="d-flex">
              <div class="me-2">
                <img src="${document.querySelector('.profile-avatar-sm')?.src || '#'}" class="profile-avatar-sm" alt="You">
              </div>
              <div class="comment-content p-2 rounded bg-light w-100">
                <div class="d-flex justify-content-between align-items-center">
                  <div><strong>You</strong> <small class="text-muted">Just now</small></div>
                </div>
                <div>${textarea.value}</div>
              </div>
            </div>
          `;
          
          // Add to comments section after delay
          setTimeout(function() {
            const commentsContainer = form.closest('.collapse').querySelector('.comments-container');
            if (commentsContainer) {
              commentsContainer.appendChild(commentPreview);
              commentPreview.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Reset form
            textarea.value = '';
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
          }, 500);
        }
      });
    });
  };

  // Enhance file upload for post creation
  const enhancePostCreation = function() {
    const postForm = document.getElementById('post-form');
    if (postForm) {
      const fileInput = postForm.querySelector('input[type="file"]');
      const previewContainer = document.getElementById('preview-container');
      
      // Add file selection animation
      if (fileInput && previewContainer) {
        fileInput.addEventListener('change', function() {
          if (this.files && this.files.length > 0) {
            previewContainer.classList.add('animate-fade-in');
            
            // Add confetti effect
            for (let i = 0; i < 20; i++) {
              createConfetti(previewContainer);
            }
          }
        });
      }
      
      // Enhance submit button with visual feedback
      const submitBtn = postForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        postForm.addEventListener('submit', function(e) {
          // Don't block the form submission, just add visual feedback
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Posting...';
          submitBtn.classList.add('disabled');
          
          // Let the form submit normally
          return true;
        });
      }
    }
  };
  
  // Create confetti effect
  const createConfetti = function(parent) {
    if (!parent) return;
    
    const confetti = document.createElement('div');
    const colors = ['#FFC700', '#FF0055', '#0066FF', '#44FF00'];
    
    confetti.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
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
  
  // Enhance share dialog
  const enhanceShareDialog = function() {
    const shareBtn = document.querySelectorAll('.share-btn');
    
    shareBtn.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // The modal will be shown by Bootstrap
        // Add animation to the modal when it appears
        const modalId = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
        if (modalId) {
          const modal = document.querySelector(modalId);
          if (modal) {
            modal.addEventListener('shown.bs.modal', function() {
              const modalDialog = this.querySelector('.modal-dialog');
              if (modalDialog) {
                modalDialog.style.animation = 'slideInUp 0.3s ease forwards';
              }
            }, { once: true });
          }
        }
      });
    });
  };
  
  // Run only on home feed page
  if (document.querySelector('.post') || document.querySelectorAll('.card').length > 2) {
    animatePosts();
    enhanceReactions();
    enhanceComments();
    enhancePostCreation();
    enhanceShareDialog();
    
    // Add animation styles for home feed
    if (!document.querySelector('style#home-styles')) {
      const style = document.createElement('style');
      style.id = 'home-styles';
      style.textContent = `
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .reaction-btn, .btn-reaction {
          transition: all 0.3s ease;
          position: relative;
        }
        
        .reaction-emoji {
          transition: transform 0.3s ease;
        }
        
        .comment-content {
          transition: background-color 0.3s ease;
        }
        
        .comment-content:hover {
          background-color: #f0f0f0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}); 