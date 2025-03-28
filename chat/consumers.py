import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, Message, Profile

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']
        
        print(f"WebSocket connect attempt: user={self.user}, room={self.room_id}, group={self.room_group_name}")
        
        # Join room group without checking access (for simplicity)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"WebSocket connection accepted for user {self.user} in room {self.room_id}")
        
        # Send connection status message to the group
        if self.user.is_authenticated:
            username = self.user.username
        else:
            username = "Anonymous"
            
        # Notify everyone that a new user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_message',
                'message': f"{username} joined the chat",
                'username': 'System',
                'timestamp': self.get_time_string()
            }
        )
    
    async def disconnect(self, close_code):
        # Leave room group
        print(f"WebSocket disconnected for user {self.user} in room {self.room_id} with code {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            print(f"Received from user {self.user}: {text_data}")
            data = json.loads(text_data)
            message = data['message']
            username = data['username']
            
            print(f"Broadcasting message to group: {self.room_group_name}")
            # Send message to room group immediately without waiting for database save
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                    'timestamp': self.get_time_string()
                }
            )
            
            # Save message to database in the background
            if self.user.is_authenticated:
                await self.save_message(message)
                
        except Exception as e:
            print(f"Error in receive: {str(e)}")
            import traceback
            traceback.print_exc()
    
    def get_time_string(self):
        from datetime import datetime
        now = datetime.now()
        hour = now.hour % 12 or 12
        minute = now.minute
        ampm = 'PM' if now.hour >= 12 else 'AM'
        return f"{hour}:{minute:02d} {ampm}"
    
    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        timestamp = event.get('timestamp', '')
        
        print(f"Sending chat message to WebSocket for user {self.user}: {message}")
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'timestamp': timestamp
        }))
    
    # Handle connection messages
    async def connection_message(self, event):
        message = event['message']
        username = event['username']
        timestamp = event.get('timestamp', '')
        
        # Send connection message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'timestamp': timestamp
        }))
    
    @database_sync_to_async
    def save_message(self, message):
        try:
            print(f"Saving message to database for user {self.user}: {message}")
            profile = Profile.objects.get(user=self.user)
            chat_room = ChatRoom.objects.get(id=self.room_id)
            
            message_obj = Message.objects.create(
                room=chat_room,
                sender=profile,
                content=message
            )
            print(f"Message saved successfully with ID: {message_obj.id}")
            return message_obj
        except Exception as e:
            print(f"Error saving message: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
