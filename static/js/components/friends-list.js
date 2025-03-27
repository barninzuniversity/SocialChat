// Friends List Animations
document.addEventListener('DOMContentLoaded', function() {
  // Add staggered animations to friends list
  const animateFriendsList = function() {
    const friends = document.querySelectorAll('.list-group-item');
    
    friends.forEach(function(friend, index) {
      friend.style.opacity = '0';
      friend.style.transform = 'translateY(20px)';
      
      setTimeout(function() {
        friend.style.transition = 'all 0.5s ease';
        friend.style.opacity = '1';
        friend.style.transform = 'translateY(0)';
      }, 100 + (index * 100));
    });
  };

  // Add hover animations to friend cards
  const addHoverEffects = function() {
    const friends = document.querySelectorAll('.list-group-item');
    
    friends.forEach(function(friend) {
      friend.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        this.style.backgroundColor = 'var(--light-color, #f8f9fa)';
        this.style.transition = 'all 0.3s ease';
      });
      
      friend.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.backgroundColor = '';
      });
    });
  };

  // Add animation to empty state
  const animateEmptyState = function() {
    const emptyState = document.querySelector('.text-center.py-5');
    if (emptyState) {
      const icon = emptyState.querySelector('i');
      if (icon) {
        // Add floating animation
        icon.style.animation = 'float 3s ease-in-out infinite';
      }
    }
  };
  
  // Add button animations
  const enhanceButtons = function() {
    // Add hover animation to action buttons
    const actionButtons = document.querySelectorAll('.list-group-item .btn');
    
    actionButtons.forEach(function(btn) {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        this.style.transition = 'all 0.2s ease';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
      
      // Add click animation for unfriend/block/unblock
      btn.addEventListener('click', function() {
        // Get the parent list item
        const listItem = this.closest('.list-group-item');
        
        // Skip if no parent found
        if (!listItem) return;
        
        // Animate the removal
        listItem.style.transition = 'all 0.5s ease';
        listItem.style.opacity = '0';
        listItem.style.height = '0';
        listItem.style.transform = 'translateX(100%)';
        
        // Add floating hearts for adding friend
        if (this.classList.contains('btn-success') || this.textContent.includes('Accept')) {
          createHearts(listItem);
        }
        
        // Delay actual removal/processing to allow for animation
        setTimeout(function() {
          listItem.style.display = 'none';
        }, 500);
      });
    });
  };
  
  // Create floating hearts for friend acceptance
  const createHearts = function(parent) {
    if (!parent) return;
    
    for (let i = 0; i < 10; i++) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.style.cssText = `
        position: absolute;
        font-size: 1.2rem;
        left: ${Math.random() * 100}%;
        top: 50%;
        opacity: 0;
        pointer-events: none;
      `;
      
      parent.style.position = 'relative';
      parent.appendChild(heart);
      
      // Animate heart
      heart.animate([
        { transform: 'translateY(0)', opacity: 1 },
        { transform: `translateY(-${50 + Math.random() * 50}px)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 500,
        easing: 'ease-out',
        fill: 'forwards'
      });
      
      setTimeout(function() {
        heart.remove();
      }, 1500);
    }
  };
  
  // Add search input animation
  const enhanceSearch = function() {
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('focus', function() {
        this.style.transition = 'all 0.3s ease';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        this.style.width = 'calc(100% + 20px)';
      });
      
      searchInput.addEventListener('blur', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.width = '';
      });
    }
  };
  
  // Run only on friends or blocked users page
  if (document.querySelector('.list-group')) {
    animateFriendsList();
    addHoverEffects();
    animateEmptyState();
    enhanceButtons();
    enhanceSearch();
    
    // Add custom CSS for friends list animations
    if (!document.querySelector('style#friends-list-styles')) {
      const style = document.createElement('style');
      style.id = 'friends-list-styles';
      style.textContent = `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .list-group-item {
          transition: all 0.3s ease;
        }
        
        .btn-action {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .btn-action:hover {
          transform: translateY(-2px);
        }
        
        .friend-avatar {
          transition: all 0.3s ease;
        }
        
        .friend-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
      `;
      document.head.appendChild(style);
    }
  }
}); 