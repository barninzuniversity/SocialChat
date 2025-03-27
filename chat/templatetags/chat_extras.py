from django import template
from django.contrib.auth.models import User
from chat.models import Profile, PostShare

register = template.Library()

@register.simple_tag
def get_user_friends(user):
    """Return a list of the user's friends"""
    if not user.is_authenticated:
        return []
    return user.profile.friends.all()

@register.simple_tag
def check_post_shared_with_user(post, user):
    """Check if a post has been shared with the user"""
    if not user.is_authenticated:
        return False
    return PostShare.objects.filter(post=post, shared_with=user.profile).exists() 