# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)

## Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Run these commands in your terminal:
```bash
git remote add origin https://github.com/YOUR_USERNAME/video-conference-app.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: video-conference-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Copy your backend URL (e.g., `https://video-conference-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: frontend
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_WS_URL`
   - **Value**: `wss://YOUR-BACKEND-URL.onrender.com` (use wss:// for secure WebSocket)
6. Click "Deploy"
7. Wait for deployment to complete

## Step 4: Update CORS (if needed)

If you encounter CORS issues, update the backend `server.js` to include your frontend URL:

```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173']
}));
```

Then push the changes and Render will automatically redeploy.

## Step 5: Test the Application

1. Visit your Vercel deployment URL
2. Create a new room
3. Open the room link in another browser/device
4. Click "Interact" to join the call
5. Test audio/video functionality

## Troubleshooting

### WebSocket Connection Failed
- Ensure the `VITE_WS_URL` environment variable is set correctly in Vercel
- Make sure to use `wss://` (not `ws://`) for the production backend URL
- Check if the backend is running on Render

### Media Access Denied
- Ensure HTTPS is enabled (Vercel and Render provide this by default)
- Check browser permissions for camera/microphone

### Room Full Error
- The application limits rooms to 10 participants
- Create a new room if the current one is full

## Local Testing Before Deployment

1. Start the backend:
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Open http://localhost:5173 in your browser
4. Test the functionality locally before deploying
