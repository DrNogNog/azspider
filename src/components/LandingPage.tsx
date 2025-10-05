import { Search, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onHome: () => void;
}

export default function LandingPage({ onLogin, onSignup, onHome }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
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
          <div className="hidden md:flex items-center gap-8">
            <a href="#resources" className="text-slate-300 hover:text-white transition">Resources</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition">How It Works</a>
            <a href="#testimonials" className="text-slate-300 hover:text-white transition">Testimonials</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={onSignup}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <span className="text-cyan-400 text-sm font-medium">The Ultimate User Intelligence Engine</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Know More.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Decide Smarter.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            AzSpider crawls across platforms, links identifiers, and builds complete user insights for professionals who need to verify, investigate, or assess risk.
          </p>
          <button
            onClick={onSignup}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition transform hover:scale-105 shadow-xl shadow-cyan-500/25"
          >
            Start Your Research
          </button>
        </div>
      </section>

      <section id="resources" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Powerful Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-cyan-500/50 transition">
              <Search className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Comprehensive Profiling</h3>
              <p className="text-slate-400">From usernames to full identity trails. Connect the dots across platforms.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-cyan-500/50 transition">
              <Shield className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Connection Mapping</h3>
              <p className="text-slate-400">See how people, data, and platforms connect in real-time.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-cyan-500/50 transition">
              <Zap className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Accuracy</h3>
              <p className="text-slate-400">Fresh data, always current. Act with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account in seconds' },
              { step: '02', title: 'Enter Query', desc: 'Input username, email, or identifier' },
              { step: '03', title: 'AI Processing', desc: 'Our engine searches across platforms' },
              { step: '04', title: 'Get Results', desc: 'Receive comprehensive profile data' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition">
                  <div className="text-5xl font-bold text-cyan-500/20 mb-3">{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'HR Director',
                text: 'AzSpider transformed our hiring process. We now verify candidates beyond the resume with confidence.',
              },
              {
                name: 'Marcus Johnson',
                role: 'Fraud Analyst',
                text: 'The connection mapping feature helped us uncover a fraud ring in days, not months.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Investigative Journalist',
                text: 'From scattered data to complete stories. This tool is indispensable for my research.',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 text-cyan-400">★</div>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 mb-12 text-lg">One price. Unlimited power.</p>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-12 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="inline-block px-4 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full mb-6">
                <span className="text-cyan-400 text-sm font-medium">BEST VALUE</span>
              </div>
              <div className="mb-6">
                <div className="text-6xl font-bold text-white mb-2">
                  $15
                  <span className="text-2xl text-slate-400">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 text-left max-w-md mx-auto">
                {[
                  'Unlimited research queries',
                  'Real-time data access',
                  'Advanced connection mapping',
                  'Comprehensive profile building',
                  'Priority support',
                  'Export results in multiple formats',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignup}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition transform hover:scale-105 shadow-xl shadow-cyan-500/25"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is AzSpider legal to use?',
                a: 'Yes. AzSpider aggregates publicly available information and operates within legal frameworks including GDPR, CCPA, and OSINT guidelines. Users are responsible for compliance with local laws.',
              },
              {
                q: 'What kind of information can I find?',
                a: 'AzSpider searches across public platforms to find usernames, social profiles, contact information, and connection data. All information is sourced from publicly accessible sources.',
              },
              {
                q: 'How accurate is the data?',
                a: 'Our AI engine provides real-time data with high accuracy. However, we recommend cross-referencing critical information as part of your due diligence process.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. You can cancel your subscription at any time with no penalties. Your access continues until the end of your billing period.',
              },
              {
                q: 'Do you offer enterprise plans?',
                a: 'Yes. Contact our sales team for custom enterprise solutions with advanced features, dedicated support, and volume pricing.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition"
                >
                  <span className="text-lg font-semibold text-white">{faq.q}</span>
                  <AlertCircle className={`w-5 h-5 text-cyan-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-6 text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={onHome}
              className="text-xl font-bold text-white hover:text-cyan-400 transition cursor-pointer"
            >
              AzSpider
            </button>
          </div>
          <p className="text-sm">The Ultimate User Intelligence Engine</p>
          <p className="text-xs mt-4">© 2025 AzSpider. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
