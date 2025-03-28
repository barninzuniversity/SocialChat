# SocialChat Deployment Guide

This document outlines the steps needed to deploy SocialChat to a production environment.

## Prerequisites

1. A server with sufficient disk space for storing media files
2. A PostgreSQL database
3. A Redis instance for Channels
4. A web server (Nginx, Apache, etc.)

## Setup Steps

### 1. Set Up Server Directories

Create directories for storing media files that will persist across deployments:

```bash
mkdir -p /var/www/socialchat/media
chmod 755 /var/www/socialchat/media
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in your specific values:

```
# Set this to "production" for production environment
ENVIRONMENT=production

# Django settings
DJANGO_SECRET_KEY=your-secure-random-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database settings
DATABASE_URL=postgres://user:password@host:port/database_name

# Redis settings for Channels
REDIS_URL=redis://username:password@host:port
```

The application uses a single settings file that automatically configures itself based on the `ENVIRONMENT` variable. When set to `production`, it enables all production-specific settings.

### 3. Database Migration

Before deploying, you need to migrate your database schema:

```bash
# Run migrations (environment variable is read from .env file)
python manage.py migrate
```

### 4. Static Files Collection

Collect static files to be served:

```bash
# Collect static files (environment variable is read from .env file)
python manage.py collectstatic --no-input
```

### 5. Deployment to Server

#### Server Setup (Ubuntu/Debian):

1. Install required packages:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx postgresql redis-server supervisor
   ```

2. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/socialchat.git /var/www/socialchat/app
   cd /var/www/socialchat/app
   ```

3. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables in a `.env` file.

6. Collect static files:
   ```bash
   python manage.py collectstatic --no-input
   ```

7. Link media directory to the persistent storage:
   ```bash
   ln -sf /var/www/socialchat/media /var/www/socialchat/app/media
   ```

8. Configure Nginx to serve the application and media files:
   
   Create `/etc/nginx/sites-available/socialchat`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/ssl/certificate;
       ssl_certificate_key /path/to/ssl/key;
       
       # Static files
       location /static/ {
           alias /var/www/socialchat/app/staticfiles/;
       }
       
       # Media files
       location /media/ {
           alias /var/www/socialchat/media/;
       }
       
       # Proxy requests to Daphne
       location / {
           proxy_pass http://127.0.0.1:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # WebSocket support
       location /ws/ {
           proxy_pass http://127.0.0.1:8001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

9. Create a Supervisor configuration to run Daphne:
   
   Create `/etc/supervisor/conf.d/socialchat.conf`:
   ```ini
   [program:socialchat]
   command=/var/www/socialchat/app/venv/bin/daphne -b 127.0.0.1 -p 8001 chat_project.asgi:application
   directory=/var/www/socialchat/app
   user=www-data
   autostart=true
   autorestart=true
   redirect_stderr=true
   stdout_logfile=/var/log/supervisor/socialchat.log
   environment=ENVIRONMENT=production
   ```

10. Enable the Nginx site and restart services:
    ```bash
    sudo ln -s /etc/nginx/sites-available/socialchat /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl restart all
    ```

### 6. File Permissions

Ensure the media directory has the correct permissions:

```bash
# Set ownership to the web server user
sudo chown -R www-data:www-data /var/www/socialchat/media

# Set appropriate permissions
sudo chmod -R 755 /var/www/socialchat/media
```

### 7. Post-Deployment Tasks

1. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

2. Verify that media uploads work by testing:
   - Profile picture uploads
   - Post image uploads
   - Message image/file uploads

## Troubleshooting

### Media Files Not Displaying

1. Check file permissions on the media directory
2. Verify that Nginx is configured correctly to serve media files
3. Check that the symbolic link is correctly set up
4. Inspect Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Database Connection Issues

1. Verify database connection details
2. Check database server firewalls
3. Ensure the database user has appropriate permissions

### WebSocket Connection Issues

1. Verify Redis connection
2. Check that Daphne is running correctly
3. Ensure Nginx is configured to proxy WebSocket connections

## Maintenance

1. Regularly back up your media files and database
2. Monitor server disk space, particularly the media directory
3. Update your Django application and dependencies
4. Rotate log files to prevent disk space issues 