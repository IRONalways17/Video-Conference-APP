import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoGrid from './VideoGrid';
import Controls from './Controls';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [participantCount, setParticipantCount] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  const wsRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.openrelay.metered.ca:80' },
      { urls: 'stun:stun.freeswitch.org' }
    ]
  };

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleInteract = async () => {
    try {
      console.log('🎥 Requesting media access...');
      setConnectionStatus('getting-media');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Media access granted');
      setLocalStream(stream);
      setHasJoined(true);
      
      // Now connect to signaling server and join room
      connectToSignalingServer();
      
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      setConnectionStatus('media-error');
      alert(`Unable to access camera/microphone: ${error.message}\n\nPlease:\n1. Allow camera/mic permissions\n2. Refresh the page\n3. Try again`);
    }
  };

  const connectToSignalingServer = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');
    initiateWebSocketConnection();
  };

  const initiateWebSocketConnection = () => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log('Connected to signaling server');
      setIsConnected(true);
      setConnectionStatus('joining-room');
      reconnectAttempts.current = 0;
      
      // Join the room
      wsRef.current.send(JSON.stringify({
        type: 'join',
        roomId: roomId,
        userId: userId
      }));
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        
        switch (message.type) {
          case 'room-full':
            setRoomFull(true);
            setConnectionStatus('room-full');
            break;
            
          case 'user-joined':
            console.log('🆕 New user joined:', message.userId);
            if (message.userId !== userId && localStream) {
              addNotification(`User ${message.userId.slice(0, 6)} joined the call`);
              
              // Create connection and send offer to new user
              console.log('🤝 Creating peer connection with offer for new user:', message.userId);
              setTimeout(() => createPeerConnection(message.userId, true), 500);
            }
            break;
            
          case 'room-info':
            console.log('🏠 Room info received:', message);
            setParticipantCount(message.participantCount || 1);
            setConnectionStatus('connected');
            
            // When we join and get existing users, wait for them to send offers
            if (message.existingUsers && message.existingUsers.length > 0) {
              console.log('🔄 Room has existing users:', message.existingUsers);
            }
            break;
            
          case 'offer':
            console.log('Received offer from:', message.from);
            if (message.from !== userId) {
              await handleOffer(message);
            }
            break;
            
          case 'answer':
            console.log('Received answer from:', message.from);
            if (message.from !== userId) {
              await handleAnswer(message);
            }
            break;
            
          case 'ice-candidate':
            if (message.from !== userId) {
              await handleIceCandidate(message);
            }
            break;
            
          case 'user-left':
            console.log('User left:', message.userId);
            if (message.userId !== userId) {
              handleUserLeft(message.userId);
              addNotification(`User ${message.userId.slice(0, 6)} left the call`);
            }
            break;
            
          case 'error':
            console.error('Server error:', message.error);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect if not manually closed
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
        setTimeout(() => {
          if (hasJoined) {
            connectToSignalingServer();
          }
        }, 2000 * reconnectAttempts.current);
      }
    };
  };

  const createPeerConnection = async (peerId, createOffer) => {
    console.log(`🔄 Creating peer connection with ${peerId}, createOffer: ${createOffer}`);
    
    // Close existing connection if any
    if (peerConnections.current.has(peerId)) {
      console.log(`🔄 Closing existing connection with ${peerId}`);
      peerConnections.current.get(peerId).close();
      peerConnections.current.delete(peerId);
    }
    
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current.set(peerId, pc);

    // CRITICAL: Add local stream tracks FIRST before creating offers
    if (localStream) {
      console.log(`➕ Adding ${localStream.getTracks().length} tracks to peer connection with ${peerId}`);
      localStream.getTracks().forEach((track, index) => {
        console.log(`  ➕ Adding track ${index + 1}: ${track.kind} (enabled: ${track.enabled})`);
        pc.addTrack(track, localStream);
      });
    } else {
      console.warn(`⚠️ No local stream available when creating connection with ${peerId}`);
    }

    // Handle incoming tracks (remote streams) - CRITICAL FOR RECEIVING VIDEO
    pc.ontrack = (event) => {
      console.log(`📺 RECEIVED remote ${event.track.kind} track from ${peerId}`);
      console.log(`📺 Stream details:`, event.streams[0]);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        console.log(`📺 Adding remote stream for ${peerId}, tracks: ${remoteStream.getTracks().length}`);
        
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.set(peerId, remoteStream);
          console.log(`🎥 UPDATED: Total remote streams: ${newStreams.size}, Total participants: ${newStreams.size + 1}`);
          return newStreams;
        });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`🧊 Sending ICE candidate to ${peerId}`);
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: peerId,
          from: userId,
          roomId: roomId
        }));
      } else {
        console.log(`🧊 ICE gathering completed for ${peerId}`);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${peerId}: ${pc.connectionState}`);
      
      if (pc.connectionState === 'connected') {
        console.log(`✅ SUCCESSFULLY CONNECTED to ${peerId}`);
      } else if (pc.connectionState === 'failed') {
        console.log(`❌ Connection failed with ${peerId}, attempting to reconnect...`);
        setTimeout(() => {
          if (pc.connectionState === 'failed') {
            console.log(`🔄 Retrying connection with ${peerId}`);
            createPeerConnection(peerId, true); // Retry with offer
          }
        }, 2000);
      } else if (pc.connectionState === 'disconnected') {
        console.log(`⚠️ Disconnected from ${peerId}`);
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE state with ${peerId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log(`🎉 ICE CONNECTION SUCCESS with ${peerId}`);
      }
    };

    // Create offer if needed (only for the person who was already in the room)
    if (createOffer) {
      try {
        console.log(`📤 Creating offer for ${peerId}`);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        
        console.log(`📤 SENDING OFFER to ${peerId}`);
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          offer: offer,
          to: peerId,
          from: userId,
          roomId: roomId
        }));
      } catch (error) {
        console.error(`❌ Error creating offer for ${peerId}:`, error);
      }
    }

    return pc;
  };

  const handleOffer = async (message) => {
    try {
      console.log(`📥 Handling offer from ${message.from}`);
      
      // Create peer connection for incoming offer
      const pc = await createPeerConnection(message.from, false);
      
      console.log(`📥 Setting remote description for ${message.from}`);
      await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
      
      console.log(`📤 Creating answer for ${message.from}`);
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(answer);
      
      console.log(`📤 Sending answer to ${message.from}`);
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        answer: answer,
        to: message.from,
        from: userId,
        roomId: roomId
      }));
      
      console.log(`✅ Successfully handled offer from ${message.from}`);
    } catch (error) {
      console.error(`❌ Error handling offer from ${message.from}:`, error);
    }
  };

  const handleAnswer = async (message) => {
    try {
      console.log(`📥 Handling answer from ${message.from}`);
      const pc = peerConnections.current.get(message.from);
      if (pc) {
        console.log(`📥 Setting remote description for answer from ${message.from}`);
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
        console.log(`✅ Successfully handled answer from ${message.from}`);
      } else {
        console.error(`❌ No peer connection found for ${message.from} when handling answer`);
      }
    } catch (error) {
      console.error(`❌ Error handling answer from ${message.from}:`, error);
    }
  };

  const handleIceCandidate = async (message) => {
    try {
      console.log(`🧊 Handling ICE candidate from ${message.from}`);
      const pc = peerConnections.current.get(message.from);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        console.log(`✅ Added ICE candidate for ${message.from}`);
      } else {
        console.error(`❌ No peer connection found for ${message.from} when handling ICE candidate`);
      }
    } catch (error) {
      console.error(`❌ Error handling ICE candidate from ${message.from}:`, error);
    }
  };

  const handleUserLeft = (leftUserId) => {
    console.log(`Cleaning up connection for user ${leftUserId}`);
    const pc = peerConnections.current.get(leftUserId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(leftUserId);
    }
    
    setRemoteStreams(prev => {
      const newStreams = new Map(prev);
      newStreams.delete(leftUserId);
      console.log(`Removed stream for ${leftUserId}, remaining streams: ${newStreams.size}`);
      return newStreams;
    });
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leaveRoom = () => {
    // Clean up
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    navigate('/');
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const copyRoomLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    addNotification('Room link copied to clipboard!');
  };

  if (roomFull) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-4">Room is Full</h1>
        <p className="text-gray-300 mb-8">This room has reached the maximum of 10 participants.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Join Video Call</h1>
          <p className="text-gray-300 mb-6">Room ID: {roomId}</p>
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              connectionStatus === 'connected' ? 'bg-green-600 text-white' :
              connectionStatus === 'connecting' ? 'bg-yellow-600 text-white' :
              connectionStatus === 'error' ? 'bg-red-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'error' ? 'Connection Error' :
               'Disconnected'}
            </span>
          </div>
          <button
            onClick={handleInteract}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-200 transform hover:scale-105"
          >
            Interact
          </button>
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs"
          >
            {notification.message}
          </div>
        ))}
      </div>
      
      <div className="flex-1 p-4">
        <VideoGrid
          localStream={localStream}
          remoteStreams={remoteStreams}
          localVideoRef={localVideoRef}
          isVideoOff={isVideoOff}
        />
      </div>
      
      <div className="bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={copyRoomLink}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                Copy Room Link
              </button>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                connectionStatus === 'connected' ? 'bg-green-600 text-white' :
                connectionStatus === 'connecting' ? 'bg-yellow-600 text-white' :
                connectionStatus === 'error' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {connectionStatus}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              Participants: {participantCount} / 10
            </span>
          </div>
          
          <Controls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onLeave={leaveRoom}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
