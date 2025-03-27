// Chat Room Animations
document.addEventListener('DOMContentLoaded', function() {
  // Track whether we should auto-scroll
  let autoScroll = true;
  let userHasScrolled = false;
  
  // Disable animations for chat messages
  const disableMessageAnimations = function() {
    // Add a style tag to override any animations
    const style = document.createElement('style');
    style.textContent = `
      .chat-message {
        opacity: 1 !important;
        animation: none !important;
        transition: none !important;
      }
      
      .animate__animated {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Initialize message interaction handlers
    initMessageInteractions();
  };
  
  // Initialize message reaction and reply handlers
  const initMessageInteractions = function() {
    // Reaction button handler
    window.showReactionModal = function(messageId) {
      const modal = document.getElementById('reaction-modal');
      if (modal) {
        document.getElementById('reaction-message-id').value = messageId;
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
      }
    };
    
    // Reply button handler
    window.showReplyModal = function(messageId) {
      const messageElement = document.querySelector(`.chat-message[data-message-id="${messageId}"]`);
      if (messageElement) {
        const messageContent = messageElement.querySelector('.message-text')?.textContent || 'Message';
        const messageInput = document.getElementById('message-input');
        const replyToInput = document.getElementById('reply-to-id');
        const replyPreview = document.getElementById('reply-preview');
        
        // Set the reply preview
        if (replyPreview) {
          const previewContent = replyPreview.querySelector('.reply-preview-content');
          if (previewContent) {
            previewContent.textContent = messageContent;
          }
          replyPreview.style.display = 'block';
        }
        
        // Set the hidden input
        if (replyToInput) {
          replyToInput.value = messageId;
        }
        
        // Focus the message input
        if (messageInput) {
          messageInput.focus();
        }
      }
    };
    
    // Setup reaction form submission
    const reactionForm = document.getElementById('reaction-form');
    if (reactionForm) {
      reactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const messageId = formData.get('message_id');
        const reaction = formData.get('reaction');
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        fetch(`/chat/reaction/${messageId}/`, {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRFToken': csrfToken
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            // Close the modal
            const modal = document.getElementById('reaction-modal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Refresh the messages
            refreshMessages();
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      });
    }
    
    // Setup cancel reply button
    const cancelReplyBtn = document.getElementById('cancel-reply');
    if (cancelReplyBtn) {
      cancelReplyBtn.addEventListener('click', function() {
        const replyPreview = document.getElementById('reply-preview');
        const replyToInput = document.getElementById('reply-to-id');
        
        if (replyPreview) {
          replyPreview.style.display = 'none';
        }
        
        if (replyToInput) {
          replyToInput.value = '';
        }
      });
    }
  };
  
  // Add typing indicator to chat
  const addTypingIndicator = function() {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator d-none';
      typingIndicator.innerHTML = `
        <div class="d-flex align-items-center">
          <small class="text-muted me-2">Someone is typing</small>
          <div>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;
      chatContainer.appendChild(typingIndicator);
      
      // Simulate typing occasionally
      const messageInput = document.querySelector('input[name="message"]');
      if (messageInput) {
        messageInput.addEventListener('focus', function() {
          setTimeout(function() {
            // 30% chance to show typing indicator
            if (Math.random() > 0.7) {
              typingIndicator.classList.remove('d-none');
              setTimeout(function() {
                typingIndicator.classList.add('d-none');
              }, 3000);
            }
          }, 1000);
        });
      }
    }
  };
  
  // Add file upload animation
  const enhanceFileUpload = function() {
    const fileInput = document.querySelector('input[type="file"]');
    const filePreview = document.getElementById('file-preview');
    
    if (fileInput && filePreview) {
      fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          filePreview.style.display = 'block';
        }
      });
    }
  };
  
  // Add scroll controls
  const addScrollControls = function() {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      // Create scroll-to-bottom button
      const scrollButton = document.createElement('button');
      scrollButton.className = 'btn btn-sm btn-primary rounded-circle position-absolute d-none';
      scrollButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
      scrollButton.style.cssText = `
        bottom: 80px;
        right: 20px;
        width: 40px;
        height: 40px;
        z-index: 3;
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      
      // Insert the button after the chat container
      chatContainer.parentNode.insertBefore(scrollButton, chatContainer.nextSibling);
      
      // Add "New messages" indicator
      const newMessagesIndicator = document.createElement('div');
      newMessagesIndicator.className = 'position-absolute d-none';
      newMessagesIndicator.innerHTML = '<span class="badge bg-danger">New messages</span>';
      newMessagesIndicator.style.cssText = `
        bottom: 125px;
        right: 20px;
        z-index: 3;
        opacity: 0.9;
      `;
      
      // Insert the indicator after the chat container
      chatContainer.parentNode.insertBefore(newMessagesIndicator, chatContainer.nextSibling);
      
      // Handle scroll event
      chatContainer.addEventListener('scroll', function() {
        // Detect if user has scrolled up
        const isScrolledToBottom = chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 50;
        
        if (!isScrolledToBottom) {
          userHasScrolled = true;
          autoScroll = false;
          scrollButton.classList.remove('d-none');
        } else {
          userHasScrolled = false;
          autoScroll = true;
          scrollButton.classList.add('d-none');
          newMessagesIndicator.classList.add('d-none');
        }
      });
      
      // Scroll to bottom when button is clicked
      scrollButton.addEventListener('click', function() {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        });
        autoScroll = true;
        userHasScrolled = false;
        newMessagesIndicator.classList.add('d-none');
      });
      
      // Add scroll to bottom method
      window.scrollToBottom = function() {
        if (autoScroll) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        } else if (userHasScrolled) {
          newMessagesIndicator.classList.remove('d-none');
        }
      };
      
      // Initial scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };
  
  // Prevent back button refresh problem
  const fixBackNavigation = function() {
    // Intercept the back button for chat list
    document.querySelectorAll('.back-to-chat-list').forEach(function(backButton) {
      backButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const chatList = sessionStorage.getItem('chatListHtml');
        
        if (chatList) {
          // We have cached chat list - load it directly
          history.pushState(null, null, this.getAttribute('href'));
          
          // Replace content with cached version
          const mainContainer = document.querySelector('.container');
          if (mainContainer) {
            mainContainer.innerHTML = chatList;
            
            // Restore animations and interactions
            initChatListInteractions();
          }
        } else {
          // No cache, do an AJAX request instead of direct navigation
          fetch(this.getAttribute('href'), {
            method: 'GET',
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            }
          })
          .then(response => response.text())
          .then(html => {
            // Parse the HTML response
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract the main container content
            const mainContent = doc.querySelector('.container').innerHTML;
            
            // Update the URL
            history.pushState(null, null, backButton.getAttribute('href'));
            
            // Replace content
            const mainContainer = document.querySelector('.container');
            if (mainContainer) {
              mainContainer.innerHTML = mainContent;
              
              // Cache for faster back navigation next time
              sessionStorage.setItem('chatListHtml', mainContent);
              
              // Initialize interactions on the chat list
              initChatListInteractions();
            }
          })
          .catch(error => {
            console.error('Error fetching chat list:', error);
            window.location.href = backButton.getAttribute('href');
          });
        }
      });
    });
  };
  
  // Initialize chat list interactions after navigation
  const initChatListInteractions = function() {
    // Add click handlers for chat room links in the list
    document.querySelectorAll('.chat-room-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        fetch(this.getAttribute('href'), {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        })
        .then(response => response.text())
        .then(html => {
          // Parse the HTML response
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Extract the main container content
          const mainContent = doc.querySelector('body').innerHTML;
          
          // Update the URL
          history.pushState(null, null, link.getAttribute('href'));
          
          // Replace entire document
          document.open();
          document.write(mainContent);
          document.close();
          
          // This will trigger DOMContentLoaded again and run our chat room initializers
        })
        .catch(error => {
          console.error('Error fetching chat room:', error);
          window.location.href = link.getAttribute('href');
        });
      });
    });
    
    // Re-run any animations needed for chat list
    document.querySelectorAll('.card').forEach(function(card, index) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(function() {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + (index * 150));
    });
  };
  
  // Save chat room URL to session storage for return navigation
  const saveChatRoomState = function() {
    if (document.getElementById('chat-messages')) {
      sessionStorage.setItem('lastChatRoom', window.location.href);
    }
  };
  
  // Run only on chat room page
  if (document.getElementById('chat-messages')) {
    disableMessageAnimations();
    addTypingIndicator();
    enhanceFileUpload();
    addScrollControls();
    fixBackNavigation();
    saveChatRoomState();
    
    // Add keyframe for fadeOut animation if not in animations.css
    if (!document.querySelector('style#chat-room-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-room-styles';
      style.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .message-image img {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .message-image img:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          margin: 10px;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #bbb;
          border-radius: 50%;
          display: inline-block;
          margin: 0 1px;
        }
        
        .typing-indicator span:nth-child(1) {
          animation: bounce 1s infinite 0.1s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation: bounce 1s infinite 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation: bounce 1s infinite 0.3s;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `;
      document.head.appendChild(style);
    }
  } else if (document.querySelector('.chat-list-container')) {
    // Initialize chat list interactions if we're on the chat list page
    initChatListInteractions();
  }
  
  // Handle history navigation (back/forward)
  window.addEventListener('popstate', function(event) {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/chat/') && currentPath.split('/').length > 2) {
      // We're navigating to a chat room, let the normal page load happen
      return;
    }
    
    if (currentPath.includes('/chats/')) {
      // We're going back to chat list
      const chatList = sessionStorage.getItem('chatListHtml');
      
      if (chatList) {
        // Use cached version
        const mainContainer = document.querySelector('.container');
        if (mainContainer) {
          mainContainer.innerHTML = chatList;
          initChatListInteractions();
          event.preventDefault();
        }
      }
    }
  });
}); 