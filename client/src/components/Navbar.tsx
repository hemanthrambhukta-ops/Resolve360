import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Cpu, 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  PlusCircle, 
  Shield, 
  User, 
  ChevronDown, 
  LogOut,
  Sparkles,
  Layers
} from 'lucide-react';
import { getCurrentProfile, setCurrentProfile, DEMO_PROFILES } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [currentUser, setUser] = useState<UserProfile>(getCurrentProfile());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentProfile());
    };
    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Session', path: '/workspace/new', icon: PlusCircle, highlight: true },
    { name: 'Tickets', path: '/tickets', icon: FileText },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Resolve<span className="text-indigo-400">360</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                MULTIMODAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Gemini 3.8 Multimodal Diagnostics
            </p>
          </div>
        </Link>

        {/* Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : link.highlight
                    ? 'text-cyan-400 hover:text-white hover:bg-slate-800/70'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : link.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* AI Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Online</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-left"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-700"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.full_name}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
                  <Shield className="w-2.5 h-2.5 text-indigo-400" />
                  {currentUser.role === 'IT_SUPPORT' ? 'IT Specialist' : 'End User'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800/80">
                  <p className="text-xs text-slate-400">Current Role</p>
                  <p className="text-sm font-semibold text-white">{currentUser.full_name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                    currentUser.role === 'IT_SUPPORT'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>

                <div className="px-2 py-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                    Switch Test Persona
                  </p>
                  {DEMO_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentProfile(p);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        p.id === currentUser.id
                          ? 'bg-indigo-600/20 text-indigo-300'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <img src={p.avatar_url} alt="" className="w-6 h-6 rounded-md object-cover" />
                      <div className="text-left">
                        <p className="font-medium">{p.full_name}</p>
                        <p className="text-[10px] text-slate-400">{p.role}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-800/80 pt-1 px-2">
                  <Link
                    to="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Supabase Auth Login</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 bg-slate-950/80 px-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs ${
                isActive ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
