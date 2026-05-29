import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Menu, Cloud } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 text-zinc-100 p-1.5 rounded-md">
                <BookOpen size={20} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-lg text-zinc-100 tracking-tight">SkillSphere</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/skills" className="text-sm text-zinc-400 hover:text-zinc-100 font-medium transition-colors">
              Browse Skills
            </Link>
            <Link to="/courses" className="text-sm text-zinc-400 hover:text-zinc-100 font-medium transition-colors">
              Courses
            </Link>
            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-zinc-800">
                <Link to="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100 font-medium transition-colors flex items-center gap-1.5">
                  <UserIcon size={16} /> Dashboard
                </Link>
                <Link to="/azure" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1.5">
                  <Cloud size={16} /> Azure
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-red-400 font-medium transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-4 border-l border-zinc-800">
                <Link to="/login" className="text-sm text-zinc-300 hover:text-zinc-100 font-medium transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-zinc-100 hover:bg-white text-zinc-900 px-3.5 py-1.5 rounded-md font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle (stubbed) */}
          <div className="flex items-center md:hidden">
            <button className="text-zinc-400 hover:text-zinc-100 p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
