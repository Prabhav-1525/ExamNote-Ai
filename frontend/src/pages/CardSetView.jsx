import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, FileText, Volume2, Video, 
  Download, Play, Pause, Copy, ChevronDown, ChevronUp,
  GraduationCap, ExternalLink, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import api from '../utils/api';

const TABS = [
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'notes', label: 'Quick Notes', icon: FileText },
  { id: 'audio', label: 'Audio Cards', icon: Volume2 },
  { id: 'video', label: 'Video Ideas', icon: Video },
];

// Flashcard component with flip animation
function Flashcard({ card, index, onReview }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="card-flip-container" style={{ height: '220px' }}>
      <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="card-front rounded-2xl p-6 flex flex-col justify-between cursor-pointer"
          onClick={() => setFlipped(true)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-mono px-2 py-1 rounded-lg"
              style={{ background: 'rgba(124,108,245,0.2)', color: '#a78bfa' }}>
              Q{index + 1}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              card.difficulty === 'easy' ? 'text-jade-400 bg-jade-400/15' :
              card.difficulty === 'hard' ? 'text-red-400 bg-red-400/15' :
              'text-amber-400 bg-amber-400/15'
            }`}>{card.difficulty}</span>
          </div>
          <p className="text-base font-medium leading-relaxed">{card.question}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Click to reveal answer</p>
        </div>
        {/* Back */}
        <div className="card-back rounded-2xl p-6 flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(124,108,245,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(124,108,245,0.3)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Answer</p>
          <p className="text-base leading-relaxed">{card.answer}</p>
          <div className="flex gap-2">
            {[
              { q: 1, label: '😕 Hard', color: '#f43f5e' },
              { q: 3, label: '🤔 OK', color: '#f59e0b' },
              { q: 5, label: '😄 Easy', color: '#10b981' },
            ].map(({ q, label, color }) => (
              <button key={q} onClick={() => { onReview(card._id, q); setFlipped(false); }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio card with TTS
function AudioCard({ card }) {
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef(null);

  const speak = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(card.script);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(card.script);
    toast.success('Script copied!');
  };

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{card.title}</h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.duration}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyScript}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={speak}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              playing ? 'text-red-400 bg-red-500/15' : 'text-violet-400 bg-violet-500/15'
            }`}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? 'Stop' : 'Play'}
          </button>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.script}</p>
      {playing && (
        <div className="flex gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-1 rounded-full bg-violet-500 animate-bounce"
              style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

// Video card
function VideoCard({ card }) {
  const [expanded, setExpanded] = useState(false);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(card.youtubeQuery || card.concept)}`;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="bg-gradient-to-br from-violet-900/50 to-indigo-900/50 p-6 flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{card.title}</h4>
          <p className="text-xs mt-0.5 text-violet-300">{card.duration} explainer</p>
        </div>
        <Video className="w-8 h-8 text-violet-400 opacity-50" />
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Concept: </span>
          {card.concept}
        </p>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Hide' : 'Show'} script
        </button>
        {expanded && (
          <div className="p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {card.script}
          </div>
        )}
        {card.visualIdeas?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Visual Ideas:</p>
            <div className="flex flex-wrap gap-2">
              {card.visualIdeas.map((idea, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(124,108,245,0.15)', color: '#a78bfa' }}>{idea}</span>
              ))}
            </div>
          </div>
        )}
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
          Find related videos on YouTube
        </a>
      </div>
    </div>
  );
}

export default function CardSetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cardSet, setCardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flashcards');
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    api.get(`/cards/${id}`)
      .then(({ data }) => setCardSet(data.cardSet))
      .catch(() => { toast.error('Card set not found'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (cardId, quality) => {
    try {
      await api.post(`/cards/${id}/review`, { cardId, quality });
      const labels = { 1: 'Marked as hard', 3: 'Got it!', 5: 'Easy! Great job 🎉' };
      toast.success(labels[quality] || 'Reviewed!');
    } catch { toast.error('Failed to save review'); }
  };

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/cards/${id}/export?format=${format}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cardSet.title}.${format === 'anki' ? 'txt' : 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cardSet) return null;

  const totalCards = cardSet.flashcards?.length || 0;
  const reviewed = cardSet.flashcards?.filter(c => c.lastReviewed).length || 0;

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm mb-4 hover:text-violet-400 transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {(cardSet.tags || []).slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,108,245,0.2)', color: '#a78bfa' }}>{tag}</span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{cardSet.title}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {cardSet.topic} · {totalCards} flashcards · {reviewed} reviewed
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/study/${id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c6cf5, #6366f1)' }}>
                <GraduationCap className="w-4 h-4" /> Study Mode
              </button>
              <div className="relative group">
                <button className="p-2 rounded-xl transition-colors hover:bg-white/5"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl py-2 z-10 hidden group-hover:block dropdown-enter"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {['csv', 'anki'].map(fmt => (
                    <button key={fmt} onClick={() => handleExport(fmt)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>
                      Export as {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Progress</span>
              <span>{totalCards > 0 ? Math.round((reviewed / totalCards) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                style={{ width: `${totalCards > 0 ? (reviewed / totalCards) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} onClick={() => setActiveTab(tid)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === tid ? 'text-white' : 'hover:bg-white/5'
              }`}
              style={{
                background: activeTab === tid ? 'linear-gradient(135deg, rgba(124,108,245,0.8), rgba(99,102,241,0.8))' : '',
                color: activeTab === tid ? 'white' : 'var(--text-secondary)'
              }}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {tid === 'flashcards' ? cardSet.flashcards?.length :
                 tid === 'notes' ? cardSet.quickNotes?.length :
                 tid === 'audio' ? cardSet.soundCards?.length :
                 cardSet.videoCards?.length}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'flashcards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardSet.flashcards?.map((card, i) => (
              <Flashcard key={card._id} card={card} index={i} onReview={handleReview} />
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {cardSet.quickNotes?.map((note, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <button className="w-full flex items-center justify-between p-5"
                  onClick={() => setExpandedNotes(p => ({ ...p, [i]: !p[i] }))}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="font-semibold">{note.topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(note.bullets.join('\n')); toast.success('Copied!'); }}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Copy className="w-4 h-4" />
                    </button>
                    {expandedNotes[i] ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                </button>
                {expandedNotes[i] && (
                  <div className="px-5 pb-5">
                    <ul className="space-y-2">
                      {note.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                          <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-4">
            {cardSet.soundCards?.map((card, i) => <AudioCard key={i} card={card} />)}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cardSet.videoCards?.map((card, i) => <VideoCard key={i} card={card} />)}
          </div>
        )}
      </div>
    </div>
  );
}
