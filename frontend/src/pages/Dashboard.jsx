import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";
import { LayoutDashboard, Home, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [myRooms, setMyRooms] = useState([]);

  useEffect(() => {
    if (user) {
      API.get("/rooms").then(r => setMyRooms(r.data.rooms.filter(rm => rm.landlord?._id === user.id || rm.landlord === user.id))).catch(console.error);
    }
  }, [user]);

  if (!user) return <div className="text-center py-20">Please <Link to="/login" className="text-primary-600 underline">login</Link>.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6"><LayoutDashboard className="w-8 h-8 text-primary-600" /><div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-gray-500">Welcome, {user.name}</p></div></div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-2">Profile</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">Email:</span><span>{user.email}</span>
          <span className="text-gray-500">Phone:</span><span>{user.phone || "Not set"}</span>
          <span className="text-gray-500">Role:</span><span className="capitalize">{user.role}</span>
        </div>
      </div>
      {user.role === "landlord" && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">My Listings</h2><Link to="/post-room" className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"><PlusCircle className="w-4 h-4" /> Post New</Link></div>
          {myRooms.length === 0 ? <p className="text-gray-500 text-center py-8">No rooms posted yet.</p> :
          <div className="space-y-3">{myRooms.map(r => <Link key={r._id} to={"/rooms/"+r._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"><Home className="w-5 h-5 text-primary-600" /><div className="flex-1"><span className="font-medium">{r.title}</span><span className="text-sm text-gray-500 block">{r.location?.area}</span></div><span className="text-primary-700 font-semibold">₹{r.price?.toLocaleString("en-IN")}/mo</span><span className={"text-xs px-2 py-1 rounded " + (r.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{r.available ? "Available" : "Rented"}</span></Link>)}</div>}
        </div>
      )}
      {user.role === "tenant" && (
        <div className="bg-white p-6 rounded-xl shadow-sm"><h2 className="text-lg font-semibold mb-2">Quick Links</h2><Link to="/rooms" className="text-primary-600 hover:underline">Browse rooms →</Link></div>
      )}
    </div>
  );
}
