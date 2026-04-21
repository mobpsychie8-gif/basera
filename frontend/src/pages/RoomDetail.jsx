import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { MapPin, IndianRupee, Bed, Users, Phone, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    API.get(`/rooms/${id}`)
      .then(res => setRoom(res.data))
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!room) return <div className="text-center py-20 text-gray-400">Room not found</div>;

  const amenityIcons = {
    wifi: '📶', food: '🍽️', parking: '🅿️', laundry: '🧺', ac: '❄️', heater: '🔥',
    tv: '📺', fridge: '🧊', security: '🔒', power: '⚡', water: '💧', kitchen: '🍳'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/" className="text-primary-600 hover:underline text-sm mb-4 inline-block">← Back to listings</Link>

      {/* Image Gallery */}
      <div className="relative mb-6 rounded-xl overflow-hidden bg-gray-200">
        {room.images?.length > 0 ? (
          <>
            <img src={room.images[imgIdx]} alt={room.title} className="w-full h-72 md:h-96 object-cover" />
            {room.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + room.images.length) % room.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % room.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {room.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-2.5 h-2.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-72 flex items-center justify-center text-gray-400">
            <Bed className="w-20 h-20" />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" /> <span>{room.locality}, Srinagar</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-2xl font-bold text-primary-700">
              <IndianRupee className="w-5 h-5" />{room.price}<span className="text-sm font-normal text-gray-500">/month</span>
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm capitalize">{room.roomType} room</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm capitalize flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {room.gender}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{room.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {room.amenities?.map(a => (
                <span key={a} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {amenityIcons[a] || '✓'} {a.charAt(0).toUpperCase() + a.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Owner Card */}
        <div className="bg-white rounded-xl border shadow-sm p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Owner</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" /> {room.ownerName}
            </div>
            <a href={`tel:${room.ownerPhone}`} className="flex items-center gap-2 text-primary-600 hover:underline font-medium">
              <Phone className="w-4 h-4" /> {room.ownerPhone}
            </a>
            <a href={`https://wa.me/91${room.ownerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 font-medium mt-2">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
