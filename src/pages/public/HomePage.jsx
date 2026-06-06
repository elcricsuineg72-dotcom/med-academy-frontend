import { Link } from 'react-router-dom';
import {
  FlaskConical, BookOpen, Users, ArrowRight,
  CheckCircle, Star, Mail, Phone, MapPin, ChevronRight, Sparkles
} from 'lucide-react';

const PublicNav = () => (
  <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50"
    style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm tracking-tight leading-none">Med Academy</p>
            <p className="text-xs text-gray-400">Chemistry Tutoring</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['#about', '#services', '#pricing', '#contact'].map(href => (
            <a key={href} href={href}
              className="text-sm font-medium text-gray-500 hover:text-brand-azure transition-colors capitalize">
              {href.replace('#', '')}
            </a>
          ))}
        </div>

        <Link to="/auth">
          <button className="btn-primary text-sm py-2 px-5">Student Portal Login</button>
        </Link>
      </div>
    </div>
  </nav>
);

const subjects = [
  { name: 'Organic Chemistry',   icon: '🧪', desc: 'Mechanisms, synthesis & stereochemistry', code: 'CHEM201' },
  { name: 'Physical Chemistry',  icon: '⚗️', desc: 'Thermodynamics, kinetics & quantum', code: 'CHEM202' },
  { name: 'Analytical Chemistry',icon: '🔬', desc: 'Titration, spectroscopy & chromatography', code: 'CHEM203' },
  { name: 'Inorganic Chemistry', icon: '🧲', desc: 'Coordination & transition metals', code: 'CHEM204' },
  { name: 'Biochemistry',        icon: '🧬', desc: 'Proteins, metabolism & molecular biology', code: 'CHEM301' },
  { name: 'Thermodynamics',      icon: '🔥', desc: 'Laws, equilibrium & Gibbs energy', code: 'CHEM205' },
];

const testimonials = [
  { name: 'Kagiso D.', course: 'CHEM201 – Organic Chemistry',
    text: 'Dr. Mokoena\'s study notes and past papers helped me go from failing to a distinction. The step-by-step mechanism guides are world-class.' },
  { name: 'Naledi M.', course: 'CHEM202 – Physical Chemistry',
    text: 'The portal is beautifully organised. Accessing notes and past papers from my phone at any time completely changed my preparation strategy.' },
  { name: 'Tebogo N.', course: 'CHEM203 – Analytical Chemistry',
    text: 'Best tutoring investment I\'ve made. The worked titration examples and lab report templates were exactly what I needed to score high.' },
];

const pricingFeatures = [
  'Access to all enrolled module notes',
  'Past examination papers (2018–2023)',
  'Lab report templates & guides',
  'Personalised student dashboard',
  'Progress tracking & analytics',
  'Direct tutor announcements',
  'PDF viewer & download access',
  'Enrolment in up to 3 modules',
];

