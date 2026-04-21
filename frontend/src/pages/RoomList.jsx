import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../lib/api";
import { MapPin, IndianRupee, Bed, Bath, Search as SearchIcon } from "lucide-react";

export default function RoomList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    area: searchParams.get("area") || "", type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "", maxPrice: searchParams.get("maxPrice") || "",
    furnishing: searchParams.get("furnishing") || ""
  });

  useEffect(() => { fetchRooms(); }, [searchParams]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const p = {}; searchParams.forEach((v, k) => { if (v) p[k] = v; });
      const r = await API.get("/rooms", { params: p });
      setRooms(r.data.rooms);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleFilter = e => {
    e.preventDefault();
    const p = {}; Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v; });
    setSearchParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Rooms</h1>
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl shadow-sm mb-8 grid md:grid-cols-5 gap-4 items-end">
        <div><label className="text-sm text-gray-600 block mb-1">Area</label><input value={filters.area} onChange={e => setFilters({...filters, area: e.target.value})} placeholder="e.g. Garhwal University" className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="text-sm text-gray-600 block mb-1">Type</label><select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">All</option><option value="single">Single</option><option value="double">Double</option><option value="flat">Flat</option><option value="pg">PG</option><option value="hostel">Hostel</option></select></div>
        <div><label className="text-sm text-gray-600 block mb-1">Price</label><div className="flex gap-2"><input type="number" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} placeholder="Min" className="w-1/2 border rounded-lg px-3 py-2" /><input type="number" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} placeholder="Max" className="w-1/2 border rounded-lg px-3 py-2" /></div></div>
        <div><label className="text-sm text-gray-600 block mb-1">Furnishing</label><select value={filters.furnishing} onChange={e => setFilters({...filters, furnishing: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">Any</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi</option><option value="fully-furnished">Full</option></select></div>
        <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"><SearchIcon className="w-4 h-4" /> Search</button>
      </form>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> :
       rooms.length === 0 ? <div className="text-center py-12 text-gray-500">No rooms found.</div> :
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {rooms.map(r => (
           <Link key={r._id} to={"/rooms/"+r._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
             <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
               {r.images && r.images[0] ? <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" /> : <Bed className="w-16 h-16 text-primary-400" />}
             </div>
             <div className="p-4">
               <h3 className="font-semibold text-lg mb-1">{r.title}</h3>
               <div className="flex items-center gap-1 text-gray-500 text-sm mb-2"><MapPin className="w-4 h-4" /> {r.location?.area}, {r.location?.city}</div>
               <div className="flex items-center justify-between">
                 <span className="text-primary-700 font-bold flex items-center gap-1"><IndianRupee className="w-4 h-4" />{r.price?.toLocaleString("en-IN")}/mo</span>
                 <div className="flex gap-3 text-gray-500 text-sm"><span className="flex items-center gap-1"><Bed className="w-3 h-3" />{r.bedrooms}</span><span className="flex items-center gap-1"><Bath className="w-3 h-3" />{r.bathrooms}</span></div>
               </div>
               <div className="mt-2 flex gap-2 flex-wrap">
                 <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">{r.type}</span>
                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{r.furnishing}</span>
                 {r.available && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Available</span>}
               </div>
             </div>
           </Link>
         ))}
       </div>}
    </div>
  );
}
