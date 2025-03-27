# SocialChat


A modern, feature-rich social chat application built with Django that combines elements of social media and messaging platforms.

## Features

### Chat Functionality
- **Private Messaging**: One-on-one conversations between friends
- **Message Features**:
  - Text messages
  - Image attachments
  - File sharing
  - Message reactions (emojis)
  - Reply to specific messages
  - Message status indicators (read/unread)
- **Auto-Refresh**: Messages automatically update without page refresh
- **Smart Scrolling**: Maintains scroll position during updates and indicates new messages

### Social Features
- **User Profiles**: Customizable with avatars and bio information
- **Friend Management**:
  - Send/accept/reject friend requests
  - View friend list
  - Block/unblock users
- **Feed**:
  - Create text posts
  - Share images and videos
  - See posts from friends
  - Post reactions with various emojis (like, love, haha, etc.)
  - Comment on posts with nested replies
  - React to comments
  - Repost functionality
  - Share posts with specific friends

### UI/UX
- **Modern Interface**: Clean, responsive design
- **Dark Mode**: Toggle between light and dark themes
- **Mobile-Friendly**: Responsive design works on various screen sizes
- **Real-time Updates**: HTMX for dynamic content without full page reloads

## Technical Details

### Backend
- **Framework**: Django 4.2
- **Database**: SQLite (default), easily configurable for PostgreSQL or MySQL
- **Authentication**: Django built-in auth system
- **Media Handling**: Django FileField/ImageField for media uploads

### Frontend
- **Templates**: Django templates with Bootstrap 5
- **CSS**: Custom styling with responsive design
- **JavaScript**:
  - HTMX for seamless partial page updates
  - Custom JS components for enhanced interactions
  - Fetch API for AJAX requests

### Key Components

#### Models
- **Profile**: User profile with avatar, bio, friends list
- **FriendRequest**: Managing friendship connections
- **Post**: Content sharing with media attachments
- **Comment**: Post comments with nested replies
- **ChatRoom**: Container for private conversations
- **Message**: Text and media messages within chat rooms
- **Reaction**: Emoji reactions for posts, comments, and messages

#### Views
- Authentication views for user management
- Profile views for user information
- Social views for post/comment/reaction handling
- Chat views for message management

#### Templates
- Modular design with base templates and extensions
- Separate templates for different components (chat, posts, comments)
- Partial templates for HTMX updates

## Setup and Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chat_project
```

2. Create a virtual environment and activate it
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Apply migrations
```bash
python manage.py migrate
```

5. Create a superuser (admin)
```bash
python manage.py createsuperuser
```

6. Run the development server
```bash
python manage.py runserver
```

7. Access the application at http://127.0.0.1:8000/

## Usage Guide

### Getting Started
1. Register a new account or log in
2. Set up your profile with avatar and bio
3. Find and add friends through the search feature
4. Start chatting or posting to your feed

### Messaging
- Access chats from the main navigation menu
- Start a new chat with any of your friends
- Send text messages, images, or files
- React to messages with emojis
- Reply to specific messages for context

### Social Feed
- Create new posts with text and optional media
- React to posts with various emoji reactions
- Comment on posts and reply to comments
- Share interesting posts with your friends
- Repost content to your own profile

## Development and Contribution

### Project Structure
- **chat/** - Main application directory
  - **models.py** - Database models
  - **views.py** - View controllers
  - **urls.py** - URL routing
  - **forms.py** - Form definitions
  - **templates/** - HTML templates
  - **static/** - Static assets (CSS, JS, images)

### Frontend Components
- **Base Template**: Core layout and navigation
- **Home Feed**: Social media style content stream
- **Chat Interface**: Messenger-style conversation UI
- **Profile Pages**: User information display
- **Comment System**: Nested comments with reactions

### Key JavaScript Components
- **chat-room.js**: Manages chat interface functionality
- **comment.js**: Handles comment interactions
- **post-reactions.js**: Manages reaction systems
- **animations.js**: UI animations and transitions
- **dark-mode.js**: Theme switching functionality

## License

[MIT License](LICENSE)

## Acknowledgements
- Bootstrap for the responsive UI framework
- FontAwesome for iconography
- HTMX for seamless page updates 
