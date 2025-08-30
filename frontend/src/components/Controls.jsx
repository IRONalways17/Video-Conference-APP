function Controls({ isMuted, isVideoOff, onToggleMute, onToggleVideo, onLeave }) {
  return (
    <div className="flex justify-center items-center space-x-4">
      <button
        onClick={onToggleMute}
        className={`p-4 rounded-full transition duration-200 ${
          isMuted 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-gray-700 hover:bg-gray-600'
        } text-white`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition duration-200 ${
          isVideoOff 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-gray-700 hover:bg-gray-600'
        } text-white`}
        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isVideoOff ? '📷' : '📹'}
      </button>

      <button
        onClick={onLeave}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition duration-200"
        title="Leave call"
      >
        📞
      </button>
    </div>
  );
}

export default Controls;
