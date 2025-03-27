from django.contrib import admin
from .models import Profile, FriendRequest, Post, ChatRoom, Message, BlockedPost

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio')
    search_fields = ('user__username', 'bio')
    filter_horizontal = ('friends', 'blocked_users')

@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('from_user__user__username', 'to_user__user__username')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'content', 'created_at')
    search_fields = ('author__user__username', 'content')
    list_filter = ('created_at',)

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_group_chat', 'created_at')
    list_filter = ('is_group_chat',)
    filter_horizontal = ('participants',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('sender__user__username', 'content')

@admin.register(BlockedPost)
class BlockedPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'blocked_at')
    search_fields = ('user__user__username', 'post__content')
    list_filter = ('blocked_at',)
