import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, BookOpen, Moon, Sun, 
  LogOut, Menu, X, Zap, BarChart2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload', path: '/upload' },
];

export default function Navbar() {
  const { user, logout, toggleDarkMode, darkMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b" 
      style={{ background: 'rgba(10,10,24,0.8)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/25 transition-shadow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Exam<span className="text-violet-400">Note</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link key={path} to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'hover:bg-white/5'
                }`}
                style={{ color: location.pathname === path ? undefined : 'var(--text-secondary)' }}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Stats badge */}
            {user?.stats && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(124,108,245,0.15)', color: 'var(--text-secondary)' }}>
                <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
                <span>{user.stats.totalCards} cards</span>
              </div>
            )}

            <button onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
                {initials}
              </div>
              <button onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-red-500/10 hover:text-red-400"
                style={{ color: 'var(--text-secondary)' }}>
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === path ? 'bg-violet-500/20 text-violet-300' : ''
                }`}
                style={{ color: location.pathname === path ? undefined : 'var(--text-secondary)' }}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
