import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex mesh-bg">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a35 0%, #0a0a18 100%)' }}>
        <div className="absolute inset-0 opacity-30">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
                top: `${10 + i * 12}%`, left: `${5 + i * 8}%`,
                background: `rgba(124,108,245,${0.08 - i * 0.01})`,
                border: '1px solid rgba(124,108,245,0.15)',
                animation: `float ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }} />
          ))}
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ExamNote AI</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Turn notes into<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                smart flashcards
              </span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Upload PDF or Word files. AI creates interactive study cards in seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '⚡', label: 'AI-Powered', desc: 'GPT-4 extraction' },
              { emoji: '🃏', label: 'Flashcards', desc: 'Spaced repetition' },
              { emoji: '🔊', label: 'Audio Cards', desc: 'Text-to-speech' },
              { emoji: '📊', label: 'Analytics', desc: 'Track progress' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl"
                style={{ background: 'rgba(124,108,245,0.1)', border: '1px solid rgba(124,108,245,0.2)' }}>
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm" style={{ color: 'var(--text-secondary)' }}>
          © 2024 ExamNote AI. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">Exam<span className="text-violet-400">Note</span></span>
          </div>

          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to continue studying smarter
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--text-secondary)' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c6cf5 0%, #6366f1 100%)' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
