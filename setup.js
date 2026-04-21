const fs = require("fs");
const path = require("path");
const base = "/workspace/basera";

const dirs = [
  "backend/src/controllers","backend/src/models","backend/src/routes","backend/src/middleware","backend/src/config","backend/src/utils",
  "frontend/src/components/ui","frontend/src/pages","frontend/src/hooks","frontend/src/lib","frontend/src/context","frontend/public"
];
dirs.forEach(d => fs.mkdirSync(path.join(base,d),{recursive:true}));

const files = {};

files["backend/package.json"] = JSON.stringify({
  name:"basera-backend",version:"1.0.0",description:"Basera Room Rental Backend",main:"src/server.js",
  scripts:{start:"node src/server.js",dev:"nodemon src/server.js"},
  dependencies:{express:"^4.18.2",mongoose:"^7.6.3",cors:"^2.8.5",dotenv:"^16.3.1",bcryptjs:"^2.4.3",jsonwebtoken:"^9.0.2","express-validator":"^7.0.1",morgan:"^1.10.0"},
  devDependencies:{nodemon:"^3.0.1"}
},null,2);

files["frontend/package.json"] = JSON.stringify({
  name:"basera-frontend",private:true,version:"1.0.0",type:"module",description:"Basera Room Rental Frontend",
  scripts:{dev:"vite --port 3000 --host 0.0.0.0",build:"vite build",preview:"vite preview"},
  dependencies:{react:"^18.2.0","react-dom":"^18.2.0","react-router-dom":"^6.20.0",axios:"^1.6.2","lucide-react":"^0.294.0"},
  devDependencies:{"@types/react":"^18.2.37","@types/react-dom":"^18.2.15","@vitejs/plugin-react":"^4.2.0",autoprefixer:"^10.4.16",postcss:"^8.4.31",tailwindcss:"^3.3.5",vite:"^5.0.0"}
},null,2);

files["backend/.env"] = "PORT=5000\nMONGODB_URI=mongodb://localhost:27017/basera\nJWT_SECRET=basera_secret_key_change_in_production\nJWT_EXPIRE=7d\n";

files[".gitignore"] = "node_modules/\ndist/\n.env\n*.log\n.DS_Store\n";

files["backend/src/server.js"] = `const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rooms", require("./routes/rooms"));
app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Basera API running" }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(err.statusCode||500).json({success:false,message:err.message||"Server Error"}); });
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI).then(() => { console.log("MongoDB Connected"); app.listen(PORT, "0.0.0.0", () => console.log("Server on port " + PORT)); }).catch(e => { console.error(e); process.exit(1); });
`;

files["backend/src/models/User.js"] = `const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:50},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  password:{type:String,required:true,minlength:6,select:false},
  phone:{type:String,trim:true},
  role:{type:String,enum:["tenant","landlord","admin"],default:"tenant"},
  avatar:{type:String,default:""}
},{timestamps:true});
userSchema.pre("save",async function(next){if(!this.isModified("password"))return next();this.password=await bcrypt.hash(this.password,10);next();});
userSchema.methods.comparePassword=async function(pw){return await bcrypt.compare(pw,this.password);};
module.exports=mongoose.model("User",userSchema);
`;

files["backend/src/models/Room.js"] = `const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxlength:100},
  description:{type:String,required:true,maxlength:1000},
  price:{type:Number,required:true},
  deposit:{type:Number,default:0},
  location:{address:{type:String,required:true},area:{type:String,required:true},city:{type:String,default:"Srinagar"},state:{type:String,default:"Uttarakhand"},coordinates:{lat:Number,lng:Number}},
  type:{type:String,enum:["single","double","flat","pg","hostel"],default:"single"},
  furnishing:{type:String,enum:["unfurnished","semi-furnished","fully-furnished"],default:"semi-furnished"},
  amenities:[{type:String,enum:["wifi","parking","water-supply","electricity","kitchen","washing-machine","ac","heater","attached-bathroom","balcony","cctv","guard"]}],
  images:[{type:String}],
  available:{type:Boolean,default:true},
  bedrooms:{type:Number,default:1},
  bathrooms:{type:Number,default:1},
  floor:{type:Number},
  landlord:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  contactPhone:{type:String}
},{timestamps:true});
module.exports=mongoose.model("Room",roomSchema);
`;

