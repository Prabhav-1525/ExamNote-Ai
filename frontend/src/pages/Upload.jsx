import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const POLL_INTERVAL = 2000;
const MAX_POLLS = 60;

export default function Upload() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | uploading | processing | done | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [cardSetId, setCardSetId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') toast.error('File too large (max 10MB)');
      else toast.error('Only PDF or Word (.docx) files are allowed');
      return;
    }
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;
    setStage('uploading');
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 80) / e.total);
          setProgress(10 + pct);
        }
      });

      setCardSetId(data.cardSetId);
      setStage('processing');
      setProgress(90);

      // Poll for completion
      let polls = 0;
      const pollInterval = setInterval(async () => {
        polls++;
        try {
          const { data: statusData } = await api.get(`/upload/status/${data.cardSetId}`);
          if (statusData.status === 'ready') {
            clearInterval(pollInterval);
            setProgress(100);
            setStage('done');
            toast.success('Cards generated successfully! 🎉');
          } else if (statusData.status === 'error') {
            clearInterval(pollInterval);
            setStage('error');
            setErrorMsg(statusData.errorMessage || 'Processing failed');
          } else if (polls >= MAX_POLLS) {
            clearInterval(pollInterval);
            setStage('error');
            setErrorMsg('Processing timed out. Please try again.');
          }
        } catch {
          if (polls >= MAX_POLLS) {
            clearInterval(pollInterval);
            setStage('error');
            setErrorMsg('Failed to check processing status');
          }
        }
      }, POLL_INTERVAL);

    } catch (err) {
      setStage('error');
      setErrorMsg(err.response?.data?.message || 'Upload failed');
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const uploadsLeft = user?.plan === 'pro' ? '∞' : Math.max(0, 10 - (user?.stats?.uploadsThisHour || 0));

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm mb-6 hover:text-violet-400 transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold">Upload Notes</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            PDF or Word documents. AI will generate interactive study cards.
          </p>
        </div>

        {stage === 'idle' && (
          <div className="space-y-6">
            {/* Dropzone */}
            <div {...getRootProps()}
              className={`relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'scale-[1.02]' : 'hover:border-violet-500/50'
              }`}
              style={{
                border: `2px dashed ${isDragActive ? '#7c6cf5' : 'rgba(255,255,255,0.15)'}`,
                background: isDragActive ? 'rgba(124,108,245,0.1)' : 'rgba(255,255,255,0.03)'
              }}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isDragActive ? 'bg-violet-500 scale-110' : 'bg-violet-500/20'
                }`}>
                  <UploadIcon className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-violet-400'}`} />
                </div>
                {file ? (
                  <div>
                    <div className="flex items-center gap-2 text-jade-400 font-medium">
                      <FileText className="w-5 h-5" />
                      <span>{file.name}</span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                      {isDragActive ? 'Drop it here!' : 'Drag & drop your notes'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      or <span className="text-violet-400">browse</span> to choose a file
                    </p>
                    <p className="text-xs mt-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      Supports PDF, DOC, DOCX · Max 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {file && (
              <button onClick={handleUpload}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #7c6cf5 0%, #6366f1 100%)' }}>
                <UploadIcon className="w-5 h-5" />
                Generate Study Cards
              </button>
            )}

            <div className="flex items-center justify-between p-4 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Uploads this hour</span>
              <span className={`font-medium ${uploadsLeft === 0 ? 'text-red-400' : 'text-violet-400'}`}>
                {uploadsLeft} / {user?.plan === 'pro' ? '∞' : '10'} remaining
              </span>
            </div>
          </div>
        )}

        {(stage === 'uploading' || stage === 'processing') && (
          <div className="p-10 rounded-2xl text-center space-y-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <Loader className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stage === 'uploading' ? 'Uploading your file...' : '🤖 AI is generating cards...'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {stage === 'processing' ? 'Extracting text and creating flashcards, quick notes, audio scripts...' : 'Sending to server...'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-indigo-500"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>{progress}%</p>
            </div>
            {stage === 'processing' && (
              <div className="flex flex-wrap gap-2 justify-center">
                {['Extracting text', 'Creating flashcards', 'Writing audio scripts', 'Generating video ideas'].map((step, i) => (
                  <span key={step} className="text-xs px-3 py-1 rounded-full animate-pulse"
                    style={{ background: 'rgba(124,108,245,0.2)', color: '#a78bfa', animationDelay: `${i * 0.3}s` }}>
                    {step}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {stage === 'done' && (
          <div className="p-10 rounded-2xl text-center space-y-6"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-jade-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-jade-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-jade-400">Cards Ready! 🎉</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Your study cards have been generated successfully.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/cards/${cardSetId}`)}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                View My Cards
              </button>
              <button onClick={() => { setStage('idle'); setFile(null); setProgress(0); }}
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:bg-white/5"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Upload Another
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="p-10 rounded-2xl text-center space-y-6"
            style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.3)' }}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">Processing Failed</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{errorMsg}</p>
            </div>
            <button onClick={() => { setStage('idle'); setFile(null); setProgress(0); setErrorMsg(''); }}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'rgba(124,108,245,0.8)' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
