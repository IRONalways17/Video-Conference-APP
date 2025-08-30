import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoGrid from './VideoGrid';
import Controls from './Controls';

// Update this with your actual backend URL after deployment
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
  
  const wsRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleInteract = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      setHasJoined(true);
      connectToSignalingServer();
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const connectToSignalingServer = () => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log('Connected to signaling server');
      setIsConnected(true);
      wsRef.current.send(JSON.stringify({
        type: 'join',
        roomId: roomId
      }));
    };

    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'room-full':
          setRoomFull(true);
          break;
          
        case 'user-joined':
          await createPeerConnection(message.userId, true);
          break;
          
        case 'offer':
          await handleOffer(message);
          break;
          
        case 'answer':
          await handleAnswer(message);
          break;
          
        case 'ice-candidate':
          await handleIceCandidate(message);
          break;
          
        case 'user-left':
          handleUserLeft(message.userId);
          break;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
    };
  };

  const createPeerConnection = async (userId, createOffer) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current.set(userId, pc);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(userId, event.streams[0]);
        return newStreams;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: userId,
          roomId: roomId
        }));
      }
    };

    // Create offer if needed
    if (createOffer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      wsRef.current.send(JSON.stringify({
        type: 'offer',
        offer: offer,
        to: userId,
        roomId: roomId
      }));
    }

    return pc;
  };

  const handleOffer = async (message) => {
    const pc = await createPeerConnection(message.from, false);
    await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    wsRef.current.send(JSON.stringify({
      type: 'answer',
      answer: answer,
      to: message.from,
      roomId: roomId
    }));
  };

  const handleAnswer = async (message) => {
    const pc = peerConnections.current.get(message.from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
    }
  };

  const handleIceCandidate = async (message) => {
    const pc = peerConnections.current.get(message.from);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  };

  const handleUserLeft = (userId) => {
    const pc = peerConnections.current.get(userId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(userId);
    }
    
    setRemoteStreams(prev => {
      const newStreams = new Map(prev);
      newStreams.delete(userId);
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

  const copyRoomLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Room link copied to clipboard!');
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-8">Join Video Call</h1>
        <button
          onClick={handleInteract}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-200 transform hover:scale-105"
        >
          Interact
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
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
            <button
              onClick={copyRoomLink}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Copy Room Link
            </button>
            <span className="text-gray-400 text-sm">
              Participants: {remoteStreams.size + 1} / 10
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
