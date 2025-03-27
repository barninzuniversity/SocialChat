from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', views.profile_detail, name='profile_detail'),
    path('profile/<str:username>/friend-request/', views.send_friend_request, name='send_friend_request'),
    path('friend-request/<int:request_id>/<str:action>/', views.respond_friend_request, name='respond_friend_request'),
    path('chats/', views.chat_list, name='chat_list'),
    path('chat/create/<str:username>/', views.create_or_get_direct_chat, name='create_or_get_direct_chat'),
    path('chat/<int:room_id>/', views.chat_room, name='chat_room'),
    path('chat/<int:room_id>/send/', views.send_message, name='send_message'),
    path('chat/<int:room_id>/messages/', views.get_messages, name='get_messages'),
    path('friends/', views.friends_list, name='friends_list'),
    path('search/', views.search_users, name='search_users'),
    path('post/<int:post_id>/delete/', views.delete_post, name='delete_post'),
    path('post/<int:post_id>/block/', views.block_post, name='block_post'),
    path('user/<str:username>/block/', views.block_user, name='block_user'),
    path('user/<str:username>/unblock/', views.unblock_user, name='unblock_user'),
    path('blocked/', views.blocked_users, name='blocked_users'),
    
    # New SSE endpoints
    path('chat/<int:room_id>/stream/', views.message_stream, name='message_stream'),
    path('post/<int:post_id>/react/', views.add_post_reaction, name='add_post_reaction'),
    path('post/<int:post_id>/comment/', views.add_comment, name='add_comment'),
    path('post/<int:post_id>/comments/', views.get_comments, name='get_comments'),
    path('comment/<int:comment_id>/react/', views.add_comment_reaction, name='add_comment_reaction'),
    path('comment/<int:comment_id>/reply/', views.reply_to_comment, name='reply_to_comment'),
    path('post/<int:post_id>/share/', views.share_post, name='share_post'),
    path('post/<int:post_id>/share-dialog/', views.share_dialog, name='share_dialog'),
    path('post/<int:post_id>/repost/', views.repost, name='repost'),
    
    # Message reactions and replies
    path('message/<int:message_id>/react/', views.message_reaction, name='message_reaction'),
    path('message/<int:message_id>/reply/', views.reply_to_message, name='reply_to_message'),
    
    # Dark mode preference
    path('set_dark_mode/', views.set_dark_mode, name='set_dark_mode'),
] 