const HomePage = () => (
  <div className="min-h-screen" style={{ background: '#F7F8FC' }}>
    <PublicNav />

    {/* ── HERO ─────────────────────────────────────────── */}
    <section style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C2E 55%, #003D6B 100%)' }}
      className="text-white py-28 px-4 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0077C8 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-7 border border-brand-gold/30"
              style={{ background: 'rgba(201,168,76,0.12)', color: '#E8C96A' }}>
              <Sparkles className="w-4 h-4" />
              Enrollments Open for 2026
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              Master Your{' '}
              <span className="text-gradient-azure">Chemistry</span>{' '}
              Studies
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
              Comprehensive undergraduate chemistry tutoring with curated study notes,
              past examination papers, and personalised learning support — built for students who refuse to settle for average.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link to="/auth">
                <button className="flex items-center gap-2 font-bold px-7 py-3.5 rounded-2xl text-white transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)', boxShadow: '0 8px 30px rgba(0,119,200,0.4)' }}>
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#services">
                <button className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-2xl text-white border border-white/20 hover:bg-white/10 transition-all">
                  Learn More
                </button>
              </a>
            </div>

            <div className="flex items-center gap-10 pt-8 border-t border-white/10">
              {[['24+', 'Students Enrolled'], ['6', 'Modules Available'], ['87+', 'Resources']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-3xl font-display font-bold text-white">{n}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Module preview card */}
          <div className="hidden lg:block">
            <div className="rounded-3xl p-1 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-amber-400 rounded-full" />
                  <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  <span className="text-gray-500 text-xs ml-2 font-mono">student-portal.tsx</span>
                </div>
                <div className="space-y-2.5">
                  {subjects.slice(0, 5).map((s) => (
                    <div key={s.name}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5 transition-all hover:border-brand-azure/30"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-xl flex-shrink-0">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{s.name}</p>
                        <p className="text-gray-500 text-xs font-mono">{s.code}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── SUBJECTS ──────────────────────────────────────── */}
    <section id="services" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-azure text-sm font-bold uppercase tracking-widest mb-3">What We Teach</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Subjects We Cover</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Comprehensive coverage of all major undergraduate chemistry disciplines with carefully curated resources.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <div key={s.name}
              className="card p-6 hover:shadow-card-hover transition-all duration-300 group cursor-pointer border-t-4"
              style={{ borderTopColor: '#0077C8' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: 'linear-gradient(135deg, #E8F4FF, #D0E9FF)' }}>
                {s.icon}
              </div>
              <p className="text-xs font-bold text-brand-azure uppercase tracking-widest mb-1 font-mono">{s.code}</p>
              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-azure transition-colors">{s.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-2 mt-5 text-brand-azure text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Notes & Past Papers Available
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS ─────────────────────────────────── */}
    <section id="about" className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-azure text-sm font-bold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">How Med Academy Works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step:'01', title:'Register',        desc:'Create your account and select your chemistry subjects of interest.' },
            { step:'02', title:'Get Approved',    desc:'Your tutor reviews and activates your account within 1–2 days.' },
            { step:'03', title:'Access Resources',desc:'Download notes, past papers, lab reports, and study guides instantly.' },
            { step:'04', title:'Track Progress',  desc:'Monitor your engagement on your personalised student dashboard.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl text-white font-display font-bold text-xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)', boxShadow: '0 6px 20px rgba(0,119,200,0.3)' }}>
                {item.step}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── PRICING ──────────────────────────────────────── */}
    <section id="pricing" className="py-24 px-4"
      style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C2E 100%)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-3">Transparent Pricing</p>
        <h2 className="font-display text-4xl font-bold text-white mb-4">Simple, Affordable Tutoring</h2>
        <p className="text-gray-400 text-lg mb-14 max-w-xl mx-auto">
          One clear monthly fee. No hidden costs, no surprises. Payment is arranged directly with your tutor.
        </p>

        <div className="relative max-w-md mx-auto">
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
            style={{ background: 'linear-gradient(135deg, #0077C8, #C9A84C)' }} />

          <div className="relative rounded-3xl p-8 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-6 border border-brand-gold/40"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#E8C96A' }}>
              <Sparkles className="w-4 h-4" /> Most Popular
            </div>

            <div className="mb-6">
              <div className="flex items-end justify-center gap-2 mb-2">
                <span className="text-gray-400 text-lg font-semibold">BWP</span>
                <span className="font-display text-7xl font-bold text-white leading-none">200</span>
                <span className="text-gray-400 text-lg mb-2">/month</span>
              </div>
              <p className="text-gray-400 text-sm">per student · billed monthly</p>
            </div>

            <ul className="space-y-3 mb-8 text-left">
              {pricingFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,119,200,0.2)' }}>
                    <CheckCircle className="w-3.5 h-3.5 text-brand-azure" />
                  </div>
                  <span className="text-gray-300 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth">
              <button className="w-full font-bold py-4 rounded-2xl text-white transition-all duration-200 hover:scale-105 text-base"
                style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)', boxShadow: '0 8px 30px rgba(0,119,200,0.4)' }}>
                Enrol Now — It's P200/month
              </button>
            </Link>

            <p className="text-gray-500 text-xs mt-4">
              💳 Payment arranged directly with your tutor. Not processed through this site.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── TESTIMONIALS ─────────────────────────────────── */}
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-azure text-sm font-bold uppercase tracking-widest mb-3">Student Reviews</p>
          <h2 className="font-display text-4xl font-bold text-gray-900">What Students Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-azure to-brand-azure-mid" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.course}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CONTACT ──────────────────────────────────────── */}
    <section id="contact" className="py-24 px-4" style={{ background: '#F7F8FC' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-brand-azure text-sm font-bold uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Have Questions?</h2>
          <p className="text-gray-500">We're happy to help you get started.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-14">
          <div className="space-y-6">
            {[
              { icon: Mail,    label: 'Email',    value: 'tutor@medacademy.com' },
              { icon: Phone,   label: 'Phone',    value: '+267 72 000 001' },
              { icon: MapPin,  label: 'Location', value: 'Gaborone, Botswana' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #E8F4FF, #D0E9FF)' }}>
                  <item.icon className="w-5 h-5 text-brand-azure" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-gray-900 font-semibold mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Name</label><input type="text" placeholder="Your name" className="input-field" /></div>
              <div><label className="label">Email</label><input type="email" placeholder="your@email.com" className="input-field" /></div>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea rows={4} placeholder="Your message..." className="input-field resize-none" />
            </div>
            <button className="btn-primary w-full py-3.5">
              Send Message <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* ── FOOTER ───────────────────────────────────────── */}
    <footer style={{ background: '#0A0A0A' }} className="text-gray-500 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0077C8, #3B99E0)' }}>
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <p className="text-white font-bold text-sm">Med Academy</p>
        </div>
        <p className="text-sm">© 2026 Med Academy. All rights reserved.</p>
        <Link to="/auth">
          <button className="btn-primary text-sm py-2 px-4">Student Portal</button>
        </Link>
      </div>
    </footer>
  </div>
);

export default HomePage;
