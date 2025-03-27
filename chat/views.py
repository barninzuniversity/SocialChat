from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import JsonResponse, StreamingHttpResponse, HttpResponseForbidden, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
import json, asyncio, time
from datetime import datetime
from channels.db import database_sync_to_async
from .models import Profile, FriendRequest, Post, ChatRoom, Message, BlockedPost, PostReaction, Comment, CommentReaction, PostShare, Repost, FriendList, MessageReaction
from .forms import ProfileForm, PostForm
from django.db.models.functions import Now
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.backends.signals import connection_created
from django.db.utils import OperationalError
from django.db.models import Q
from django.template.loader import render_to_string
from django.middleware.csrf import get_token
from django.db.utils import IntegrityError
from django.urls import reverse

# Dictionary to store message queues for each chat room
message_queues = {}

# Define reaction types
REACTION_TYPES = [
    ('like', '👍'),
    ('love', '❤️'),
    ('haha', '😂'),
    ('wow', '😮'),
    ('sad', '😢'),
    ('angry', '😡'),
]

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created successfully. You can now log in.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

@login_required
def home(request):
    """Display the home feed with posts"""
    user_profile = request.user.profile
    blocked_users = user_profile.blocked_users.all()
    
    # Get friend IDs to filter posts
    friend_connections, created = FriendList.objects.get_or_create(user=user_profile)
    friends = friend_connections.friends.all()
    
    # Combine the user's and friends' profiles for the feed
    feed_profiles = list(friends) + [user_profile]
    
    # Query posts from the user and their friends, excluding blocked users
    posts = Post.objects.filter(
        author__in=feed_profiles
    ).exclude(
        author__in=blocked_users
    ).order_by('-created_at')
    
    # Check user reactions for each post
    for post in posts:
        post.user_reaction = PostReaction.objects.filter(post=post, user=user_profile).first()
        # Add user reaction info to comments
        for comment in post.comments.all():
            comment.user_has_reacted = CommentReaction.objects.filter(comment=comment, user=user_profile).exists()
    
    # Friend requests
    friend_requests = FriendRequest.objects.filter(to_user=user_profile, status='pending')
    
    # Process post creation form
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = user_profile
            post.save()
            messages.success(request, "Post created successfully!")
            return redirect('home')
    else:
        form = PostForm()
    
    context = {
        'posts': posts,
        'friend_requests': friend_requests,
        'form': form,
    }
    
    return render(request, 'chat/home.html', context)

@login_required
def profile_detail(request, username):
    user = get_object_or_404(User, username=username)
    profile = user.profile
    
    # Get user's own posts - use .all() to reset ordering
    own_posts = Post.objects.filter(author=profile).all()
    
    # Get posts that the user reposted
    reposted_post_ids = Repost.objects.filter(repost__author=profile).values_list('original_post_id', flat=True)
    reposted_posts = Post.objects.filter(id__in=reposted_post_ids).all()
    
    # Combined posts (own + reposted)
    posts = own_posts.union(reposted_posts).order_by('-created_at')
    
    # Check friend status
    is_friend = request.user.profile.friends.filter(id=profile.id).exists()
    
    # Check if friend request exists
    friend_request_sent = FriendRequest.objects.filter(
        from_user=request.user.profile,
        to_user=profile,
        status='pending'
    ).exists()
    
    friend_request_received = FriendRequest.objects.filter(
        from_user=profile,
        to_user=request.user.profile,
        status='pending'
    ).exists()
    
    context = {
        'profile': profile,
        'posts': posts,
        'is_friend': is_friend,
        'is_self': request.user == user,
        'friend_request_sent': friend_request_sent,
        'friend_request_received': friend_request_received,
    }
    return render(request, 'chat/profile_detail.html', context)

@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully.')
            return redirect('profile_detail', username=request.user.username)
    else:
        form = ProfileForm(instance=request.user.profile)
    
    return render(request, 'chat/edit_profile.html', {'form': form})

@login_required
def send_friend_request(request, username):
    to_user = get_object_or_404(User, username=username)
    from_user = request.user.profile
    
    if from_user == to_user.profile:
        messages.error(request, "You cannot send a friend request to yourself.")
        return redirect('profile_detail', username=username)
    
    if from_user.friends.filter(id=to_user.profile.id).exists():
        messages.info(request, "You are already friends with this user.")
        return redirect('profile_detail', username=username)
    
    friend_request, created = FriendRequest.objects.get_or_create(
        from_user=from_user,
        to_user=to_user.profile
    )
    
    if created:
        messages.success(request, f"Friend request sent to {to_user.username}.")
    else:
        messages.info(request, f"Friend request to {to_user.username} already exists.")
    
    return redirect('profile_detail', username=username)

