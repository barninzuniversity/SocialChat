import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_project.settings')
django.setup()

from django.contrib.auth.models import User
from chat.models import (
    Post, Comment, Profile, ChatRoom, Message, 
    FriendRequest, PostReaction, CommentReaction,
    MessageReaction, PostShare, Repost, BlockedPost
)

# Keep superusers, delete regular users
regular_users = User.objects.filter(is_superuser=False)
print(f"Deleting {regular_users.count()} regular users...")
regular_users.delete()

# Delete all content
post_count = Post.objects.all().count()
Post.objects.all().delete()
print(f"Deleted {post_count} posts")

comment_count = Comment.objects.all().count()
Comment.objects.all().delete()
print(f"Deleted {comment_count} comments")

chat_room_count = ChatRoom.objects.all().count()
ChatRoom.objects.all().delete()
print(f"Deleted {chat_room_count} chat rooms")

message_count = Message.objects.all().count()
Message.objects.all().delete()
print(f"Deleted {message_count} messages")

friend_request_count = FriendRequest.objects.all().count()
FriendRequest.objects.all().delete()
print(f"Deleted {friend_request_count} friend requests")

reaction_count = PostReaction.objects.all().count()
PostReaction.objects.all().delete()
print(f"Deleted {reaction_count} post reactions")

comment_reaction_count = CommentReaction.objects.all().count()
CommentReaction.objects.all().delete()
print(f"Deleted {comment_reaction_count} comment reactions")

message_reaction_count = MessageReaction.objects.all().count()
MessageReaction.objects.all().delete()
print(f"Deleted {message_reaction_count} message reactions")

share_count = PostShare.objects.all().count()
PostShare.objects.all().delete()
print(f"Deleted {share_count} post shares")

repost_count = Repost.objects.all().count()
Repost.objects.all().delete()
print(f"Deleted {repost_count} reposts")

blocked_count = BlockedPost.objects.all().count()
BlockedPost.objects.all().delete()
print(f"Deleted {blocked_count} blocked posts")

print("Data cleared successfully while preserving database structure!") 