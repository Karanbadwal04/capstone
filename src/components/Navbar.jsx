import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, MessageSquare, User, Plus, Shield, Menu, LogIn, LogOut, Briefcase, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showClientMenu, setShowClientMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userType, setUserType] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Check auth state on every route change
    const checkAuthState = () => {
      const token = localStorage.getItem('token');
      const verified = localStorage.getItem('isVerified') === 'true';
      const type = localStorage.getItem('userType');
      
      setIsLoggedIn(!!token);
      setIsVerified(verified);
      setUserType(type);
    };

    checkAuthState();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('userEmail');
    window.location.href = '/auth';
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl shadow-lg"
      style={{ backgroundColor: 'var(--navbar-bg)' }}
    >
      <div
        className="container mx-auto px-4 py-4 flex justify-between items-center border rounded-2xl mt-2"
        style={{ backdropFilter: 'blur(14px)', backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <Link to="/" className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Home className="w-6 h-6 text-brand-orange" /> Micro-Job
        </Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="text-brand-text hover:text-brand-orange transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
            <Home className="w-4 h-4" /> Home
          </Link>

          {isLoggedIn && (
            <Link to="/dashboard" className="text-brand-text hover:text-brand-orange transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </Link>
          )}

          {/* Student Dropdown - Only for verified students */}
          {isLoggedIn && isVerified && (
            <div 
              className="relative"
              onMouseEnter={() => setShowStudentMenu(true)}
              onMouseLeave={() => setShowStudentMenu(false)}
            >
              <button className="text-brand-text hover:text-brand-orange transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
                <Briefcase className="w-4 h-4" /> Sell Services
              </button>
            <div 
              className={`absolute left-0 mt-2 w-60 bg-brand-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${
                showStudentMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              style={{ zIndex: 100 }}
            >
              <div className="py-2">
                <Link 
                  to="/student/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-t-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">👤</span>
                  <div>
                    <p className="font-semibold">My Profile</p>
                    <p className="text-xs text-brand-muted">Manage your info</p>
                  </div>
                </Link>
                <Link 
                  to="/student/gigs" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📝</span>
                  <div>
                    <p className="font-semibold">My Gigs</p>
                    <p className="text-xs text-brand-muted">Create services</p>
                  </div>
                </Link>
                <Link 
                  to="/student/orders" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📋</span>
                  <div>
                    <p className="font-semibold">My Orders</p>
                    <p className="text-xs text-brand-muted">Track work</p>
                  </div>
                </Link>
                <Link 
                  to="/student/earnings" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">💰</span>
                  <div>
                    <p className="font-semibold">Earnings</p>
                    <p className="text-xs text-brand-muted">View payments</p>
                  </div>
                </Link>
                <div className="border-t mx-2" style={{ borderColor: 'var(--border-color)' }}></div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-b-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">⚙️</span>
                  <div>
                    <p className="font-semibold">Account Settings</p>
                    <p className="text-xs text-brand-muted">Edit profile</p>
                  </div>
                </Link>
              </div>
            </div>
            </div>
          )}

          {/* Client Dropdown - For all logged in users */}
          {isLoggedIn && (
            <div 
              className="relative"
              onMouseEnter={() => setShowClientMenu(true)}
              onMouseLeave={() => setShowClientMenu(false)}
            >
              <button className="text-brand-text hover:text-brand-orange transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
                <ShoppingBag className="w-4 h-4" /> Buy Services
              </button>
            <div 
              className={`absolute left-0 mt-2 w-60 bg-brand-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${
                showClientMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              style={{ zIndex: 100 }}
            >
              <div className="py-2">
                <Link 
                  to="/client/search" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-t-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">🔍</span>
                  <div>
                    <p className="font-semibold">Search Services</p>
                    <p className="text-xs text-brand-muted">Find talent</p>
                  </div>
                </Link>
                <Link 
                  to="/client/orders" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📦</span>
                  <div>
                    <p className="font-semibold">My Orders</p>
                    <p className="text-xs text-brand-muted">Review work</p>
                  </div>
                </Link>
                <Link 
                  to="/client/transactions" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📊</span>
                  <div>
                    <p className="font-semibold">Transactions</p>
                    <p className="text-xs text-brand-muted">Payment history</p>
                  </div>
                </Link>
                <div className="border-t mx-2" style={{ borderColor: 'var(--border-color)' }}></div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-b-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">⚙️</span>
                  <div>
                    <p className="font-semibold">Account Settings</p>
                    <p className="text-xs text-brand-muted">Edit profile</p>
                  </div>
                </Link>
              </div>
            </div>
            </div>
          )}

          {isLoggedIn && userType !== 'admin' && (
            <Link to="/messages" className="text-brand-text hover:text-brand-orange transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
              <MessageSquare className="w-4 h-4" /> Messages
            </Link>
          )}

          {isLoggedIn && userType === 'admin' && (
            <Link to="/admin-dashboard" className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 border border-red-500/30">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}

          {isLoggedIn && isVerified && (
            <Link to="/create" className="bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Gig
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="relative bg-gradient-to-r from-brand-orange/20 to-brand-glow/20 text-white p-2.5 rounded-xl hover:from-brand-orange/30 hover:to-brand-glow/30 transition-all duration-300 border border-brand-orange/30 shadow-lg hover:shadow-brand-orange/50"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative z-10">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 animate-pulse" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </div>
            <div className="absolute inset-0 bg-brand-orange/10 rounded-xl blur-sm"></div>
          </button>

          {!isLoggedIn ? (
            <Link to="/auth" className="bg-gradient-to-r from-brand-orange/80 to-orange-600/80 text-white px-4 py-2 rounded-lg hover:shadow-brand-orange/50 transition flex items-center gap-2 border border-brand-orange/50 shadow-lg hover:scale-105">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          ) : (
            <button onClick={handleLogout} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 border border-red-500/30 shadow-lg hover:scale-105">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="relative bg-gradient-to-r from-brand-orange/20 to-brand-glow/20 text-white p-2.5 rounded-xl hover:from-brand-orange/30 hover:to-brand-glow/30 transition-all duration-300 border border-brand-orange/30"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <Menu className="text-brand-text cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}