@login_required
def respond_friend_request(request, request_id, action):
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=request.user.profile)
    
    if action == 'accept':
        friend_request.status = 'accepted'
        friend_request.save()
        
        # Add to friends list (both ways due to symmetrical=True)
        request.user.profile.friends.add(friend_request.from_user)
        
        messages.success(request, f"You are now friends with {friend_request.from_user.user.username}.")
    
    elif action == 'reject':
        friend_request.status = 'rejected'
        friend_request.save()
        messages.info(request, f"Friend request from {friend_request.from_user.user.username} rejected.")
    
    return redirect('home')

@login_required
def chat_list(request):
    user_profile = request.user.profile
    chat_rooms = ChatRoom.objects.filter(participants=user_profile)
    
    context = {
        'chat_rooms': chat_rooms
    }
    return render(request, 'chat/chat_list.html', context)

@login_required
def create_or_get_direct_chat(request, username):
    other_user = get_object_or_404(User, username=username)
    user_profile = request.user.profile
    other_profile = other_user.profile
    
    # Check if users are friends
    if not user_profile.friends.filter(id=other_profile.id).exists():
        messages.error(request, "You can only chat with your friends.")
        return redirect('profile_detail', username=username)
    
    # Find existing direct chat
    common_chats = ChatRoom.objects.filter(
        participants=user_profile,
        is_group_chat=False
    ).filter(
        participants=other_profile
    )
    
    if common_chats.exists():
        chat_room = common_chats.first()
    else:
        # Create new chat room
        chat_room = ChatRoom.objects.create(is_group_chat=False)
        chat_room.participants.add(user_profile, other_profile)
    
    return redirect('chat_room', room_id=chat_room.id)

@login_required
def chat_room(request, room_id):
    chat_room = get_object_or_404(ChatRoom, id=room_id)
    user_profile = request.user.profile
    
    # Check if user is participant
    if not chat_room.participants.filter(id=user_profile.id).exists():
        messages.error(request, "You cannot access this chat room.")
        return redirect('chat_list')
    
    # Get messages
    messages_list = Message.objects.filter(room=chat_room).order_by('timestamp')
    
    # Mark unread messages as read
    unread_messages = messages_list.filter(
        is_read=False
    ).exclude(sender=user_profile)
    
    for msg in unread_messages:
        msg.is_read = True
        msg.save()
    
    # Get other participants
    other_participants = chat_room.participants.exclude(id=user_profile.id)
    
    context = {
        'chat_room': chat_room,
        'messages': messages_list,
        'user_profile': user_profile,
        'other_participants': other_participants,
    }
    
    return render(request, 'chat/chat_room.html', context)

@login_required
def friends_list(request):
    user_profile = request.user.profile
    friends = user_profile.friends.all()
    
    context = {
        'friends': friends
    }
    
    return render(request, 'chat/friends_list.html', context)

@login_required
def search_users(request):
    query = request.GET.get('q', '')
    if query:
        users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)
    else:
        users = User.objects.none()
    
    context = {
        'users': users,
        'query': query
    }
    
    return render(request, 'chat/search_users.html', context)

@login_required
def delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    # Check if the user is the author of the post
    if post.author.user != request.user:
        messages.error(request, "You cannot delete posts that aren't yours.")
        return redirect('home')
    
    if request.method == 'POST':
        post.delete()
        messages.success(request, "Post deleted successfully.")
        
    return redirect('home')

@login_required
def block_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user_profile = request.user.profile
    
    # Cannot block your own post
    if post.author == user_profile:
        messages.error(request, "You cannot block your own post.")
        return redirect('home')
    
    # Check if already blocked
    block, created = BlockedPost.objects.get_or_create(user=user_profile, post=post)
    
    if created:
        messages.success(request, f"Post by {post.author.user.username} has been blocked.")
    else:
        messages.info(request, f"Post was already blocked.")
    
    return redirect('home')

