import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Shield, User, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { supabase, DEMO_PROFILES, setCurrentProfile } from '../lib/supabaseClient';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const customProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Supabase User',
          role: (data.user.user_metadata?.role as any) || 'END_USER',
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
        };
        setCurrentProfile(customProfile);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials or use demo personas.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (persona: typeof DEMO_PROFILES[0]) => {
    setCurrentProfile(persona);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign in to Resolve 360</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access the Multimodal AI Technical Support Workspace
          </p>
        </div>

        {/* 1-Click Demo Login Personas */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Demo Evaluation Personas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => loginAsDemo(DEMO_PROFILES[0])}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all text-left"
            >
              <Shield className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="leading-tight">IT Specialist</p>
                <p className="text-[10px] text-purple-300/70">Alex Rivera</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDemo(DEMO_PROFILES[1])}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all text-left"
            >
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="leading-tight">End User</p>
                <p className="text-[10px] text-cyan-300/70">Sarah Chen</p>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0f172a] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
            Or Supabase Account
          </span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSupabaseLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Supabase'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
};
