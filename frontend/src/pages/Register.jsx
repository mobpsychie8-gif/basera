import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'seeker' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-6">
          <UserPlus className="w-10 h-10 text-primary-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm">Join Basera to find or list rooms</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <div className="flex gap-3">
              <label className={`flex-1 text-center py-2.5 rounded-lg border cursor-pointer font-medium ${form.role === 'seeker' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'hover:bg-gray-50'}`}>
                <input type="radio" name="role" value="seeker" checked={form.role === 'seeker'} onChange={e => update('role', e.target.value)} className="hidden" />
                Room Seeker
              </label>
              <label className={`flex-1 text-center py-2.5 rounded-lg border cursor-pointer font-medium ${form.role === 'owner' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'hover:bg-gray-50'}`}>
                <input type="radio" name="role" value="owner" checked={form.role === 'owner'} onChange={e => update('role', e.target.value)} className="hidden" />
                Room Owner
              </label>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium">Create Account</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
