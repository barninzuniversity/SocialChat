// Post and Comment Reactions JS
document.addEventListener('DOMContentLoaded', function() {
  // Handle post reactions
  setupPostReactions();
  
  // Handle comment submissions
  setupCommentSubmission();
  
  // Handle comment reactions
  setupCommentReactions();
});

function setupPostReactions() {
  // Target all reaction buttons
  const reactionButtons = document.querySelectorAll('.btn-reaction');
  
  reactionButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const postId = this.getAttribute('data-post');
      const reactionType = this.getAttribute('data-reaction');
      
      // Use the exact URL from the hx-post attribute
      const url = this.getAttribute('hx-post') || `/post/${postId}/react/`;
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      // Send reaction via fetch API
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
        },
        body: `reaction_type=${reactionType}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Update reaction count display
          const reactionsCount = document.querySelector(`.reactions-count[data-post-id="${postId}"]`);
          if (reactionsCount) {
            if (data.count > 0) {
              reactionsCount.innerHTML = `
                <span class="reactions-badge">
                  <i class="fas fa-thumbs-up text-primary"></i>
                  <span class="ms-1">${data.count}</span>
                </span>
              `;
              reactionsCount.style.display = 'block';
            } else {
              reactionsCount.innerHTML = '';
            }
          }
          
          // Toggle active class on the reaction button
          const mainReactionBtn = button.closest('.reaction-btn-group').querySelector('.reaction-btn');
          if (data.action === 'added' || data.action === 'updated') {
            mainReactionBtn.classList.add('active');
            mainReactionBtn.innerHTML = `<i class="fas fa-thumbs-up me-1 text-primary"></i> ${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`;
          } else if (data.action === 'removed') {
            mainReactionBtn.classList.remove('active');
            mainReactionBtn.innerHTML = `<i class="far fa-thumbs-up me-1"></i> Like`;
          }
          
          // Add floating animation
          createHeartAnimation(this);
        }
      })
      .catch(error => console.error('Error:', error));
    });
  });
}

function setupCommentSubmission() {
  // Target all comment forms
  const commentForms = document.querySelectorAll('.comment-form');
  
  commentForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const postId = this.getAttribute('data-post-id');
      // Use the exact URL from the hx-post attribute
      const url = this.getAttribute('hx-post') || `/post/${postId}/comment/`;
      const formData = new FormData(this);
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      // Get the input value to prevent sending empty comments
      const inputElement = this.querySelector('input[name="content"]');
      if (!inputElement || !inputElement.value.trim()) {
        return; // Don't submit empty comments
      }
      
      // Clear the input field immediately for better UX
      const commentText = inputElement.value.trim();
      inputElement.value = '';
      
      // Send comment to server
      fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Trigger the HTMX refresh manually
          const commentsList = document.querySelector(`#commentsList-${postId}`);
          if (commentsList && commentsList.getAttribute('hx-get')) {
            // Dispatch an event to trigger HTMX
            const event = new Event('htmx:load');
            commentsList.dispatchEvent(event);
            
            // Manually load fresh data via HTMX
            htmx.trigger(commentsList, 'get');
            
            // Update the comment count
            const count = data.count || 0;
            updateCommentCountDisplay(postId, count);
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  });
}

function updateCommentCountDisplay(postId, count) {
  // Update the comment count text if it exists
  const commentsCount = document.querySelector(`.comments-count[data-post-id="${postId}"]`);
  if (commentsCount) {
    // Apply a subtle animation to highlight the count change
    commentsCount.classList.add('count-update-animation');
    commentsCount.textContent = `${count} comment${count !== 1 ? 's' : ''}`;
    commentsCount.style.display = 'inline';
    
    // Remove animation class after animation completes
    setTimeout(() => {
      commentsCount.classList.remove('count-update-animation');
    }, 600);
  } else {
    // Create comments count element if it doesn't exist
    const countContainer = document.querySelector(`.comments-shares-count`);
    if (countContainer) {
      const newCountSpan = document.createElement('span');
      newCountSpan.className = 'small text-muted me-2 comments-count count-update-animation';
      newCountSpan.setAttribute('data-post-id', postId);
      newCountSpan.textContent = `${count} comment${count !== 1 ? 's' : ''}`;
      countContainer.prepend(newCountSpan);
      
      // Remove animation class after animation completes
      setTimeout(() => {
        newCountSpan.classList.remove('count-update-animation');
      }, 600);
    }
  }
}