@login_required
def block_user(request, username):
    target_user = get_object_or_404(User, username=username)
    user_profile = request.user.profile
    target_profile = target_user.profile
    
    # Cannot block yourself
    if target_user == request.user:
        messages.error(request, "You cannot block yourself.")
        return redirect('home')
    
    # Add to blocked users
    user_profile.blocked_users.add(target_profile)
    
    # Remove from friends if they are friends
    if user_profile.friends.filter(id=target_profile.id).exists():
        user_profile.friends.remove(target_profile)
        messages.info(request, f"{target_user.username} has been removed from your friends.")
    
    # Delete any pending friend requests
    FriendRequest.objects.filter(
        (Q(from_user=user_profile) & Q(to_user=target_profile)) |
        (Q(from_user=target_profile) & Q(to_user=user_profile))
    ).delete()
    
    messages.success(request, f"{target_user.username} has been blocked.")
    
    # Redirect to previous page or home
    return redirect(request.META.get('HTTP_REFERER', 'home'))

@login_required
def unblock_user(request, username):
    target_user = get_object_or_404(User, username=username)
    user_profile = request.user.profile
    target_profile = target_user.profile
    
    # Remove from blocked users
    user_profile.blocked_users.remove(target_profile)
    
    messages.success(request, f"{target_user.username} has been unblocked.")
    
    return redirect('home')

@login_required
def blocked_users(request):
    user_profile = request.user.profile
    blocked = user_profile.blocked_users.all()
    
    context = {
        'blocked_users': blocked
    }
    
    return render(request, 'chat/blocked_users.html', context)

@login_required
def get_messages(request, room_id):
    """Get messages for a chat room"""
    chat_room = get_object_or_404(ChatRoom, id=room_id)
    user_profile = request.user.profile
    
    # Check if user is participant
    if not chat_room.participants.filter(id=user_profile.id).exists():
        return JsonResponse({'status': 'error', 'message': 'Access denied'}, status=403)
    
    # Get messages
    messages_list = Message.objects.filter(room=chat_room).order_by('timestamp')
    
    # Mark unread messages as read
    unread_messages = messages_list.filter(
        is_read=False
    ).exclude(sender=user_profile)
    
    for msg in unread_messages:
        msg.is_read = True
        msg.save()
    
    # Render messages template
    messages_html = render_to_string('chat/messages.html', {
        'messages': messages_list,
        'user_profile': user_profile
    }, request=request)
    
    return JsonResponse({
        'status': 'success',
        'messages': messages_html
    })

