// Comment Component Animations
document.addEventListener('DOMContentLoaded', function() {
  // Add animations to comments
  const animateComments = function() {
    const comments = document.querySelectorAll('.comment');
    
    comments.forEach(function(comment, index) {
      // Add staggered fade in
      comment.style.opacity = '0';
      comment.style.transform = 'translateY(10px)';
      
      setTimeout(function() {
        comment.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        comment.style.opacity = '1';
        comment.style.transform = 'translateY(0)';
      }, 100 + (index * 50));
      
      // Add hover effect
      comment.addEventListener('mouseenter', function() {
        const commentContent = this.querySelector('.comment-content');
        if (commentContent) {
          commentContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
          commentContent.style.transform = 'translateY(-2px)';
          commentContent.style.transition = 'all 0.3s ease';
        }
      });
      
      comment.addEventListener('mouseleave', function() {
        const commentContent = this.querySelector('.comment-content');
        if (commentContent) {
          commentContent.style.boxShadow = '';
          commentContent.style.transform = '';
        }
      });
    });
  };
  
  // Add animation to like/reply buttons
  const enhanceButtons = function() {
    // Comment action buttons
    const actionButtons = document.querySelectorAll('.comment-actions .btn');
    
    actionButtons.forEach(function(btn) {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.transition = 'all 0.2s ease';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
      
      // Add heart animation for like button
      if (btn.classList.contains('like-btn') || btn.querySelector('.fa-heart')) {
        btn.addEventListener('click', function() {
          // Add heart animation
          const heart = document.createElement('span');
          heart.innerHTML = '❤️';
          heart.style.cssText = `
            position: absolute;
            font-size: 1rem;
            left: 50%;
            top: 0;
            pointer-events: none;
            animation: float-up 0.8s forwards ease-out;
          `;
          
          this.style.position = 'relative';
          this.appendChild(heart);
          
          setTimeout(function() {
            heart.remove();
          }, 800);
        });
      }
      
      // Add toggle animation for reply form
      if (btn.classList.contains('reply-btn') || btn.textContent.includes('Reply')) {
        btn.addEventListener('click', function() {
          const commentId = this.closest('.comment').getAttribute('data-comment-id');
          const replyForm = document.querySelector(`.reply-form[data-parent="${commentId}"]`);
          
          if (replyForm) {
            if (replyForm.style.display === 'none' || !replyForm.style.display) {
              replyForm.style.display = 'block';
              replyForm.style.opacity = '0';
              replyForm.style.transform = 'translateY(10px)';
              
              setTimeout(function() {
                replyForm.style.transition = 'all 0.3s ease';
                replyForm.style.opacity = '1';
                replyForm.style.transform = 'translateY(0)';
                
                // Focus on textarea
                const textarea = replyForm.querySelector('textarea');
                if (textarea) {
                  textarea.focus();
                }
              }, 10);
            } else {
              replyForm.style.opacity = '0';
              replyForm.style.transform = 'translateY(10px)';
              
              setTimeout(function() {
                replyForm.style.display = 'none';
              }, 300);
            }
          }
        });
      }
    });
  };
  
  // Enhance comment submission
  const enhanceCommentForm = function() {
    const commentForms = document.querySelectorAll('.comment-form, .reply-form');
    
    commentForms.forEach(function(form) {
      // Add animation to textarea
      const textarea = form.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('focus', function() {
          this.style.transition = 'all 0.3s ease';
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
        
        textarea.addEventListener('blur', function() {
          this.style.transform = '';
          this.style.boxShadow = '';
        });
      }
      
      // Add animation to submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
          this.style.transition = 'all 0.2s ease';
        });
        
        submitBtn.addEventListener('mouseleave', function() {
          this.style.transform = '';
          this.style.boxShadow = '';
        });
        
        // Add submission animation
        form.addEventListener('submit', function() {
          // Show loading spinner
          if (submitBtn.innerHTML.indexOf('fa-spinner') === -1) {
            submitBtn.originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Reset button after delay (in a real app this would be after AJAX completes)
            setTimeout(function() {
              submitBtn.innerHTML = '<i class="fas fa-check"></i>';
              
              setTimeout(function() {
                submitBtn.innerHTML = submitBtn.originalHTML;
              }, 1000);
            }, 800);
          }
        });
      }
    });
  };
  
  // Add animations for comment deletion
  const enhanceDeleteButtons = function() {
    const deleteButtons = document.querySelectorAll('.delete-comment');
    
    deleteButtons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        // Get the parent comment
        const comment = this.closest('.comment');
        if (!comment) return;
        
        // Add fade out animation
        comment.style.transition = 'all 0.5s ease';
        comment.style.opacity = '0';
        comment.style.transform = 'translateY(20px)';
        comment.style.height = comment.offsetHeight + 'px';
        
        setTimeout(function() {
          comment.style.height = '0px';
          comment.style.marginBottom = '0px';
          comment.style.paddingTop = '0px';
          comment.style.paddingBottom = '0px';
          
          // In a real app, this would be after confirmation and AJAX delete
          setTimeout(function() {
            comment.remove();
          }, 300);
        }, 300);
      });
    });
  };
  
  // Run only if comment elements exist
  if (document.querySelectorAll('.comment').length > 0) {
    animateComments();
    enhanceButtons();
    enhanceCommentForm();
    enhanceDeleteButtons();
    
    // Add animation styles
    if (!document.querySelector('style#comment-styles')) {
      const style = document.createElement('style');
      style.id = 'comment-styles';
      style.textContent = `
        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -20px); opacity: 0; }
        }
        
        .comment {
          transition: all 0.3s ease;
        }
        
        .comment-content {
          transition: all 0.3s ease;
        }
        
        .comment-actions .btn {
          position: relative;
          transition: all 0.2s ease;
        }
        
        .reply-form {
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Comment functionality
  console.log('Comment script loaded');
  
  // Handle comment reactions via HTMX
  document.body.addEventListener('htmx:afterSwap', function(event) {
    if (event.detail.target.classList.contains('comment-reaction-btn')) {
      console.log('Reaction button updated:', event.detail.target);
      
      // Ensure the comment section stays open if it was open
      const commentSection = event.detail.target.closest('.collapse');
      if (commentSection && !commentSection.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(commentSection, {
          toggle: false
        });
        bsCollapse.show();
      }
    }
  });
  
  // Handle reply button clicks
  document.addEventListener('click', function(event) {
    const replyBtn = event.target.closest('.comment-reply-btn');
    if (replyBtn) {
      event.preventDefault();
      const commentId = replyBtn.getAttribute('data-comment-id');
      console.log('Reply button clicked for comment:', commentId);
      
      const replyForm = document.getElementById(`reply-form-${commentId}`);
      if (replyForm) {
        // Hide all other reply forms
        document.querySelectorAll('.reply-form-container').forEach(container => {
          if (container !== replyForm) {
            container.classList.add('d-none');
          }
        });
        
        // Toggle current reply form
        replyForm.classList.toggle('d-none');
        
        // Focus on input if form is shown
        if (!replyForm.classList.contains('d-none')) {
          const input = replyForm.querySelector('input[name="content"]');
          if (input) {
            input.focus();
          }
        }
      }
    }
  });
  
  // Handle reply form submissions
  document.addEventListener('submit', function(event) {
    const form = event.target.closest('.comment-reply-form');
    if (form) {
      event.preventDefault();
      console.log('Reply form submitted');
      
      const commentId = form.getAttribute('data-comment-id');
      const content = form.querySelector('input[name="content"]').value;
      
      // Get the post ID from the comment section
      let postId;
      const commentSection = form.closest('.collapse');
      if (commentSection) {
        postId = commentSection.id.replace('commentSection-', '');
      } else {
        // Fallback to the post card
        const postElement = form.closest('.card');
        if (postElement) {
          const dataPostElement = postElement.querySelector('[data-post-id]');
          if (dataPostElement) {
            postId = dataPostElement.getAttribute('data-post-id');
          }
        }
      }
      
      if (!postId) {
        console.error('Could not find post ID');
        return;
      }
      
      console.log(`Submitting reply to comment ${commentId} for post ${postId}`);
      
      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      // Send the reply
      fetch(`/comment/${commentId}/reply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          content: content,
          post_id: postId
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Reply response:', data);
        if (data.success) {
          // Clear the form
          form.reset();
          
          // Hide the reply form
          form.closest('.reply-form-container').classList.add('d-none');
          
          // Refresh the comments list
          const commentsList = document.querySelector(`#commentsList-${postId}`);
          if (commentsList) {
            console.log('Refreshing comments list');
            htmx.trigger(commentsList, 'revealed');
            
            // After a short delay, scroll to the new reply
            setTimeout(() => {
              const replyElement = document.getElementById(`comment-${data.comment_id}`);
              if (replyElement) {
                replyElement.scrollIntoView({ behavior: 'smooth' });
                replyElement.classList.add('highlight-new');
                setTimeout(() => {
                  replyElement.classList.remove('highlight-new');
                }, 2000);
              }
            }, 500);
          } else {
            console.error(`Comments list element #commentsList-${postId} not found`);
          }
        } else {
          console.error('Error submitting reply:', data.error);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });
});