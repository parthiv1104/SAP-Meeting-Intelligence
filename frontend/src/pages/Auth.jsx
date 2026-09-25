import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Sparkles, Mail, Lock, User, Briefcase, Eye, EyeOff,
  ArrowRight, ShieldCheck, CalendarCheck, BrainCircuit, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoMark from '../components/ui/LogoMark';

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-slate-950 font-sans text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
      {/* Background Decorative Gradients & Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[150px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-between px-6 py-8 lg:flex-row lg:items-center lg:gap-16 lg:py-12">
        
        {/* Left Hero & Feature Highlights (Desktop) */}
        <div className="hidden max-w-xl flex-1 flex-col justify-between space-y-10 lg:flex">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 backdrop-blur-md">
              <Sparkles size={14} className="text-brand-400" />
              <span>Enterprise AI Workspace</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-tight">
              Meeting Intelligence &amp; Consulting Excellence.
            </h1>
            
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Transform workshop recordings and client conversations into structured requirements, verified blueprint findings, and domain-aware preparation briefs.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition hover:border-slate-700">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <CalendarCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dynamic Microsoft 365 Sync</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Syncs directly with your Outlook/Teams mailbox. Every consultant accesses their live upcoming and past workshop calendar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition hover:border-slate-700">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">OpenAI GPT-4o &amp; Whisper Pipeline</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Automated audio transcription with post-session intelligence, action tracking, and tailored discovery questions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition hover:border-slate-700">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Enterprise Data Privacy</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Isolated client workspaces with live PostgreSQL/SQLite persistence and secure token authorization.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-400" /> Enterprise Consulting Standard</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-400" /> S/4HANA &amp; Cross-Module</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-brand-400" /> Zero Mock Data</span>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">
            
            {/* Logo & Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Meeting Intelligence Workspace"
                  className="h-10 w-auto max-w-[210px] object-contain brightness-110"
                />
              </div>

              <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-700">
                Meeting Intelligence
              </span>
            </div>

            {/* Title */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white">
                Sign in to your workspace
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Enter your work credentials to access your meetings and projects. Account registration is managed by your Administrator.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-brand-400 hover:text-brand-300 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
