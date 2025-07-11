import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaEnvelope, FaUser, FaStream } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth(); // useAuth always returns AuthContextType, never undefined
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="w-full bg-white/10 backdrop-blur-md shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="text-2xl font-bold text-cyan-400 tracking-tight drop-shadow-lg">ProNet</div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-white/20 shadow-md hover:shadow-xl transition-all duration-200 focus:outline-none"
            onClick={() => setOpen((v) => !v)}
          >
            <img
              src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/40 shadow"
            />
            <span className="text-white font-semibold text-base hidden sm:block">{user?.username || 'User'}</span>
            <FaChevronDown className={`text-cyan-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-black/90 rounded-xl shadow-2xl border border-white/20 animate-fadeIn z-50">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900 rounded-xl transition-all duration-150 text-base font-medium"
                onClick={logout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
      `}</style>
    </header>
  );
};

export default Navbar;

export const BottomNav: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around py-3 z-50 border-t border-gray-800">
      <Link to="/" className={location.pathname === "/" ? "text-cyan-400" : ""}><FaHome size={24} /></Link>
      <Link to="/feed" className={location.pathname === "/feed" ? "text-cyan-400" : ""}><FaStream size={24} /></Link>
      <Link to="/posts/create" className={location.pathname === "/posts/create" ? "text-cyan-400" : ""}><FaPlus size={24} /></Link>
      <Link to="/messages" className={location.pathname === "/messages" ? "text-cyan-400" : ""}><FaEnvelope size={24} /></Link>
      <Link to="/profile" className={location.pathname === "/profile" ? "text-cyan-400" : ""}><FaUser size={24} /></Link>
    </nav>
  );
} 