files["backend/src/middleware/auth.js"] = `const jwt=require("jsonwebtoken");const User=require("../models/User");
const protect=async(req,res,next)=>{let token;if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer"))token=req.headers.authorization.split(" ")[1];
if(!token)return res.status(401).json({success:false,message:"Not authorized"});
try{const d=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(d.id);next();}catch(e){return res.status(401).json({success:false,message:"Token failed"});}};
const authorize=(...roles)=>(req,res,next)=>{if(!roles.includes(req.user.role))return res.status(403).json({success:false,message:"Not authorized for this role"});next();};
module.exports={protect,authorize};
`;

files["backend/src/controllers/authController.js"] = `const jwt=require("jsonwebtoken");const User=require("../models/User");
const genToken=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE});
exports.register=async(req,res)=>{try{const{name,email,password,phone,role}=req.body;if(await User.findOne({email}))return res.status(400).json({success:false,message:"Email already registered"});
const user=await User.create({name,email,password,phone,role});const token=genToken(user._id);res.status(201).json({success:true,token,user:{id:user._id,name:user.name,email:user.email,role:user.role,phone:user.phone}});}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.login=async(req,res)=>{try{const{email,password}=req.body;if(!email||!password)return res.status(400).json({success:false,message:"Provide email and password"});
const user=await User.findOne({email}).select("+password");if(!user)return res.status(401).json({success:false,message:"Invalid credentials"});
if(!(await user.comparePassword(password)))return res.status(401).json({success:false,message:"Invalid credentials"});
const token=genToken(user._id);res.json({success:true,token,user:{id:user._id,name:user.name,email:user.email,role:user.role,phone:user.phone}});}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.getMe=async(req,res)=>{try{const user=await User.findById(req.user.id);res.json({success:true,user});}catch(e){res.status(500).json({success:false,message:e.message});}};
`;

files["backend/src/controllers/roomController.js"] = `const Room=require("../models/Room");
exports.getRooms=async(req,res)=>{try{const{area,type,minPrice,maxPrice,furnishing,available}=req.query;let f={};
if(area)f["location.area"]={$regex:area,$options:"i"};if(type)f.type=type;if(furnishing)f.furnishing=furnishing;
if(available!==undefined)f.available=available==="true";if(minPrice||maxPrice){f.price={};if(minPrice)f.price.$gte=+minPrice;if(maxPrice)f.price.$lte=+maxPrice;}
const rooms=await Room.find(f).populate("landlord","name phone").sort({createdAt:-1});res.json({success:true,count:rooms.length,rooms});}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.getRoom=async(req,res)=>{try{const room=await Room.findById(req.params.id).populate("landlord","name phone");if(!room)return res.status(404).json({success:false,message:"Room not found"});res.json({success:true,room});}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.createRoom=async(req,res)=>{try{req.body.landlord=req.user.id;const room=await Room.create(req.body);res.status(201).json({success:true,room});}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.updateRoom=async(req,res)=>{try{let room=await Room.findById(req.params.id);if(!room)return res.status(404).json({success:false,message:"Room not found"});
if(room.landlord.toString()!==req.user.id&&req.user.role!=="admin")return res.status(403).json({success:false,message:"Not authorized"});
room=await Room.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});res.json({success:true,room});}catch(e){res.status(500).json({success:false,message:e.message});}};
exports.deleteRoom=async(req,res)=>{try{const room=await Room.findById(req.params.id);if(!room)return res.status(404).json({success:false,message:"Room not found"});
if(room.landlord.toString()!==req.user.id&&req.user.role!=="admin")return res.status(403).json({success:false,message:"Not authorized"});
await room.deleteOne();res.json({success:true,message:"Room deleted"});}catch(e){res.status(500).json({success:false,message:e.message});}};
`;

files["backend/src/routes/auth.js"] = `const express=require("express");const router=express.Router();const{register,login,getMe}=require("../controllers/authController");const{protect}=require("../middleware/auth");
router.post("/register",register);router.post("/login",login);router.get("/me",protect,getMe);module.exports=router;
`;

