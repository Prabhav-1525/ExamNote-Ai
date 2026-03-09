import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#f43f5e', '#f59e0b', '#10b981', '#6366f1'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to ExamNote AI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const perks = ['AI-powered flashcard generation', 'Spaced repetition learning', 'Audio & video study cards', '3 uploads/hour free'];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 mesh-bg">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left info */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">Exam<span className="text-violet-400">Note</span> AI</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight">
              Study smarter,<br />not harder
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Upload your notes and let AI do the hard work of creating comprehensive study materials.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-jade-400 flex-shrink-0" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-8 rounded-2xl space-y-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div>
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { field: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </label>
                <input
                  type={type} required
                  value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required minLength={8}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                type="password" required
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.confirm && form.confirm !== form.password ? '#f43f5e' : 'var(--border)'}`,
                  color: 'var(--text-primary)'
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs mt-1 text-red-400">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c6cf5 0%, #6366f1 100%)' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-medium hover:text-violet-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
