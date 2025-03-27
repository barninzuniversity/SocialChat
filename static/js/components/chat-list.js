// Chat List Animations
document.addEventListener('DOMContentLoaded', function() {
  // Add staggered animations to chat list items
  const animateChatList = function() {
    const chatItems = document.querySelectorAll('.list-group-item');
    
    chatItems.forEach(function(item, index) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      
      setTimeout(function() {
        item.style.transition = 'all 0.5s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100 + (index * 70));
    });
  };

  // Add hover animations to chat items
  const addHoverEffects = function() {
    const chatItems = document.querySelectorAll('.list-group-item');
    
    chatItems.forEach(function(item) {
      item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        this.style.backgroundColor = 'var(--light-color, #f8f9fa)';
        this.style.transition = 'all 0.3s ease';
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.backgroundColor = '';
      });
    });
  };
  
  // Add pulse animation to unread messages
  const enhanceUnreadIndicators = function() {
    const unreadBadges = document.querySelectorAll('.badge-unread, .unread-count');
    
    unreadBadges.forEach(function(badge) {
      badge.style.animation = 'pulse 2s infinite';
      
      // Make parent row highlight on hover
      const parentItem = badge.closest('.list-group-item');
      if (parentItem) {
        parentItem.addEventListener('mouseenter', function() {
          badge.style.transform = 'scale(1.2)';
          badge.style.transition = 'transform 0.3s ease';
        });
        
        parentItem.addEventListener('mouseleave', function() {
          badge.style.transform = '';
        });
      }
    });
  };
  
  // Enhance search functionality
  const enhanceSearch = function() {
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      // Add focus animation
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
      
      // Add search results animation
      searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const chatItems = document.querySelectorAll('.list-group-item');
        
        chatItems.forEach(function(item) {
          const chatName = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
          const lastMessage = item.querySelector('.last-message')?.textContent.toLowerCase() || '';
          
          if (chatName.includes(query) || lastMessage.includes(query)) {
            // Show with animation if previously hidden
            if (item.style.display === 'none') {
              item.style.display = '';
              item.style.opacity = '0';
              item.style.transform = 'translateY(20px)';
              
              setTimeout(function() {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, 10);
            }
          } else {
            // Hide with animation
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
              item.style.display = 'none';
            }, 500);
          }
        });
      });
    }
  };
  
  // Add create new chat animation
  const enhanceNewChatButton = function() {
    const newChatBtn = document.querySelector('.btn-new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        this.style.transition = 'all 0.3s ease';
      });
      
      newChatBtn.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
      
      // Add floating animation to icon
      const icon = newChatBtn.querySelector('i');
      if (icon) {
        icon.style.animation = 'pulse 2s infinite';
      }
    }
  };
  
  // Enhance online status indicators
  const enhanceOnlineStatus = function() {
    const onlineIndicators = document.querySelectorAll('.online-indicator');
    
    onlineIndicators.forEach(function(indicator) {
      // Add pulse animation to online indicators
      if (indicator.classList.contains('online') || indicator.classList.contains('status-online')) {
        indicator.style.animation = 'pulse 2s infinite';
      }
    });
  };
  
  // Run only on chat list page
  if (document.querySelectorAll('.list-group-item').length > 0 && 
      (document.querySelector('.chat-list') || document.querySelector('.chat-item'))) {
    animateChatList();
    addHoverEffects();
    enhanceUnreadIndicators();
    enhanceSearch();
    enhanceNewChatButton();
    enhanceOnlineStatus();
    
    // Add custom CSS for chat list animations
    if (!document.querySelector('style#chat-list-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-list-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .list-group-item {
          transition: all 0.3s ease;
        }
        
        .badge-unread, .unread-count {
          transition: all 0.3s ease;
        }
        
        .avatar, .chat-avatar {
          transition: all 0.3s ease;
        }
        
        .avatar:hover, .chat-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .online-indicator {
          transition: all 0.3s ease;
        }
        
        .online-indicator.online, .status-online {
          box-shadow: 0 0 5px #10b981;
        }
      `;
      document.head.appendChild(style);
    }
  }
}); 