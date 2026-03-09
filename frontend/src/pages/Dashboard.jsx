import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, BookOpen, Zap, Clock, Trash2, ChevronRight, BarChart2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const statusBadge = {
  ready: { label: 'Ready', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  processing: { label: 'Processing...', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  error: { label: 'Error', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' }
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function CardSetCard({ cardSet, onDelete }) {
  const navigate = useNavigate();
  const badge = statusBadge[cardSet.status] || statusBadge.ready;
  const totalCards = cardSet.flashcards?.length || 0;
  const reviewed = cardSet.progress?.reviewedCards || 0;

  return (
    <div className="group rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px]"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      onClick={() => cardSet.status === 'ready' && navigate(`/cards/${cardSet._id}`)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold truncate">{cardSet.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{cardSet.topic || 'General'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
          <button onClick={e => { e.stopPropagation(); onDelete(cardSet._id); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/20 hover:text-red-400"
            style={{ color: 'var(--text-secondary)' }}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {cardSet.status === 'ready' && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1 flex-wrap">
              {(cardSet.tags || []).slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,108,245,0.15)', color: '#a78bfa' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{totalCards} flashcards</span>
              <span>{reviewed}/{totalCards} reviewed</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                style={{ width: `${totalCards > 0 ? (reviewed / totalCards) * 100 : 0}%` }} />
            </div>
          </div>
        </>
      )}

      {cardSet.status === 'processing' && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          AI is generating your cards...
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {new Date(cardSet.createdAt).toLocaleDateString()}
        </span>
        {cardSet.status === 'ready' && (
          <span className="text-xs text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all">
            Study now <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [cardSets, setCardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCardSets = async () => {
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/cards', { params });
      setCardSets(data.cardSets || []);
    } catch {
      toast.error('Failed to load card sets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCardSets(); }, [search]);

  // Poll for processing items
  useEffect(() => {
    const processing = cardSets.some(c => c.status === 'processing');
    if (!processing) return;
    const interval = setInterval(fetchCardSets, 3000);
    return () => clearInterval(interval);
  }, [cardSets]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this card set?')) return;
    try {
      await api.delete(`/cards/${id}`);
      setCardSets(prev => prev.filter(c => c._id !== id));
      toast.success('Card set deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const stats = user?.stats || {};
  const studyHours = Math.round((stats.studyTime || 0) / 60 * 10) / 10;

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Hello, <span className="text-violet-400">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ready to study? Your cards are waiting.
            </p>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c6cf5, #6366f1)' }}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Notes</span>
            <span className="sm:hidden">Upload</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Total Cards" value={stats.totalCards || 0} color="#7c6cf5" />
          <StatCard icon={Zap} label="Files Processed" value={stats.filesProcessed || 0} color="#10b981" />
          <StatCard icon={Clock} label="Study Hours" value={studyHours} color="#f59e0b" />
          <StatCard icon={BarChart2} label="Card Sets" value={cardSets.length} color="#6366f1" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search card sets by title, topic, or tag..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Card sets grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl shimmer" style={{ background: 'var(--bg-card)' }} />
            ))}
          </div>
        ) : cardSets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {search ? 'No results found' : 'No card sets yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {search ? 'Try different search terms' : 'Upload your first notes to get started'}
            </p>
            {!search && (
              <Link to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #7c6cf5, #6366f1)' }}>
                <Plus className="w-4 h-4" /> Upload Notes
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardSets.map(cardSet => (
              <CardSetCard key={cardSet._id} cardSet={cardSet} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
