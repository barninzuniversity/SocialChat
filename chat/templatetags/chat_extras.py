from django import template
from django.contrib.auth.models import User
from chat.models import Profile, PostShare
from django.utils import timezone
import pytz
from datetime import datetime

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

@register.filter
def to_user_timezone(value, user_timezone=None):
    """Convert a datetime to the user's timezone"""
    if not value:
        return ""
    
    # If no timezone provided, return formatted UTC time
    if not user_timezone:
        return value.strftime("%b %d, %Y, %I:%M %p")
    
    try:
        # Ensure the datetime is timezone aware
        if timezone.is_naive(value):
            value = timezone.make_aware(value, pytz.UTC)
        
        # Convert to user timezone
        user_tz = pytz.timezone(user_timezone)
        local_dt = value.astimezone(user_tz)
        
        # Format the datetime
        return local_dt.strftime("%b %d, %Y, %I:%M %p")
    except Exception as e:
        # Return the original datetime in case of errors
        return value.strftime("%b %d, %Y, %I:%M %p") 