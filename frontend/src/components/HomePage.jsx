import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function HomePage() {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = uuidv4();
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          VideoCall Hub
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Start instant video calls with up to 10 people
        </p>
        <button
          onClick={createRoom}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 transform hover:scale-105"
        >
          Create New Room
        </button>
      </div>
    </div>
  );
}

export default HomePage;
