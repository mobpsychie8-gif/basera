import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { Plus, X } from 'lucide-react';

const LOCALITIES = ['Dal Gate', 'Jawahar Nagar', 'Sonwar', 'Rajbagh', 'Hyderpora', 'Bemina', 'Batmaloo', 'Lal Chowk'];
const AMENITIES = ['wifi', 'food', 'parking', 'laundry', 'ac', 'heater', 'tv', 'fridge', 'security', 'power', 'water', 'kitchen'];
const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'];
const GENDERS = ['male', 'female', 'any'];

export default function NewRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', price: '', roomType: 'single', locality: 'Dal Gate',
    amenities: [], gender: 'any', ownerName: user?.name || '', ownerPhone: user?.phone || ''
  });
  const [images, setImages] = useState([]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') v.forEach(a => data.append('amenities', a));
        else data.append(k, v);
      });
      images.forEach(img => data.append('images', img));
      await API.post('/rooms', data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create room');
    }
  };

  const Step1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Details</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input type="text" value={form.title} onChange={e => update('title', e.target.value)} required placeholder="e.g. Cozy single room near Dal Lake" className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} required rows={4} placeholder="Describe the room, surroundings, rules..." className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹/month)</label>
          <input type="number" value={form.price} onChange={e => update('price', e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select value={form.roomType} onChange={e => update('roomType', e.target.value)} className="w-full border rounded-lg px-4 py-2.5">
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Location & Amenities</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
        <select value={form.locality} onChange={e => update('locality', e.target.value)} className="w-full border rounded-lg px-4 py-2.5">
          {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <div className="flex gap-3">
          {GENDERS.map(g => (
            <label key={g} className={`flex-1 text-center py-2.5 rounded-lg border cursor-pointer font-medium capitalize ${form.gender === g ? 'bg-primary-50 border-primary-500 text-primary-700' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={e => update('gender', e.target.value)} className="hidden" />
              {g}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => (
            <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 rounded-full text-sm border capitalize ${form.amenities.includes(a) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'hover:bg-gray-50'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Photos & Contact</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photos (max 5)</label>
        <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files).slice(0, 5))} className="w-full border rounded-lg px-4 py-2.5" />
        {images.length > 0 && <p className="text-sm text-gray-500 mt-1">{images.length} file(s) selected</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
        <input type="text" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
        <input type="tel" value={form.ownerPhone} onChange={e => update('ownerPhone', e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">List a New Room</h2>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && Step1()}
          {step === 2 && Step2()}
          {step === 3 && Step3()}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">Back</button>
            ) : <div />}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Next</button>
            ) : (
              <button type="submit" className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" /> List Room
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
