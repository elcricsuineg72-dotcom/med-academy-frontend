import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FlaskConical, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';

const SUBJECT_OPTIONS = [
  'Organic Chemistry', 'Physical Chemistry', 'Analytical Chemistry',
  'Inorganic Chemistry', 'Biochemistry', 'Thermodynamics & Kinetics',
];

const modulePreview = [
  { icon: '🧪', name: 'Organic Chemistry',    code: 'CHEM201' },
  { icon: '⚗️', name: 'Physical Chemistry',   code: 'CHEM202' },
  { icon: '🔬', name: 'Analytical Chemistry', code: 'CHEM203' },
  { icon: '🧲', name: 'Inorganic Chemistry',  code: 'CHEM204' },
  { icon: '🧬', name: 'Biochemistry',         code: 'CHEM301' },
  { icon: '🔥', name: 'Thermodynamics',       code: 'CHEM205' },
];

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSubject = (s) =>
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      const from = location.state?.from?.pathname;
      if (from && from !== '/auth') navigate(from, { replace: true });
      else navigate(user.role === 'tutor' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, requestedSubjects: selectedSubjects });
      setRegistrationSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRAND PANEL ─────────────────────────────── */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A0A0A 0%, #1C1C2E 60%, #003D6B 100%)' }}>

        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #0077C8, transparent 70%)', transform: 'translate(20%, -20%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold tracking-tight">Med Academy</p>
            <p className="text-gray-500 text-xs">Chemistry Tutoring Platform</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-6 w-fit border border-brand-gold/30"
            style={{ background: 'rgba(201,168,76,0.12)', color: '#E8C96A' }}>
            <Sparkles className="w-3.5 h-3.5" /> Enrollments Open · 2026
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Access curated study notes, past papers, and expert guidance
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-10">
            to master your chemistry modules.
          </p>

          {/* Module grid — side by side */}
          <div className="grid grid-cols-2 gap-2.5">
            {modulePreview.map((m) => (
              <div key={m.code}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-white/6 hover:border-brand-azure/30 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-lg flex-shrink-0">{m.icon}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{m.name}</p>
                  <p className="text-gray-600 text-xs font-mono">{m.code}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Back to home */}
          <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-azure transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-gray-600 text-xs">
          © 2026 Med Academy. Empowering chemistry students in Botswana.
        </p>
      </div>

      {/* ── RIGHT AUTH PANEL ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-brand-pearl overflow-y-auto">

        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <p className="font-bold text-gray-900 text-xl">Med Academy</p>
        </div>

        <div className="w-full max-w-md">

          {/* Mode toggle */}
          <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-8 shadow-sm">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${
                  mode === m
                    ? 'text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={mode === m ? { background: 'linear-gradient(135deg, #0077C8, #3B99E0)' } : {}}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-400 text-sm mt-2">Sign in to your student portal</p>
              </div>

              <div>
                <label className="label">Email Address</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input-field" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} name="password" required
                    value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="input-field pr-11" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* Demo credentials */}
              <div className="rounded-2xl p-4 border border-brand-azure/20"
                style={{ background: 'linear-gradient(135deg, #E8F4FF, #D0E9FF)' }}>
                <p className="text-xs font-bold text-brand-azure mb-2 uppercase tracking-wide">Demo Credentials</p>
                <p className="text-xs text-brand-azure-dark">🎓 Tutor: <span className="font-mono">tutor@medacademy.com</span> / <span className="font-mono">Tutor1234!</span></p>
                <p className="text-xs text-brand-azure-dark mt-1">👨‍🎓 Student: <span className="font-mono">kagiso@student.com</span> / <span className="font-mono">Student123!</span></p>
              </div>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')}
                  className="text-brand-azure font-semibold hover:underline">Register here</button>
              </p>
            </form>
          )}

          {/* ── REGISTER SUCCESS ── */}
          {mode === 'register' && registrationSuccess && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Account Created!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your account is <strong className="text-amber-600">pending approval</strong>. Your tutor will review your registration and activate your account shortly.
              </p>
              <div className="rounded-2xl p-4 border border-amber-200 text-left"
                style={{ background: '#FFFBEB' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">What happens next?</p>
                    <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                      You'll receive an email once your tutor approves your account. This usually takes 1–2 business days.
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => { setMode('login'); setRegistrationSuccess(false); }} className="btn-secondary w-full">
                Back to Sign In
              </button>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && !registrationSuccess && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-400 text-sm mt-2">Join Med Academy and start learning</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name</label>
                  <input type="text" name="firstName" required value={form.firstName} onChange={handleChange}
                    placeholder="First name" className="input-field" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input type="text" name="lastName" required value={form.lastName} onChange={handleChange}
                    placeholder="Last name" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input-field" />
              </div>

              <div>
                <label className="label">Password <span className="text-gray-400 normal-case font-normal tracking-normal">(min 8 chars)</span></label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} name="password" required minLength={8}
                    value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="input-field pr-11" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input type="password" name="confirmPassword" required value={form.confirmPassword}
                  onChange={handleChange} placeholder="••••••••" className="input-field" />
              </div>

              <div>
                <label className="label">Subjects you're taking</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SUBJECT_OPTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSubjects.includes(s)
                          ? 'text-white border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure/40'
                      }`}
                      style={selectedSubjects.includes(s) ? { background: 'linear-gradient(135deg, #0077C8, #3B99E0)', borderColor: 'transparent' } : {}}>
                      {selectedSubjects.includes(s) && '✓ '}{s}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

              <div className="rounded-2xl p-3.5 border border-amber-200 flex items-start gap-2.5"
                style={{ background: '#FFFBEB' }}>
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Your account will be <strong>PENDING</strong> until your tutor approves it.
                </p>
              </div>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="text-brand-azure font-semibold hover:underline">Sign in</button>
              </p>
            </form>
          )}
        </div>

        {/* Mobile back to home */}
        <Link to="/" className="mt-8 lg:hidden inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-azure transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AuthPage;
