# Deployment Steps

## 1. Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `videocall-hub-backend` (or any name you prefer)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Copy the service URL (e.g., `https://videocall-hub-backend.onrender.com`)

## 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Name**: `VITE_WS_URL`
   - **Value**: `wss://your-render-backend-url.onrender.com` (replace with your Render URL)
6. Click "Deploy"
7. Wait for deployment to complete

## 3. Test the Deployment

1. Visit your Vercel frontend URL
2. Create a new room
3. Open the room URL in another browser/tab
4. Test video calling functionality

## Important Notes

- Make sure to use `wss://` (not `ws://`) for the production WebSocket URL
- The backend URL should NOT include `/ws` at the end
- If you encounter CORS issues, the backend is already configured to accept all origins
- Free Render services may take 30-60 seconds to wake up from sleep

## Troubleshooting

- **WebSocket connection failed**: Check that VITE_WS_URL uses `wss://` and correct backend URL
- **Build errors**: Ensure TailwindCSS v3 is being used (already configured)
- **Backend not responding**: Render free tier services sleep after inactivity, first request may be slow