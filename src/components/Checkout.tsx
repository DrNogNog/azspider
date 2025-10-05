import { Search, CreditCard, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onHome: () => void;
}

export default function Checkout({ onHome }: CheckoutProps) {
  const { user, profile, refreshProfile } = useAuth();
  const checkoutStarted = useRef(false);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check for successful payment and redirect to dashboard
  useEffect(() => {
    const checkPaymentStatus = async () => {
      console.log('Checking payment status:', { 
        isPaid: profile?.is_paid, 
        userId: user?.id, 
        userEmail: user?.email 
      });
      
      if (profile?.is_paid) {
        console.log('Payment detected! Starting redirect...');
        // Add a small delay to let user see the success message
        redirectTimeout.current = setTimeout(() => {
          console.log('Redirecting to dashboard...');
          onHome();
        }, 2000); // 2 second delay
        return;
      }
    };

    checkPaymentStatus();
  }, [profile, onHome]);

  // Enhanced polling with focus detection
  useEffect(() => {
    if (!profile?.is_paid && checkoutStarted.current) {
      console.log('Starting polling for payment status...');
      
      const interval = setInterval(async () => {
        console.log('Polling for payment status...');
        try {
          await refreshProfile();
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      }, 2000); // Check every 2 seconds when checkout has started

      // Also check immediately when window regains focus (user returns from Stripe)
      const handleFocus = async () => {
        if (checkoutStarted.current) {
          console.log('Window focused, checking payment status...');
          try {
            await refreshProfile();
          } catch (error) {
            console.error('Error refreshing profile on focus:', error);
          }
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      return () => {
        console.log('Cleaning up polling...');
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
        if (redirectTimeout.current) {
          clearTimeout(redirectTimeout.current);
        }
      };
    }
  }, [profile, refreshProfile]);

  const handleCheckout = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_00000000000';
    if (!paymentLink || paymentLink.includes('test_00000000000')) {
      // Friendly message if env var not set
      // eslint-disable-next-line no-alert
      alert('No Stripe payment link configured. See .env.example to add VITE_STRIPE_PAYMENT_LINK for testing.');
      return;
    }
    
    // Mark that checkout has started
    checkoutStarted.current = true;
    console.log('Checkout started, opening Stripe...');
    
    // Open Stripe checkout
    window.open(paymentLink, '_blank');
    
    // Show a helpful message
    // eslint-disable-next-line no-alert
    alert('Payment window opened! Complete your payment and return to this page to continue.');
  };

  // Manual refresh button for debugging
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered...');
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error in manual refresh:', error);
    }
  };

  // Manual payment activation for testing
  const handleManualActivation = async () => {
    if (!user) return;
    
    try {
      console.log('Manually activating payment for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error manually activating payment:', error);
        alert('Error: ' + error.message);
      } else {
        console.log('Successfully activated payment manually');
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error in manual activation:', error);
      alert('Error: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <button
              onClick={onHome}
              className="text-2xl font-bold text-white hover:text-cyan-400 transition cursor-pointer"
            >
              AzSpider
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Unlock Full Access</h1>
          <p className="text-slate-400 text-lg">
            Subscribe to access the complete intelligence research platform
          </p>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-slate-800/30 rounded-lg text-xs text-slate-400">
          <p>Debug Info:</p>
          <p>User ID: {user?.id}</p>
          <p>User Email: {user?.email}</p>
          <p>Profile is_paid: {String(profile?.is_paid)}</p>
          <p>Checkout Started: {String(checkoutStarted.current)}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Manual Refresh
            </button>
            <button
              onClick={handleManualActivation}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs"
            >
              Manual Activate (Test)
            </button>
          </div>
        </div>

        {/* Show success message if payment is completed */}
        {profile?.is_paid && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-green-400 mb-4">Your subscription is now active. Redirecting to dashboard in 2 seconds...</p>
              <button
                onClick={onHome}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition"
              >
                Go to Dashboard Now
              </button>
            </div>
          </div>
        )}

        {/* Show waiting message if checkout has started */}
        {checkoutStarted.current && !profile?.is_paid && (
          <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment in Progress</h2>
              <p className="text-blue-400 mb-4">Complete your payment in the new window, then return here to continue.</p>
              <p className="text-sm text-slate-400 mb-4">We'll automatically detect when your payment is complete!</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleManualRefresh}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition"
                >
                  Check Payment Status
                </button>
                <button
                  onClick={handleManualActivation}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition"
                >
                  Manual Activate (Test)
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">What You'll Get</h2>
            <ul className="space-y-4">
              {[
                { icon: Search, text: 'Unlimited research queries' },
                { icon: Zap, text: 'Real-time data access' },
                { icon: Shield, text: 'Advanced connection mapping' },
                { icon: CreditCard, text: 'Comprehensive profile building' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/50 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="inline-block px-4 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full mb-6">
                <span className="text-cyan-400 text-sm font-medium">PREMIUM ACCESS</span>
              </div>

              <div className="mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  $15
                  <span className="text-xl text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">Billed monthly, cancel anytime</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Account</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white">Premium Monthly</span>
                </div>
                <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-white">$15.00</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition transform hover:scale-105 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Subscribe Now
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-2">Safe & Secure</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your payment information is encrypted and secure. We use Stripe for payment processing and never store your credit card details. Cancel anytime with no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
