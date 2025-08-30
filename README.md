# VideoCall Hub - P2P Video Conferencing

A peer-to-peer video conferencing web application that supports up to 10 users per room using WebRTC mesh architecture.

## Tech Stack

### Frontend
- React (Vite)
- TailwindCSS
- WebRTC
- React Router

### Backend
- Node.js
- Express
- WebSocket (ws)
- CORS

## Features

- Create instant video call rooms
- Share room links for easy joining
- Support up to 10 participants per room
- Mute/unmute audio
- Turn camera on/off
- Clean, responsive UI
- Real-time P2P connections using WebRTC mesh

## Architecture

The application uses a P2P WebRTC mesh architecture where:
- Each user connects directly to every other user in the room
- The backend server is only used for signaling (establishing connections)
- Media streams are exchanged directly between peers
- STUN server (Google's public STUN) is used for NAT traversal

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup
```bash
cd backend
npm install
npm start
```
The signaling server will run on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at http://localhost:5173

## Environment Variables

### Frontend
Create a `.env` file in the frontend directory:
```
VITE_WS_URL=ws://localhost:3001
```

For production, update this to your deployed backend WebSocket URL:
```
VITE_WS_URL=wss://your-backend.onrender.com
```

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the root directory to `frontend`
4. Add environment variable: `VITE_WS_URL` with your backend WebSocket URL (use wss:// for production)
5. Deploy

**Important**: The project uses TailwindCSS v3 for compatibility. If you encounter build errors, ensure your package.json has:
```json
"tailwindcss": "^3.4.0",
"postcss": "^8.4.32",
"autoprefixer": "^10.4.16"
```

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the root directory to `backend`
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Deploy

### Common Deployment Issues

1. **TailwindCSS Build Error**: Make sure you're using TailwindCSS v3, not v4
2. **WebSocket Connection Failed**: Ensure VITE_WS_URL uses `wss://` (not `ws://`) for production
3. **CORS Issues**: The backend is configured to accept all origins by default

## Usage

1. Visit the homepage
2. Click "Create New Room" to start a new video call
3. Share the room URL with participants
4. Participants can join by visiting the URL and clicking "Interact"
5. Grant camera and microphone permissions when prompted
6. Use the control buttons to mute/unmute, turn camera on/off, or leave the call

## Project Structure

```
video-conference-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx
│   │   │   ├── RoomPage.jsx
│   │   │   ├── VideoGrid.jsx
│   │   │   └── Controls.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
└── backend/
    ├── server.js
    └── package.json
```

## Credits

This project is made by Aaryan Choudhary with hours of work.
