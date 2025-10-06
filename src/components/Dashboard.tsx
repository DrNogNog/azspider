import { useAuth } from '../contexts/AuthContext';
import { Search, LogOut, CreditCard, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface DashboardProps {
  onCheckout: () => void;
  onHome: () => void;
}

interface Profile {
  platform: string;
  username: string;
  status: string;
  followers?: string;
  connections?: string;
  repos?: string;
}

interface Connection {
  name: string;
  relation: string;
}

interface Result {
  inputs: { [key: string]: string };
  profiles: Profile[];
  connections?: Connection[];
  pdfData?: string;
}

export default function Dashboard({ onCheckout, onHome }: DashboardProps) {
  const { user, profile, signOut } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (profile && !profile.is_paid) {
      onCheckout();
    } else if (profile?.is_paid) {
      setShowContent(true);
    }
  }, [profile, onCheckout]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Welcome back,</p>
              <p className="text-white font-medium">{profile?.full_name || user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Premium Active</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Intelligence Research Portal</h1>
          <p className="text-slate-400 text-lg">Enter any identifier to begin your investigation</p>
        </div>

        <ResearchForm />
      </div>
    </div>
  );
}

function ResearchForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username && !email && !phone && !fullName) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          username,
          name: fullName,
        }),
      });

      if (!response.ok) {
        // Try to parse as JSON, but handle cases where it's not JSON
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If it's not JSON, use the status text
          console.log('Error response is not JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success && data.pdfData) {
        // Show success message with PDF data
        setResult({
          inputs: { fullName, username, email, phone },
          profiles: [],
          connections: [],
          pdfData: data.pdfData,
        });
      } else {
        setError(data.error || 'Unexpected response format');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (result?.pdfData) {
      const link = document.createElement('a');
      link.href = result.pdfData;
      link.download = `profile-analysis-${username || fullName || 'unknown'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., john_doe_123"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., john@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +1 555 123 4567"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Start Investigation
                </>
              )}
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Investigation Complete</h3>
              {result.pdfData && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {Object.entries(result.inputs).map(([key, val]) => (
                <div key={key} className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-xs text-slate-400 capitalize">{key}</div>
                  <div className="text-white mt-1">{val || 'N/A'}</div>
                </div>
              ))}
            </div>

            {result.pdfData && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Analysis Report</h4>
                <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                  <iframe
                    src={result.pdfData}
                    className="w-full h-[80vh] border-0"
                    title="Profile Analysis Report"
                    style={{ minHeight: '600px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


