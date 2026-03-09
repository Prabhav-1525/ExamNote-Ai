import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Trophy, RotateCcw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MODES = ['quiz', 'review'];

export default function StudyMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cardSet, setCardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('review'); // review | quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [studyTime, setStudyTime] = useState(0);

  useEffect(() => {
    api.get(`/cards/${id}`)
      .then(({ data }) => setCardSet(data.cardSet))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  // Study timer
  useEffect(() => {
    const interval = setInterval(() => {
      setStudyTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Save study time on exit
  useEffect(() => {
    return () => {
      const minutes = Math.round((Date.now() - startTime) / 60000);
      if (minutes > 0) api.post(`/cards/${id}/study-time`, { minutes }).catch(() => {});
    };
  }, [id]);

  const cards = cardSet?.flashcards || [];
  const current = cards[currentIndex];

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = async (isCorrect) => {
    const quality = isCorrect ? 5 : 1;
    await api.post(`/cards/${id}/review`, { cardId: current._id, quality }).catch(() => {});

    if (isCorrect) setScore(p => ({ ...p, correct: p.correct + 1 }));
    else setScore(p => ({ ...p, incorrect: p.incorrect + 1 }));

    setQuizAnswer(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => {
      setQuizAnswer(null);
      setFlipped(false);
      if (currentIndex + 1 >= cards.length) {
        finishSession(isCorrect ? score.correct + 1 : score.correct);
      } else {
        setCurrentIndex(p => p + 1);
      }
    }, 800);
  };

  const finishSession = async (finalScore) => {
    setDone(true);
    const total = cards.length;
    try {
      await api.post(`/cards/${id}/quiz`, { score: finalScore, total });
    } catch {}
  };

  const restart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setQuizAnswer(null);
    setScore({ correct: 0, incorrect: 0 });
    setDone(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const progressPct = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  if (done) {
    const pct = Math.round((score.correct / cards.length) * 100);
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
            <p style={{ color: 'var(--text-secondary)' }}>You studied {cards.length} cards in {formatTime(studyTime)}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Score', value: `${pct}%`, color: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e' },
              { label: 'Correct', value: score.correct, color: '#10b981' },
              { label: 'Review', value: score.incorrect, color: '#f43f5e' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={restart}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button onClick={() => navigate(`/cards/${id}`)}
              className="flex-1 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c6cf5, #6366f1)' }}>
              View Cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-3"
        style={{ background: 'rgba(10,10,24,0.8)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate(`/cards/${id}`)}
              className="flex items-center gap-2 text-sm hover:text-violet-400 transition-colors"
              style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft className="w-4 h-4" />
              Exit
            </button>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(studyTime)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-jade-400 font-medium">✓ {score.correct}</span>
                <span className="text-red-400 font-medium">✗ {score.incorrect}</span>
              </div>
              <span>{currentIndex + 1} / {cards.length}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Mode tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit mx-auto"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
            {MODES.map(m => (
              <button key={m} onClick={() => { setMode(m); setFlipped(false); setQuizAnswer(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  mode === m ? 'text-white' : ''
                }`}
                style={{
                  background: mode === m ? 'linear-gradient(135deg, rgba(124,108,245,0.8), rgba(99,102,241,0.8))' : '',
                  color: mode === m ? 'white' : 'var(--text-secondary)'
                }}>
                {m === 'review' ? '📚 Review' : '🧠 Quiz'}
              </button>
            ))}
          </div>

          {/* Flashcard */}
          <div className={`card-flip-container transition-all duration-300 ${
            quizAnswer === 'correct' ? 'scale-105' : quizAnswer === 'incorrect' ? 'scale-95' : ''
          }`} style={{ height: '280px' }}>
            <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`}>
              <div className="card-front rounded-3xl p-8 flex flex-col justify-between cursor-pointer"
                onClick={() => setFlipped(true)}
                style={{ background: 'var(--bg-card)', border: `1px solid ${quizAnswer === 'correct' ? 'rgba(16,185,129,0.5)' : quizAnswer === 'incorrect' ? 'rgba(244,63,94,0.5)' : 'var(--border)'}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {mode === 'quiz' ? '🧠 Quiz Mode' : '📚 Review Mode'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    current.difficulty === 'easy' ? 'text-jade-400 bg-jade-400/15' :
                    current.difficulty === 'hard' ? 'text-red-400 bg-red-400/15' :
                    'text-amber-400 bg-amber-400/15'
                  }`}>{current.difficulty}</span>
                </div>
                <p className="text-xl font-medium text-center leading-relaxed">{current.question}</p>
                <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                  {flipped ? '' : 'Tap to reveal answer'}
                </p>
              </div>
              <div className="card-back rounded-3xl p-8 flex flex-col justify-between"
                style={{ background: 'linear-gradient(135deg, rgba(124,108,245,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(124,108,245,0.4)' }}>
                <p className="text-sm font-medium text-violet-300">Answer</p>
                <p className="text-lg text-center leading-relaxed">{current.answer}</p>
                {mode === 'review' && (
                  <div className="flex gap-3">
                    <button onClick={() => handleAnswer(false)}
                      className="flex-1 py-3 rounded-xl font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
                      style={{ background: 'rgba(244,63,94,0.2)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}>
                      <X className="w-4 h-4" /> Missed
                    </button>
                    <button onClick={() => handleAnswer(true)}
                      className="flex-1 py-3 rounded-xl font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
                      style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <Check className="w-4 h-4" /> Got it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quiz mode answer buttons when not flipped */}
          {mode === 'quiz' && !flipped && (
            <div className="mt-6 text-center">
              <button onClick={() => setFlipped(true)}
                className="px-8 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c6cf5, #6366f1)' }}>
                Show Answer
              </button>
            </div>
          )}
          {mode === 'quiz' && flipped && (
            <div className="mt-6 flex gap-3">
              <button onClick={() => handleAnswer(false)}
                className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'rgba(244,63,94,0.2)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}>
                <X className="w-4 h-4" /> Missed
              </button>
              <button onClick={() => handleAnswer(true)}
                className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                <Check className="w-4 h-4" /> Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
