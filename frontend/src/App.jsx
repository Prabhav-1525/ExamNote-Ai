import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CardSetView from './pages/CardSetView';
import Upload from './pages/Upload';
import StudyMode from './pages/StudyMode';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" 
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/cards/:id" element={<ProtectedRoute><CardSetView /></ProtectedRoute>} />
      <Route path="/study/:id" element={<ProtectedRoute><StudyMode /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a35',
              color: '#f0f0f5',
              border: '1px solid rgba(124,108,245,0.3)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0a18' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0a18' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
