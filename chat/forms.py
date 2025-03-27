from django import forms
from .models import Profile, Post

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'avatar']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        }

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content', 'image', 'video']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': "What's on your mind?", 'class': 'form-control'}),
        }
        labels = {
            'content': '',
            'image': 'Image (optional)',
            'video': 'Video (optional)',
        } 