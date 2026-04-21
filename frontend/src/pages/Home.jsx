import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { MapPin, IndianRupee, Bed, Users, Search, SlidersHorizontal } from 'lucide-react';

const LOCALITIES = ['Dal Gate', 'Jawahar Nagar', 'Sonwar', 'Rajbagh', 'Hyderpora', 'Bemina', 'Batmaloo', 'Lal Chowk'];
const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'];
const GENDERS = ['male', 'female', 'any'];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ locality: '', roomType: '', gender: '', minPrice: '', maxPrice: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async (params = {}) => {
    setLoading(true);
    try {
      const res = await API.get('/rooms', { params });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (filters.locality) params.locality = filters.locality;
    if (filters.roomType) params.roomType = filters.roomType;
    if (filters.gender) params.gender = filters.gender;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    fetchRooms(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Room in Srinagar</h1>
        <p className="text-gray-500 text-lg">Affordable paying guest & shared rooms across Srinagar</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by locality..."
            value={filters.locality}
            onChange={e => setFilters(f => ({ ...f, locality: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 font-medium">Search</button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="max-w-2xl mx-auto mb-6 bg-white p-4 rounded-lg shadow-sm border grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={filters.roomType} onChange={e => setFilters(f => ({ ...f, roomType: e.target.value }))} className="border rounded-lg px-3 py-2">
            <option value="">Room Type</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))} className="border rounded-lg px-3 py-2">
            <option value="">Gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </select>
          <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} className="border rounded-lg px-3 py-2" />
          <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} className="border rounded-lg px-3 py-2" />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No rooms found. Try adjusting your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {rooms.map(room => (
            <Link key={room._id} to={`/rooms/${room._id}`} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
              {room.images?.[0] ? (
                <img src={room.images[0]} alt={room.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  <Bed className="w-12 h-12" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{room.title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5" /> {room.locality}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-primary-700">
                    <IndianRupee className="w-4 h-4" />{room.price}/mo
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" /> {room.gender}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
