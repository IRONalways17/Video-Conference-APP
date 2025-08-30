import { useEffect, useRef } from 'react';

function VideoGrid({ localStream, remoteStreams, localVideoRef, isVideoOff }) {
  const remoteVideoRefs = useRef(new Map());

  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      const videoRef = remoteVideoRefs.current.get(userId);
      if (videoRef && videoRef.srcObject !== stream) {
        videoRef.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const getGridClass = () => {
    const total = remoteStreams.size + 1;
    if (total === 1) return 'grid-cols-1';
    if (total === 2) return 'grid-cols-2';
    if (total <= 4) return 'grid-cols-2';
    if (total <= 6) return 'grid-cols-3';
    if (total <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 h-full`}>
      {/* Local video */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-2">📷</div>
              <p>Camera Off</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          You
        </div>
      </div>

      {/* Remote videos */}
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <div key={userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={(ref) => {
              if (ref) remoteVideoRefs.current.set(userId, ref);
            }}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            User {userId.slice(0, 6)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideoGrid;
