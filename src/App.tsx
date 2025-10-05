import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'checkout';

function AppContent() {
  const [view, setView] = useState<View>('landing');
  const { user, loading } = useAuth();

  const goHome = () => {
    console.log('goHome called, scrolling to top');
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('AppContent render - user:', user?.email, 'view:', view);

  if (user) {
    if (view === 'checkout') {
      console.log('Rendering Checkout component');
      return <Checkout onHome={goHome} />;
    }
    console.log('Rendering Dashboard component');
    return <Dashboard onCheckout={() => setView('checkout')} onHome={goHome} />;
  }

  switch (view) {
    case 'login':
      return (
        <LoginForm
          onBack={() => setView('landing')}
          onSwitchToSignup={() => setView('signup')}
          onHome={goHome}
        />
      );
    case 'signup':
      return (
        <SignupForm
          onBack={() => setView('landing')}
          onSwitchToLogin={() => setView('login')}
          onHome={goHome}
        />
      );
    default:
      return (
        <LandingPage
          onLogin={() => setView('login')}
          onSignup={() => setView('signup')}
          onHome={goHome}
        />
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