@login_required
def send_message(request, room_id):
    """Send a message to a chat room"""
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    
    chat_room = get_object_or_404(ChatRoom, id=room_id)
    user_profile = request.user.profile
    
    # Check if user is participant
    if not chat_room.participants.filter(id=user_profile.id).exists():
        return JsonResponse({'status': 'error', 'message': 'Access denied'}, status=403)
    
    content = request.POST.get('content', '')
    image = request.FILES.get('image', None)
    file = request.FILES.get('file', None)
    reply_to_id = request.POST.get('reply_to', None)
    
    # At least one field should be present
    if not content and not image and not file:
        return JsonResponse({'status': 'error', 'message': 'Message cannot be empty'}, status=400)
    
    # Create message instance
    message = Message(
        room=chat_room,
        sender=user_profile,
        content=content
    )
    
    # Handle reply
    if reply_to_id:
        try:
            original_message = Message.objects.get(id=reply_to_id, room=chat_room)
            message.reply_to = original_message
        except Message.DoesNotExist:
            pass
    
    # Handle image and file
    if image:
        message.image = image
    
    if file:
        message.file = file
    
    # Save message
    message.save()
    
    # Get all chat room participants except the sender
    other_participants = chat_room.participants.exclude(id=user_profile.id)
    
    # Add message to the appropriate message queue for SSE
    if room_id in message_queues:
        # Notify all connected clients about the new message
        message_queues[room_id].put({
            'type': 'message',
            'id': message.id,
            'content': message.content,
            'sender': message.sender.user.username,
            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return JsonResponse({
        'status': 'success',
        'message': {
            'id': message.id,
            'content': message.content
        }
    })

@login_required
def message_stream(request, room_id):
    """Stream messages using Server-Sent Events (SSE)"""
    chat_room = get_object_or_404(ChatRoom, id=room_id)
    user_profile = request.user.profile
    
    # Check if user is participant
    if not chat_room.participants.filter(id=user_profile.id).exists():
        return HttpResponseForbidden("Access denied")
    
    def event_stream():
        last_id = 0
        while True:
            # Get new messages
            messages = Message.objects.filter(
                room=chat_room,
                id__gt=last_id
            ).order_by('timestamp')
            
            if messages.exists():
                last_id = messages.last().id
                data = {
                    'type': 'message',
                    'messages': [
                        {
                            'id': msg.id,
                            'content': msg.content,
                            'sender': msg.sender.user.username,
                            'timestamp': msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                        }
                        for msg in messages
                    ]
                }
                yield f"data: {json.dumps(data)}\n\n"
            
            time.sleep(1)  # Wait 1 second before checking for new messages
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

@login_required
def add_post_reaction(request, post_id):
    """Add a reaction to a post"""
    if request.method == 'POST':
        reaction_type = request.POST.get('reaction_type', 'like')
        post = get_object_or_404(Post, id=post_id)
        user_profile = request.user.profile
        
        try:
            # Check if user already reacted to this post
            existing_reaction = PostReaction.objects.filter(post=post, user=user_profile).first()
            
            if existing_reaction:
                # If the reaction is the same, remove it (toggle off)
                if existing_reaction.reaction_type == reaction_type:
                    existing_reaction.delete()
                    return JsonResponse({'status': 'success', 'action': 'removed', 'count': post.reactions.count()})
                else:
                    # Update to new reaction type
                    existing_reaction.reaction_type = reaction_type
                    existing_reaction.save()
                    return JsonResponse({'status': 'success', 'action': 'updated', 'type': reaction_type, 'count': post.reactions.count()})
            else:
                # Create new reaction
                PostReaction.objects.create(
                    post=post,
                    user=user_profile,
                    reaction_type=reaction_type
                )
                return JsonResponse({'status': 'success', 'action': 'added', 'type': reaction_type, 'count': post.reactions.count()})
        except IntegrityError:
            # If there's a race condition (user double-clicked), handle it gracefully
            # Just get the current reaction count and return it
            return JsonResponse({'status': 'success', 'action': 'exists', 'count': post.reactions.count()})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

@login_required
def add_comment(request, post_id):
    """Add a comment to a post"""
    if request.method == 'POST':
        content = request.POST.get('content')
        parent_comment_id = request.POST.get('parent_comment_id')
        
        if not content:
            return JsonResponse({'status': 'error', 'message': 'Comment content is required'}, status=400)
        
        post = get_object_or_404(Post, id=post_id)
        user_profile = request.user.profile
        
        # Create comment with optional parent_comment
        comment_data = {
            'post': post,
            'author': user_profile,
            'content': content
        }
        
        # If this is a reply to another comment
        if parent_comment_id:
            try:
                parent_comment = Comment.objects.get(id=parent_comment_id)
                comment_data['parent_comment'] = parent_comment
            except Comment.DoesNotExist:
                pass
                
        comment = Comment.objects.create(**comment_data)
        
        # Set user reaction info for template
        comment.user_has_reacted = False
        
        # Render the comment HTML
        html = render_to_string('chat/comment.html', {
            'comment': comment,
            'user_profile': user_profile,
            'csrf_token': get_token(request)
        }, request=request)
        
        return JsonResponse({
            'status': 'success', 
            'html': html, 
            'comment_id': comment.id, 
            'count': post.comments.count(),
            'is_reply': bool(parent_comment_id)
        })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

@login_required
def add_comment_reaction(request, comment_id):
    if request.method == 'POST':
        try:
            data = {}
            if request.headers.get('Content-Type') == 'application/json' and request.body:
                data = json.loads(request.body)
            reaction_type = data.get('reaction_type', 'like')
            
            # Validate reaction type
            valid_reactions = [r[0] for r in REACTION_TYPES]
            if reaction_type not in valid_reactions:
                return JsonResponse({'success': False, 'error': 'Invalid reaction type'})
            
            comment = Comment.objects.get(id=comment_id)
            user_profile = request.user.profile
            
            # Check if a reaction already exists
            try:
                existing_reaction = CommentReaction.objects.get(
                    comment=comment,
                    user=user_profile
                )
                
                # If reaction exists with same type, remove it (toggle)
                if existing_reaction.reaction_type == reaction_type:
                    existing_reaction.delete()
                    user_has_reacted = False
                else:
                    # If different type, update it
                    existing_reaction.reaction_type = reaction_type
                    existing_reaction.save()
                    user_has_reacted = True
            except CommentReaction.DoesNotExist:
                # Create new reaction
                CommentReaction.objects.create(
                    comment=comment,
                    user=user_profile,
                    reaction_type=reaction_type
                )
                user_has_reacted = True
            
            # Get updated reaction count
            reaction_count = comment.reactions.count()
            
            # If this is an HTMX request, return the updated button
            if request.headers.get('HX-Request'):
                button_html = f'''
                <button class="btn btn-sm btn-link p-0 me-2 comment-reaction-btn {'active' if user_has_reacted else ''}" 
                        data-comment-id="{comment.id}"
                        hx-post="{reverse('add_comment_reaction', args=[comment.id])}"
                        hx-vals='{{"reaction_type": "like"}}'
                        hx-headers='{{"X-CSRFToken": "{get_token(request)}"}}' 
                        hx-target="closest .comment-reaction-btn"
                        hx-swap="outerHTML">
                    <i class="{'fas' if user_has_reacted else 'far'} fa-thumbs-up me-1"></i> Like
                    <span class="reaction-count">{reaction_count}</span>
                </button>
                '''
                return HttpResponse(button_html)
            else:
                # Return JSON response for non-HTMX requests
                return JsonResponse({
                    'success': True,
                    'user_has_reacted': user_has_reacted,
                    'reaction_count': reaction_count
                })
            
        except Comment.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Comment not found'}, status=404)
        except Exception as e:
            print(f"Error in add_comment_reaction: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
            
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

@login_required
def share_dialog(request, post_id):
    """Show dialog to share a post with friends"""
    post = get_object_or_404(Post, id=post_id)
    user_profile = request.user.profile
    
    # Get list of friends to share with
    friends = user_profile.friends.all()
    
    return render(request, 'chat/share_dialog.html', {
        'post': post,
        'friends': friends
    })

@login_required
def share_post(request, post_id):
    """Share a post with selected friends"""
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        user_profile = request.user.profile
        
        # Get share recipients
        recipient_ids = request.POST.getlist('share_with')
        comment = request.POST.get('comment', '')
        
        if not recipient_ids:
            messages.warning(request, "Please select at least one friend to share with.")
            return redirect('share_dialog', post_id=post_id)
        
        # Create shares for each recipient
        for recipient_id in recipient_ids:
            recipient = get_object_or_404(Profile, id=recipient_id)
            
            # Create the share
            PostShare.objects.create(
                post=post,
                shared_by=user_profile,
                shared_with=recipient,
                comment=comment
            )
        
        messages.success(request, f"Post shared with {len(recipient_ids)} friend{'s' if len(recipient_ids) > 1 else ''}!")
        return redirect('home')
    
    # Handle GET request (redirect to dialog)
    return redirect('share_dialog', post_id=post_id)

@login_required
def repost(request, post_id):
    """Repost a post"""
    original_post = get_object_or_404(Post, id=post_id)
    user_profile = request.user.profile
    
    if request.method == 'POST':
        content = request.POST.get('content', f"Reposted from {original_post.author.user.username}")
        
        # Create the repost as a new post
        repost = Post.objects.create(
            author=user_profile,
            content=content
        )
        
        # Create relationship between original and repost
        Repost.objects.create(
            original_post=original_post,
            repost=repost
        )
        
        messages.success(request, "Post has been reposted to your profile!")
        return redirect('home')
    
    return render(request, 'chat/repost_form.html', {
        'post_id': post_id,
        'original_post': original_post
    })

@login_required
def set_dark_mode(request):
    """Save dark mode preference for the user"""
    if request.method == 'POST':
        # Get the dark mode preference from the request
        dark_mode = request.POST.get('dark_mode', 'off')
        
        # Store in session
        request.session['dark_mode'] = dark_mode == 'on'
        
        # Redirect back to the referring page or home
        referer = request.META.get('HTTP_REFERER')
        if referer:
            return redirect(referer)
        return redirect('home')
    
    # If not a POST request, redirect to home
    return redirect('home')

@login_required
def get_comments(request, post_id):
    """Get comments for a post with HTMX"""
    post = get_object_or_404(Post, id=post_id)
    user_profile = request.user.profile
    
    # Get all top-level comments for the post (no parent_comment)
    comments = post.comments.filter(parent_comment=None).order_by('-created_at')
    print(f"Found {comments.count()} top-level comments for post {post_id}")
    
    # Process user reaction info for each comment and its replies
    def add_reaction_info(comment_list):
        for comment in comment_list:
            comment.user_has_reacted = CommentReaction.objects.filter(
                comment=comment, 
                user=user_profile
            ).exists()
            
            # Also process all replies to this comment
            if hasattr(comment, 'replies'):
                replies = comment.replies.all()
                print(f"Comment {comment.id} has {replies.count()} replies")
                add_reaction_info(replies)
    
    add_reaction_info(comments)
    
    context = {
        'post': post,
        'comments': comments,
        'user_profile': user_profile
    }
    
    # Check if the request is from HTMX
    if request.headers.get('HX-Request'):
        return render(request, 'chat/comments_list.html', context)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@login_required
def message_reaction(request, message_id):
    """Add or remove a reaction to a message"""
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    
    user_profile = request.user.profile
    message = get_object_or_404(Message, id=message_id)
    
    # Verify user has access to the chat room
    if not message.room.participants.filter(id=user_profile.id).exists():
        return HttpResponseForbidden()
    
    try:
        data = json.loads(request.body)
        reaction = data.get('reaction', '👍')
        
        # Check if this reaction already exists
        existing_reaction = MessageReaction.objects.filter(
            message=message,
            user=user_profile,
            reaction=reaction
        ).first()
        
        if existing_reaction:
            # Remove the reaction if it exists
            existing_reaction.delete()
            added = False
        else:
            # Add the reaction
            MessageReaction.objects.create(
                message=message,
                user=user_profile,
                reaction=reaction
            )
            added = True
        
        # Get all reactions for this message
        reactions = MessageReaction.objects.filter(message=message)
        reaction_data = {}
        
        for r in reactions:
            if r.reaction in reaction_data:
                reaction_data[r.reaction] += 1
            else:
                reaction_data[r.reaction] = 1
        
        return JsonResponse({
            'success': True,
            'added': added,
            'reactions': reaction_data
        })
    
    except (json.JSONDecodeError, KeyError):
        return HttpResponseBadRequest("Invalid request format")

@login_required
def reply_to_message(request, message_id):
    """Reply to a specific message"""
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    
    user_profile = request.user.profile
    original_message = get_object_or_404(Message, id=message_id)
    
    # Verify user has access to the chat room
    chat_room = original_message.room
    if not chat_room.participants.filter(id=user_profile.id).exists():
        return HttpResponseForbidden()
    
    try:
        data = json.loads(request.body)
        content = data.get('content', '')
        
        if not content.strip():
            return HttpResponseBadRequest("Reply cannot be empty")
        
        # Create the reply message
        reply_message = Message.objects.create(
            room=chat_room,
            sender=user_profile,
            content=content,
            reply_to=original_message
        )
        
        # Return a JSON response with message details
        return JsonResponse({
            'success': True,
            'message': {
                'id': reply_message.id,
                'content': reply_message.content,
                'sender': reply_message.sender.user.username,
                'timestamp': reply_message.timestamp.strftime('%H:%M %p'),
                'reply_to': {
                    'id': original_message.id,
                    'content': original_message.content,
                    'sender': original_message.sender.user.username
                }
            }
        })
    
    except (json.JSONDecodeError, KeyError):
        return HttpResponseBadRequest("Invalid request format")

@login_required
def reply_to_comment(request, comment_id):
    """Handle replying to a comment"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)
    
    comment = get_object_or_404(Comment, id=comment_id)
    user_profile = request.user.profile
    
    try:
        # Try to parse JSON body
        data = {}
        try:
            if request.body:
                data = json.loads(request.body)
        except json.JSONDecodeError:
            # If not JSON, try to get from POST form data
            data = request.POST.dict()
            
        content = data.get('content', '').strip()
        post_id = data.get('post_id')
        
        if not content:
            return JsonResponse({'success': False, 'error': 'Comment content cannot be empty'}, status=400)
        
        # Make sure we have the post
        post = None
        if post_id:
            post = get_object_or_404(Post, id=post_id)
        else:
            post = comment.post
            post_id = post.id  # Ensure we have post_id for response
        
        # Create the reply comment
        reply = Comment.objects.create(
            post=post,
            author=user_profile,
            content=content,
            parent_comment=comment
        )
        
        print(f"Created reply: {reply.id} to comment {comment.id} for post {post.id}")
        
        # Add user reaction info for templates
        reply.user_has_reacted = False
        
        return JsonResponse({
            'success': True,
            'comment_id': reply.id,
            'post_id': str(post_id),
            'author': reply.author.user.username,
            'content': reply.content,
            'created_at': reply.created_at.isoformat(),
            'parent_comment_id': comment.id
        })
    
    except Exception as e:
        print(f"Error in reply_to_comment: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
