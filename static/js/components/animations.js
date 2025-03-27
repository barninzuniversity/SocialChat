// Core Animation Functions
document.addEventListener('DOMContentLoaded', function() {
  // Apply staggered animations to cards
  const animateCards = function() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(function(card, index) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(function() {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + (index * 150));
    });
  };
  
  // Apply staggered animations to list items
  const animateListItems = function() {
    const listItems = document.querySelectorAll('.list-group-item');
    
    if (listItems.length === 0) return;
    
    listItems.forEach(function(item, index) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      
      setTimeout(function() {
        item.style.transition = 'all 0.5s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 50 + (index * 50));
    });
  };
  
  // Add ripple effect to buttons
  const addButtonRippleEffect = function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.cssText = `
          position: absolute;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          pointer-events: none;
          width: 100px;
          height: 100px;
          left: ${x - 50}px;
          top: ${y - 50}px;
          transform: scale(0);
          opacity: 1;
          transition: transform 0.5s, opacity 0.5s;
        `;
        
        // Set relative position on button if not already set
        if (getComputedStyle(button).position === 'static') {
          button.style.position = 'relative';
        }
        
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Start the animation in the next frame
        requestAnimationFrame(function() {
          ripple.style.transform = 'scale(3)';
          ripple.style.opacity = '0';
        });
        
        // Remove the ripple element after the animation completes
        setTimeout(function() {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 500);
      });
    });
  };
  
  // Add hover effects for profile avatars
  const addProfileAvatarEffects = function() {
    const avatars = document.querySelectorAll('.profile-avatar, .profile-avatar-sm');
    
    avatars.forEach(function(avatar) {
      avatar.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 0 15px rgba(0, 149, 246, 0.5)';
        this.style.transition = 'all 0.3s ease';
      });
      
      avatar.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  };
  
  // Instagram-style double-tap like for images
  const addDoubleTapLike = function() {
    const postImages = document.querySelectorAll('.post-image, .card-img-top');
    
    postImages.forEach(function(img) {
      // Track double tap/click
      let lastTap = 0;
      
      img.addEventListener('click', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
          // Double tap detected
          createLikeHeartAnimation(e, this);
          
          // Find and trigger the like button if it exists
          const likeBtn = this.closest('.card').querySelector('.like-button');
          if (likeBtn) {
            likeBtn.click();
          }
          
          e.preventDefault();
        }
        
        lastTap = currentTime;
      });
    });
  };
  
  // Create heart animation for double-tap like
  const createLikeHeartAnimation = function(e, element) {
    const heart = document.createElement('i');
    heart.className = 'fas fa-heart heart-animation';
    
    // Calculate position relative to the clicked element
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    heart.style.cssText = `
      position: absolute;
      color: white;
      font-size: 80px;
      left: ${x - 40}px;
      top: ${y - 40}px;
      filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
      pointer-events: none;
      z-index: 1000;
    `;
    
    // Set relative position on the element if not already set
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(heart);
    
    // Start the animation
    setTimeout(function() {
      heart.style.opacity = '0';
      heart.style.transform = 'scale(1.5)';
      heart.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // Remove the heart element after the animation completes
      setTimeout(function() {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
        }
      }, 300);
    }, 800);
  };
  
  // Instagram-style scroll reveal animations
  const initScrollRevealAnimations = function() {
    if (!('IntersectionObserver' in window)) return;
    
    const animateOnScroll = function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    };
    
    const observer = new IntersectionObserver(animateOnScroll, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });
    
    const elementsToAnimate = document.querySelectorAll('.should-animate');
    elementsToAnimate.forEach(function(element) {
      element.classList.add('will-animate');
      observer.observe(element);
    });
    
    // If no elements have the should-animate class, apply to cards and list items
    if (elementsToAnimate.length === 0) {
      document.querySelectorAll('.card, .list-group-item').forEach(function(element) {
        element.classList.add('will-animate');
        observer.observe(element);
      });
    }
    
    // Add the necessary CSS if not already in the page
    if (!document.querySelector('style#scroll-animations')) {
      const style = document.createElement('style');
      style.id = 'scroll-animations';
      style.textContent = `
        .will-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Add Instagram-style Stories UI
  const initStoriesUI = function() {
    // Create stories row if it doesn't exist and we're on the home page
    if (document.querySelector('.home-content') && !document.querySelector('.stories-row')) {
      const storiesRow = document.createElement('div');
      storiesRow.className = 'stories-row d-flex overflow-auto mb-4 py-2';
      storiesRow.style.scrollbarWidth = 'none'; // Hide scrollbar for Firefox
      storiesRow.style.msOverflowStyle = 'none'; // Hide scrollbar for IE/Edge
      
      // Style the scrollbar for Webkit browsers
      const scrollbarStyles = document.createElement('style');
      scrollbarStyles.textContent = `
        .stories-row::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(scrollbarStyles);
      
      // Insert before the first card or post
      const container = document.querySelector('.container');
      const firstCard = document.querySelector('.card');
      
      if (container && firstCard) {
        container.insertBefore(storiesRow, firstCard);
        
        // Add your story bubble first
        const yourStory = document.createElement('div');
        yourStory.className = 'story-item text-center me-3';
        yourStory.innerHTML = `
          <div class="story-circle">
            <img src="${document.querySelector('.profile-avatar-sm')?.src || 'https://via.placeholder.com/150'}" alt="Your Story">
          </div>
          <small class="d-block mt-1">Your Story</small>
        `;
        storiesRow.appendChild(yourStory);
        
        // Get users from the page to create sample stories
        const userAvatars = document.querySelectorAll('.profile-avatar-sm');
        const userNames = document.querySelectorAll('.user-name, .chat-name');
        
        // Create a set to track unique usernames
        const addedUsers = new Set();
        
        // Add up to 10 stories from different users
        for (let i = 0; i < Math.min(10, userAvatars.length); i++) {
          const avatarSrc = userAvatars[i].src;
          let userName = '';
          
          if (userNames[i]) {
            userName = userNames[i].textContent.trim().split(' ')[0]; // Get first name
          } else {
            userName = 'User ' + (i + 1);
          }
          
          // Skip if we've already added this user
          if (addedUsers.has(userName)) continue;
          addedUsers.add(userName);
          
          const storyItem = document.createElement('div');
          storyItem.className = 'story-item text-center me-3';
          storyItem.innerHTML = `
            <div class="story-circle">
              <img src="${avatarSrc}" alt="${userName}'s Story">
            </div>
            <small class="d-block mt-1">${userName}</small>
          `;
          storiesRow.appendChild(storyItem);
          
          // Add click event to show story viewer
          storyItem.addEventListener('click', function() {
            showStoryViewer(avatarSrc, userName);
          });
        }
        
        // Add click event to your story bubble
        yourStory.addEventListener('click', function() {
          // Show empty story with "Create Story" button
          showStoryViewer(yourStory.querySelector('img').src, 'Your Story', true);
        });
      }
    }
  };
  
  // Show Instagram-style Story viewer
  const showStoryViewer = function(imageSrc, userName, isYourStory = false) {
    const storyViewer = document.createElement('div');
    storyViewer.className = 'story-viewer';
    
    const storyContent = `
      <div class="story-content">
        <div class="story-header text-white p-3">
          <div class="d-flex align-items-center">
            <div class="story-circle" style="width: 40px; height: 40px;">
              <img src="${imageSrc}" alt="${userName}">
            </div>
            <div class="ms-2">${userName}</div>
          </div>
          <div class="ms-auto">
            <button class="btn-close btn-close-white close-story"></button>
          </div>
        </div>
        
        ${isYourStory ? `
          <div class="d-flex align-items-center justify-content-center h-100 text-white">
            <div class="text-center">
              <i class="fas fa-plus-circle fa-3x mb-3"></i>
              <h5>Create a Story</h5>
              <button class="btn btn-primary mt-3">Upload Photo</button>
            </div>
          </div>
        ` : `
          <img src="${imageSrc}" class="story-image" alt="${userName}'s story">
          <div class="story-footer text-white">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Send message...">
              <button class="btn btn-outline-light" type="button">Send</button>
            </div>
          </div>
        `}
      </div>
    `;
    
    storyViewer.innerHTML = storyContent;
    document.body.appendChild(storyViewer);
    document.body.style.overflow = 'hidden'; // Prevent scrolling while story is open
    
    // Add animation for story appearance
    const content = storyViewer.querySelector('.story-content');
    content.style.transform = 'scale(0.9)';
    content.style.opacity = '0';
    content.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    setTimeout(function() {
      content.style.transform = 'scale(1)';
      content.style.opacity = '1';
    }, 10);
    
    // Close story when clicking close button or outside the story
    const closeStory = function() {
      content.style.transform = 'scale(0.9)';
      content.style.opacity = '0';
      
      setTimeout(function() {
        document.body.removeChild(storyViewer);
        document.body.style.overflow = ''; // Restore scrolling
      }, 300);
    };
    
    storyViewer.querySelector('.close-story').addEventListener('click', closeStory);
    storyViewer.addEventListener('click', function(e) {
      if (e.target === storyViewer) {
        closeStory();
      }
    });
    
    // Auto-close story after 5 seconds for demo purposes
    if (!isYourStory) {
      // Add progress bar
      const progressContainer = document.createElement('div');
      progressContainer.className = 'd-flex position-absolute top-0 start-0 end-0 p-2';
      progressContainer.style.zIndex = '3';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'progress w-100';
      progressBar.style.height = '2px';
      progressBar.innerHTML = `<div class="progress-bar bg-white" role="progressbar" style="width: 0%"></div>`;
      
      progressContainer.appendChild(progressBar);
      content.appendChild(progressContainer);
      
      // Animate progress bar
      const progress = progressBar.querySelector('.progress-bar');
      progress.style.transition = 'width 5s linear';
      
      setTimeout(function() {
        progress.style.width = '100%';
      }, 10);
      
      setTimeout(closeStory, 5000);
    }
  };
  
  // Fix user profile/logout dropdown menu
  const fixProfileDropdown = function() {
    const userDropdown = document.querySelector('.dropdown-toggle[data-bs-toggle="dropdown"]');
    
    if (userDropdown) {
      // Ensure Bootstrap's JS is loaded
      if (typeof bootstrap === 'undefined') {
        // If Bootstrap JS isn't loaded, add it
        const bootstrapScript = document.createElement('script');
        bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js';
        bootstrapScript.onload = function() {
          // Initialize dropdown after loading Bootstrap
          new bootstrap.Dropdown(userDropdown);
        };
        document.head.appendChild(bootstrapScript);
      } else {
        // If Bootstrap is already loaded, just initialize the dropdown
        new bootstrap.Dropdown(userDropdown);
      }
      
      // Ensure the dropdown has the correct structure
      const dropdown = userDropdown.parentElement;
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (!menu) {
        // Create dropdown menu if it doesn't exist
        const newMenu = document.createElement('div');
        newMenu.className = 'dropdown-menu dropdown-menu-end';
        newMenu.innerHTML = `
          <a class="dropdown-item" href="/profile/">
            <i class="fas fa-user me-2"></i> Profile
          </a>
          <a class="dropdown-item" href="/profile/edit/">
            <i class="fas fa-cog me-2"></i> Settings
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="/logout/">
            <i class="fas fa-sign-out-alt me-2"></i> Logout
          </a>
        `;
        dropdown.appendChild(newMenu);
      }
    }
  };
  
  // Add Instagram-like notification badge
  const addNotificationBadge = function() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Find notification, message, or heart icon links if they exist
    navLinks.forEach(function(link) {
      const icon = link.querySelector('i');
      if (icon && (
          icon.classList.contains('fa-bell') || 
          icon.classList.contains('fa-envelope') || 
          icon.classList.contains('fa-heart')
      )) {
        // Add notification dot with subtle animation
        const badge = document.createElement('span');
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge';
        badge.innerHTML = '•';
        badge.style.fontSize = '10px';
        badge.style.padding = '3px 5px';
        
        // Position the link relatively if it's not already
        if (getComputedStyle(link).position === 'static') {
          link.style.position = 'relative';
        }
        
        link.appendChild(badge);
        
        // Add subtle pulse animation
        const pulseStyle = document.createElement('style');
        pulseStyle.textContent = `
          @keyframes notificationPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          .notification-badge {
            animation: notificationPulse 2s infinite;
            transform-origin: center;
          }
        `;
        document.head.appendChild(pulseStyle);
      }
    });
  };
  
  // Execute animations
  animateCards();
  animateListItems();
  addButtonRippleEffect();
  addProfileAvatarEffects();
  addDoubleTapLike();
  initScrollRevealAnimations();
  initStoriesUI();
  fixProfileDropdown();
  addNotificationBadge();
}); 