files["backend/src/routes/rooms.js"] = `const express=require("express");const router=express.Router();const{getRooms,getRoom,createRoom,updateRoom,deleteRoom}=require("../controllers/roomController");const{protect,authorize}=require("../middleware/auth");
router.get("/",getRooms);router.get("/:id",getRoom);router.post("/",protect,authorize("landlord","admin"),createRoom);router.put("/:id",protect,updateRoom);router.delete("/:id",protect,deleteRoom);module.exports=router;
`;

files["frontend/vite.config.js"] = `import{defineConfig}from"vite";import react from"@vitejs/plugin-react";export default defineConfig({plugins:[react()],server:{port:3000,host:"0.0.0.0",allowedHosts:true,proxy:{"/api":{target:"http://localhost:5000",changeOrigin:true}}}});
`;

files["frontend/tailwind.config.js"] = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { primary: { 50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d" } } } },
  plugins: [],
};
`;

files["frontend/postcss.config.js"] = `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
`;

files["frontend/index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>Basera - Find Rooms in Srinagar, Garhwal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

files["frontend/src/index.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;
body { font-family: "Inter", system-ui, -apple-system, sans-serif; }
`;

files["frontend/src/main.jsx"] = `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`;

files["frontend/src/App.jsx"] = `import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RoomList from "./pages/RoomList";
import RoomDetail from "./pages/RoomDetail";
import PostRoom from "./pages/PostRoom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/post-room" element={<PostRoom />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
`;

files["frontend/src/context/AuthContext.jsx"] = `import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.removeItem("token"); setToken(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const r = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("token", r.data.token);
    setToken(r.data.token);
    setUser(r.data.user);
    return r.data;
  };
  const register = async (name, email, password, phone, role) => {
    const r = await axios.post("/api/auth/register", { name, email, password, phone, role });
    localStorage.setItem("token", r.data.token);
    setToken(r.data.token);
    setUser(r.data.user);
    return r.data;
  };
  const logout = () => { localStorage.removeItem("token"); setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
`;

files["frontend/src/lib/api.js"] = `import axios from "axios";
const API = axios.create({ baseURL: "/api" });
API.interceptors.request.use(c => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = "Bearer " + t;
  return c;
});
export default API;
`;

files["frontend/src/components/Navbar.jsx"] = `import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, LogIn, LogOut, PlusCircle, User, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
            <Home className="w-6 h-6" /> Basera
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/rooms" className="text-gray-600 hover:text-primary-600 font-medium">Browse</Link>
            {user ? (
              <>
                {user.role === "landlord" && (
                  <Link to="/post-room" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                    <PlusCircle className="w-4 h-4" /> Post Room
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-primary-600 font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <span className="text-sm text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> {user.name}</span>
                <button onClick={logout} className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1 text-gray-600 hover:text-primary-600 font-medium">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
`;

files["frontend/src/pages/Home.jsx"] = `import { Link } from "react-router-dom";
import { Search, Home as HomeIcon, Shield, MapPin } from "lucide-react";

export default function Home() {
  const areas = ["Srinagar City","Garhwal University","Devprayag Road","Kirti Nagar","Rishikesh Road","Pauri Road","Chauras","Maletha"];
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Perfect Room in <span className="text-primary-200">Srinagar, Garhwal</span></h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">Basera helps you find affordable rooms, PGs, and flats in Srinagar and surrounding areas of Garhwal, Uttarakhand.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/rooms" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 flex items-center gap-2"><Search className="w-5 h-5" /> Browse Rooms</Link>
            <Link to="/post-room" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 flex items-center gap-2"><HomeIcon className="w-5 h-5" /> Post a Room</Link>
          </div>
        </div>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Basera?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm"><MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Local Focus</h3><p className="text-gray-600">Built specifically for Srinagar, Garhwal.</p></div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm"><Search className="w-12 h-12 text-primary-600 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Easy Search</h3><p className="text-gray-600">Filter by area, price, type, and amenities.</p></div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm"><Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Verified Listings</h3><p className="text-gray-600">Landlord-verified with direct contact details.</p></div>
        </div>
      </section>
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Areas in Srinagar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {areas.map(a => <Link key={a} to={"/rooms?area="+a} className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow font-medium text-gray-700 hover:text-primary-600"><MapPin className="w-5 h-5 mx-auto mb-2 text-primary-500" />{a}</Link>)}
          </div>
        </div>
      </section>
    </div>
  );
}
`;

files["frontend/src/pages/RoomList.jsx"] = `import { useState, useEffect } from "react";
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
`;

files["frontend/src/pages/RoomDetail.jsx"] = `import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../lib/api";
import { MapPin, IndianRupee, Bed, Bath, Phone, ArrowLeft, Wifi, Car, Droplets, Zap, ChefHat, Wind, ShieldCheck } from "lucide-react";

const amIcon = { wifi: Wifi, parking: Car, "water-supply": Droplets, electricity: Zap, kitchen: ChefHat, ac: Wind, cctv: ShieldCheck };

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/rooms/" + id).then(r => setRoom(r.data.room)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!room) return <div className="text-center py-20 text-gray-500">Room not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/rooms" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          {room.images && room.images[0] ? <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" /> : <Bed className="w-20 h-20 text-primary-400" />}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div><h1 className="text-2xl font-bold">{room.title}</h1><div className="flex items-center gap-1 text-gray-500 mt-1"><MapPin className="w-4 h-4" /> {room.location?.address}, {room.location?.area}, {room.location?.city}</div></div>
            <span className="text-2xl font-bold text-primary-700 flex items-center gap-1"><IndianRupee className="w-5 h-5" />{room.price?.toLocaleString("en-IN")}<span className="text-sm text-gray-500">/mo</span></span>
          </div>
          {room.deposit > 0 && <p className="text-gray-600 mb-4">Deposit: ₹{room.deposit?.toLocaleString("en-IN")}</p>}
          <p className="text-gray-700 mb-6">{room.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center"><Bed className="w-5 h-5 mx-auto text-gray-500 mb-1" /><span className="text-sm text-gray-600">{room.bedrooms} Bed</span></div>
            <div className="bg-gray-50 p-3 rounded-lg text-center"><Bath className="w-5 h-5 mx-auto text-gray-500 mb-1" /><span className="text-sm text-gray-600">{room.bathrooms} Bath</span></div>
            <div className="bg-gray-50 p-3 rounded-lg text-center"><span className="text-sm text-gray-600 block">Type</span><span className="font-medium capitalize">{room.type}</span></div>
            <div className="bg-gray-50 p-3 rounded-lg text-center"><span className="text-sm text-gray-600 block">Furnishing</span><span className="font-medium">{room.furnishing}</span></div>
          </div>
          {room.amenities && room.amenities.length > 0 && (
            <div className="mb-6"><h3 className="font-semibold mb-2">Amenities</h3><div className="flex flex-wrap gap-2">
              {room.amenities.map(a => { const I = amIcon[a] || ShieldCheck; return <span key={a} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"><I className="w-3 h-3" />{a.replace(/-/g, " ")}</span>; })}
            </div></div>
          )}
          <div className="border-t pt-4"><h3 className="font-semibold mb-2">Contact Landlord</h3><p className="text-gray-700">{room.landlord?.name}</p>
            {(room.contactPhone || room.landlord?.phone) && <a href={"tel:" + (room.contactPhone || room.landlord?.phone)} className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 mt-2"><Phone className="w-4 h-4" /> Call {room.contactPhone || room.landlord?.phone}</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

files["frontend/src/pages/PostRoom.jsx"] = `import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";

export default function PostRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:"", description:"", price:"", deposit:"", type:"single", furnishing:"semi-furnished", bedrooms:1, bathrooms:1, floor:"", "location.address":"", "location.area":"", "location.city":"Srinagar", contactPhone:"", amenities:[] });
  const [error, setError] = useState("");

  if (!user) return <div className="text-center py-20">Please <a href="/login" className="text-primary-600 underline">login</a> to post a room.</div>;
  if (user.role !== "landlord") return <div className="text-center py-20">Only landlords can post rooms.</div>;

  const amOpts = ["wifi","parking","water-supply","electricity","kitchen","washing-machine","ac","heater","attached-bathroom","balcony","cctv","guard"];
  const handleChange = e => { const { name, value, checked } = e.target; if (name === "amenities") setForm(f => ({...f, amenities: checked ? [...f.amenities, value] : f.amenities.filter(a => a !== value)})); else setForm(f => ({...f, [name]: value})); };
  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    try {
      const p = { title:form.title, description:form.description, price:Number(form.price), deposit:Number(form.deposit)||0, type:form.type, furnishing:form.furnishing, bedrooms:Number(form.bedrooms), bathrooms:Number(form.bathrooms), floor:form.floor?Number(form.floor):undefined, location:{address:form["location.address"],area:form["location.area"],city:form["location.city"]}, contactPhone:form.contactPhone, amenities:form.amenities };
      await API.post("/rooms", p); navigate("/dashboard");
    } catch (e) { setError(e.response?.data?.message || "Failed to post room"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Post a Room</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
        <div><label className="block text-sm font-medium mb-1">Title *</label><input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Spacious room near GU" /></div>
        <div><label className="block text-sm font-medium mb-1">Description *</label><textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full border rounded-lg px-3 py-2" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Rent (₹) *</label><input name="price" type="number" value={form.price} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Deposit (₹)</label><input name="deposit" type="number" value={form.deposit} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Type</label><select name="type" value={form.type} onChange={handleChange} className="w-full border rounded-lg px-3 py-2"><option value="single">Single</option><option value="double">Double</option><option value="flat">Flat</option><option value="pg">PG</option><option value="hostel">Hostel</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Beds</label><input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Baths</label><input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Furnishing</label><select name="furnishing" value={form.furnishing} onChange={handleChange} className="w-full border rounded-lg px-3 py-2"><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi</option><option value="fully-furnished">Full</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Address *</label><input name="location.address" value={form["location.address"]} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Area *</label><input name="location.area" value={form["location.area"]} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">City</label><input name="location.city" value={form["location.city"]} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Contact Phone</label><input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-2">Amenities</label><div className="flex flex-wrap gap-2">{amOpts.map(a => <label key={a} className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm cursor-pointer"><input type="checkbox" name="amenities" value={a} checked={form.amenities.includes(a)} onChange={handleChange} />{a.replace(/-/g, " ")}</label>)}</div></div>
        <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold">Post Room</button>
      </form>
    </div>
  );
}
`;

files["frontend/src/pages/Login.jsx"] = `import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    try { await login(email, password); navigate("/dashboard"); }
    catch (e) { setError(e.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Login to Basera</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-lg px-3 py-2" /></div>
        <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> Login</button>
      </form>
      <p className="text-center mt-4 text-gray-600">No account? <Link to="/register" className="text-primary-600 font-medium">Sign Up</Link></p>
    </div>
  );
}
`;

files["frontend/src/pages/Register.jsx"] = `import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "tenant" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    try { await register(form.name, form.email, form.password, form.phone, form.role); navigate("/dashboard"); }
    catch (e) { setError(e.response?.data?.message || "Registration failed"); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">I am a</label><select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="tenant">Tenant</option><option value="landlord">Landlord</option></select></div>
        <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> Sign Up</button>
      </form>
      <p className="text-center mt-4 text-gray-600">Have an account? <Link to="/login" className="text-primary-600 font-medium">Login</Link></p>
    </div>
  );
}
`;

files["frontend/src/pages/Dashboard.jsx"] = `import { useState, useEffect } from "react";
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
`;

files["README.md"] = `# Basera - Room Rental App for Srinagar, Garhwal

MERN stack app for finding/posting rooms, PGs, and flats in Srinagar, Garhwal (Uttarakhand).

## Structure
- backend/ - Express + MongoDB API (auth, rooms CRUD)
- frontend/ - React + Vite + Tailwind CSS

## Quick Start
### Backend: cd backend && bun install && bun run dev
### Frontend: cd frontend && bun install && bun run dev
`;

// Write all files
Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(base, relPath);
  fs.writeFileSync(fullPath, content);
});

// Verify
const written = Object.keys(files).length;
const backendFiles = fs.readdirSync(path.join(base, "backend/src")).length;
const frontendFiles = fs.readdirSync(path.join(base, "frontend/src")).length;
console.log("Created " + written + " files");
console.log("Backend src dirs: " + backendFiles);
console.log("Frontend src items: " + frontendFiles);