function setupCommentReactions() {
  // Use event delegation for comment reactions (including dynamically added ones)
  document.addEventListener('click', function(e) {
    // Handle reaction button in dropdown
    if (e.target.closest('.btn-reaction')) {
      e.preventDefault();
      const reactionBtn = e.target.closest('.btn-reaction');
      const commentId = reactionBtn.getAttribute('data-comment-id');
      const reactionType = reactionBtn.getAttribute('data-type');
      
      // Get the URL and CSRF token
      const url = `/comment/${commentId}/react/`;
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      // Send reaction via fetch API
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
        },
        body: `reaction_type=${reactionType}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Hide dropdown
          const dropdown = reactionBtn.closest('.dropdown-menu');
          if (dropdown) {
            $(dropdown).dropdown('hide');
          }
          
          // Update reaction button display
          const triggerBtn = document.querySelector(`.comment-reaction-trigger[data-comment-id="${commentId}"]`);
          if (triggerBtn) {
            // Update reaction count
            const countElement = triggerBtn.querySelector('.reaction-count');
            if (countElement) {
              countElement.textContent = data.count;
            }
            
            // Get emoji and text for selected reaction
            let icon, text, colorClass = '';
            
            switch(reactionType) {
              case 'like':
                icon = 'fas fa-thumbs-up';
                text = 'Like';
                break;
              case 'love':
                icon = 'fas fa-heart';
                text = 'Love';
                colorClass = 'text-danger';
                break;
              case 'haha':
                icon = 'fas fa-laugh-squint';
                text = 'Haha';
                colorClass = 'text-warning';
                break;
              case 'wow':
                icon = 'fas fa-surprise';
                text = 'Wow';
                colorClass = 'text-warning';
                break;
              case 'sad':
                icon = 'fas fa-sad-tear';
                text = 'Sad';
                colorClass = 'text-primary';
                break;
              case 'angry':
                icon = 'fas fa-angry';
                text = 'Angry';
                colorClass = 'text-danger';
                break;
              default:
                icon = 'fas fa-thumbs-up';
                text = 'Like';
            }
            
            if (data.action === 'removed') {
              // Reset to default state
              triggerBtn.innerHTML = `<i class="far fa-thumbs-up me-1"></i> Like <span class="reaction-count">${data.count}</span>`;
              triggerBtn.classList.remove('active');
            } else {
              // Update to show reaction
              triggerBtn.innerHTML = `<i class="${icon} me-1 ${colorClass}"></i> ${text} <span class="reaction-count">${data.count}</span>`;
              triggerBtn.classList.add('active');
            }
            
            // Add heart animation
            createHeartAnimation(triggerBtn);
          }
        }
      })
      .catch(error => console.error('Error:', error));
    }
    
    // Legacy support for old reaction buttons
    const legacyButton = e.target.closest('.comment-reaction-btn');
    if (legacyButton && !e.target.closest('.btn-reaction')) {
      e.preventDefault();
      
      const commentId = legacyButton.getAttribute('data-comment-id');
      // Use the exact URL from the hx-post attribute
      const url = legacyButton.getAttribute('hx-post') || `/comment/${commentId}/react/`;
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      // Send reaction via fetch API
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
        },
        body: 'reaction_type=like'
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Update reaction count
          const countElement = legacyButton.querySelector('.reaction-count');
          if (countElement) {
            countElement.textContent = data.count;
          }
          
          // Toggle active class
          if (data.action === 'added') {
            legacyButton.classList.add('active');
            legacyButton.querySelector('i').classList.replace('far', 'fas');
          } else if (data.action === 'removed') {
            legacyButton.classList.remove('active');
            legacyButton.querySelector('i').classList.replace('fas', 'far');
          }
          
          // Add heart animation
          createHeartAnimation(legacyButton);
        }
      })
      .catch(error => console.error('Error:', error));
    }
  });
  
  // Reply to comments
  document.addEventListener('click', function(e) {
    const replyBtn = e.target.closest('.comment-reply-btn');
    if (replyBtn) {
      e.preventDefault();
      
      const commentId = replyBtn.getAttribute('data-comment-id');
      const username = replyBtn.getAttribute('data-username');
      const commentElement = document.getElementById(`comment-${commentId}`);
      
      // Remove any existing open reply forms
      document.querySelectorAll('.reply-form-container').forEach(form => {
        if (!form.closest('.d-none')) {
          form.remove();
        }
      });
      
      // Clone the template
      const replyTemplate = document.getElementById('reply-form-template');
      if (replyTemplate && commentElement) {
        const replyForm = replyTemplate.querySelector('.reply-form-container').cloneNode(true);
        replyForm.classList.remove('d-none');
        
        // Set the parent comment ID
        replyForm.querySelector('input[name="parent_comment_id"]').value = commentId;
        
        // Set placeholder text
        replyForm.querySelector('input[name="content"]').placeholder = `Reply to @${username}...`;
        
        // Add reply form after the comment
        const commentContent = commentElement.querySelector('.comment-content');
        if (commentContent) {
          if (commentContent.querySelector('.comment-replies')) {
            commentContent.querySelector('.comment-replies').before(replyForm);
          } else {
            commentContent.appendChild(replyForm);
          }
          
          // Focus the input
          replyForm.querySelector('input[name="content"]').focus();
          
          // Handle submit event
          replyForm.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const content = this.querySelector('input[name="content"]').value;
            const parentCommentId = this.querySelector('input[name="parent_comment_id"]').value;
            const postId = commentElement.closest('[data-post-id]').getAttribute('data-post-id');
            
            if (content && postId) {
              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
              
              // Send reply via fetch API
              fetch(`/post/${postId}/comment/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'X-CSRFToken': csrfToken,
                },
                body: `content=${encodeURIComponent(content)}&parent_comment_id=${parentCommentId}`
              })
              .then(response => response.json())
              .then(data => {
                if (data.status === 'success') {
                  // Create reply container if it doesn't exist
                  let repliesContainer = commentContent.querySelector('.comment-replies');
                  if (!repliesContainer) {
                    repliesContainer = document.createElement('div');
                    repliesContainer.className = 'comment-replies mt-2 ps-3 border-start';
                    commentContent.appendChild(repliesContainer);
                  }
                  
                  // Insert the new reply
                  repliesContainer.insertAdjacentHTML('beforeend', data.html);
                  
                  // Remove the reply form
                  replyForm.remove();
                }
              })
              .catch(error => console.error('Error:', error));
            }
          });
        }
      }
    }
  });
}

function createHeartAnimation(element) {
  // Create floating heart animation
  const heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.style.cssText = `
    position: absolute;
    font-size: 1.2rem;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 100;
    animation: float-up 0.8s forwards ease-out;
  `;
  
  // Set relative position on parent if not already set
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.position === 'static') {
    element.style.position = 'relative';
  }
  
  // Add heart to element
  element.appendChild(heart);
  
  // Remove after animation completes
  setTimeout(() => heart.remove(), 800);
  
  // Add animation keyframes if not already added
  if (!document.querySelector('style#heart-animation')) {
    const style = document.createElement('style');
    style.id = 'heart-animation';
    style.textContent = `
      @keyframes float-up {
        0% { transform: translate(-50%, 0); opacity: 1; }
        100% { transform: translate(-50%, -20px); opacity: 0; }
      }
      
      @keyframes count-update {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); color: var(--ig-primary); }
        100% { transform: scale(1); }
      }
      
      .count-update-animation {
        animation: count-update 0.6s ease;
      }
    `;
    document.head.appendChild(style);
  }
} 