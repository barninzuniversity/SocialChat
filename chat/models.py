from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

def get_default_avatar_path():
    return 'avatars/default.png'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', default=get_default_avatar_path)
    bio = models.TextField(max_length=500, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='blocked_by')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class FriendRequest(models.Model):
    from_user = models.ForeignKey(Profile, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Profile, related_name='received_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    class Meta:
        unique_together = ('from_user', 'to_user')
    
    def __str__(self):
        return f"{self.from_user.user.username} → {self.to_user.user.username}"

class Post(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    video = models.FileField(upload_to='post_videos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.author.user.username}: {self.content[:30]}..."

# Reaction types for posts and comments
REACTION_TYPES = [
    ('like', 'Like'),
    ('love', 'Love'),
    ('haha', 'Haha'),
    ('wow', 'Wow'),
    ('sad', 'Sad'),
    ('angry', 'Angry')
]

class PostReaction(models.Model):
    """Model for post reactions"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES, default='like')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'user')
    
    def __str__(self):
        return f"{self.user.user.username} {self.reaction_type}d {self.post}"

class Comment(models.Model):
    """Model for post comments"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField()
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment by {self.author.user.username} on {self.post}"

class CommentReaction(models.Model):
    """Model for comment reactions"""
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES, default='like')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('comment', 'user')
    
    def __str__(self):
        return f"{self.user.user.username} {self.reaction_type}d {self.comment}"

class PostShare(models.Model):
    """Model for post shares with friends"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_shares')
    shared_by = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts_shared')
    shared_with = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts_shared_with_me')
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.shared_by.user.username} shared {self.post} with {self.shared_with.user.username}"

class Repost(models.Model):
    """Model for post reposts"""
    original_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reposts')
    repost = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='repost_of')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Repost of {self.original_post} by {self.repost.author.user.username}"

class ChatRoom(models.Model):
    name = models.CharField(max_length=100, blank=True)
    participants = models.ManyToManyField(Profile, related_name='chat_rooms')
    is_group_chat = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if self.is_group_chat:
            return self.name
        participants_list = list(self.participants.all())
        if len(participants_list) >= 2:
            return f"Chat between {participants_list[0].user.username} and {participants_list[1].user.username}"
        return "Empty chat"

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='messages/images/', blank=True, null=True)
    file = models.FileField(upload_to='messages/files/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.user.username}: {self.content[:30]}..."

class MessageReaction(models.Model):
    """Model for message reactions"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, default='👍')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('message', 'user', 'reaction')
    
    def __str__(self):
        return f"{self.user.user.username} reacted with {self.reaction} to {self.message}"
        
    @property
    def count(self):
        return MessageReaction.objects.filter(message=self.message, reaction=self.reaction).count()

class BlockedPost(models.Model):
    """Model to track blocked posts by users"""
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='blocked_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='blocked_by')
    blocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')
    
    def __str__(self):
        return f"{self.user.user.username} blocked post by {self.post.author.user.username}"

class FriendList(models.Model):
    """Model to manage user friends list"""
    user = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='friends_list')
    friends = models.ManyToManyField(Profile, blank=True, related_name='friends_of')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.user.username}'s Friends"
