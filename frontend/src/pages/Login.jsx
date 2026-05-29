import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-primary-400 mb-4 border border-zinc-700">
          <LogIn size={20} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100">Welcome back</h2>
        <p className="text-zinc-400 mt-2">Log in to your SkillSphere account</p>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
