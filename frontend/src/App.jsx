import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomDetail from './pages/RoomDetail';
import NewRoom from './pages/NewRoom';
import MyRooms from './pages/MyRooms';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/rooms/new" element={<NewRoom />} />
        <Route path="/my-rooms" element={<MyRooms />} />
      </Routes>
    </div>
  );
}
