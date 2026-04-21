import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { MapPin, IndianRupee, Bed, Trash2 } from 'lucide-react';

export default function MyRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/rooms/owner')
      .then(res => setRooms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await API.delete(`/rooms/${id}`);
      setRooms(rooms => rooms.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (user?.role !== 'owner') return <div className="text-center py-20 text-gray-400">Only room owners can view this page</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listed Rooms</h1>
        <Link to="/rooms/new" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium">+ Add Room</Link>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-gray-400">You haven't listed any rooms yet.</div>
      ) : (
        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room._id} className="bg-white rounded-xl border shadow-sm flex overflow-hidden">
              {room.images?.[0] ? (
                <img src={room.images[0]} alt={room.title} className="w-40 h-32 object-cover" />
              ) : (
                <div className="w-40 h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                  <Bed className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1 p-4 flex items-center justify-between">
                <div>
                  <Link to={`/rooms/${room._id}`} className="font-semibold text-gray-900 hover:text-primary-600">{room.title}</Link>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {room.locality}
                  </div>
                  <span className="flex items-center gap-1 font-bold text-primary-700 mt-1">
                    <IndianRupee className="w-4 h-4" />{room.price}/mo
                  </span>
                </div>
                <button onClick={() => handleDelete(room._id)} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
