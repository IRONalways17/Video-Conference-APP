const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store rooms and their participants
const rooms = new Map();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WebRTC Signaling Server Running',
    rooms: rooms.size 
  });
});

wss.on('connection', (ws) => {
  let currentRoom = null;
  let userId = generateUserId();
  
  console.log(`New connection: ${userId}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          handleJoinRoom(ws, userId, data.roomId);
          currentRoom = data.roomId;
          break;
          
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          forwardMessage(data, userId);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Connection closed: ${userId}`);
    if (currentRoom) {
      handleLeaveRoom(userId, currentRoom);
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${userId}:`, error);
  });
});

function generateUserId() {
  return Math.random().toString(36).substr(2, 9);
}

function handleJoinRoom(ws, userId, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  
  const room = rooms.get(roomId);
  
  // Check if room is full
  if (room.size >= 10) {
    ws.send(JSON.stringify({ type: 'room-full' }));
    return;
  }
  
  // Add user to room
  room.set(userId, ws);
  
  console.log(`User ${userId} joined room ${roomId}. Room size: ${room.size}`);
  
  // Send room info to the joining user
  ws.send(JSON.stringify({
    type: 'room-info',
    participantCount: room.size,
    roomId: roomId
  }));
  
  // Notify all existing users about the new user
  room.forEach((client, clientId) => {
    if (clientId !== userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'user-joined',
        userId: userId
      }));
      
      // Update participant count for existing users
      client.send(JSON.stringify({
        type: 'room-info',
        participantCount: room.size,
        roomId: roomId
      }));
    }
  });
}

function handleLeaveRoom(userId, roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(userId);
    
    console.log(`User ${userId} left room ${roomId}. Room size: ${room.size}`);
    
    // Notify remaining users
    room.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user-left',
          userId: userId
        }));
        
        // Update participant count for remaining users
        client.send(JSON.stringify({
          type: 'room-info',
          participantCount: room.size,
          roomId: roomId
        }));
      }
    });
    
    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }
}

function forwardMessage(data, fromUserId) {
  const room = rooms.get(data.roomId);
  if (room) {
    const targetClient = room.get(data.to);
    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
      targetClient.send(JSON.stringify({
        ...data,
        from: fromUserId
      }));
    }
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
