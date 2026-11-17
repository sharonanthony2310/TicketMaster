
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="flex justify-center items-center gap-2 mb-10">
          <div className="bg-violet-600 p-2 rounded-xl">
            <Ticket size={25} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Ticket<span className="text-violet-400">Master</span>
          </h1>
        </div>

        <div className="bg-[#121216] border border-white/10 rounded-2xl p-8">

          <h2 className="text-2xl font-semibold text-white">
            Create your account
          </h2>

          <p className="text-gray-400 text-sm mt-2 mb-7">
            Start managing your projects with TicketMaster.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Full name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                minLength={2}
                maxLength={50}
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-3 pr-12 text-white outline-none focus:border-violet-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>

          <p className="text-center text-gray-400 text-sm mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300">
              Sign in
            </Link>
          </p>

        </div>

        <p className="text-center text-gray-600 text-xs mt-7">
          TicketMaster · Project & Issue Management
        </p>

      </div>
    </div>
  );
};

export default Register;
