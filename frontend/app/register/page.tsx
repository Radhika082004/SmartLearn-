'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, Eye, EyeOff, User, ChevronRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthBackground from '../../components/AuthBackground';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const goals = ['Web Development', 'Data Science', 'Machine Learning', 'DevOps', 'Mobile Dev', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', goal: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: form.email.split('@')[0], // Generate username from email
          email: form.email, 
          password: form.password,
          first_name: form.name.split(' ')[0],
          last_name: form.name.split(' ').slice(1).join(' '),
          career_goal: form.goal
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.errors ? JSON.stringify(data.errors) : 'Registration failed');
      
      localStorage.setItem('access', data.tokens.access);
      localStorage.setItem('refresh', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <AuthBackground />

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        <motion.div variants={fadeUpVariant} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={24} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f1f5f9' }}>Smart<span style={{ color: '#818cf8' }}>Learn</span></span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Create your account and start your AI-powered learning journey.</p>
        </motion.div>

        {/* Step indicator */}
        <motion.div variants={fadeUpVariant} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.15)', border: step >= s ? 'none' : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: step >= s ? 'white' : 'var(--text-muted)', transition: 'all 0.3s' }}>{s}</div>
              {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s' }} />}
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUpVariant} className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem' }}>
          {step === 1 ? (
            <>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.75rem', color: '#f1f5f9' }}>Personal Details</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="name" type="text" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="reg-email" type="email" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="reg-password" type={showPass ? 'text' : 'password'} className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="Create a strong password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button id="next-step-btn" type="button" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }} onClick={() => setStep(2)}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>Career Goals</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select your primary learning goal to get personalized recommendations.</p>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {goals.map(g => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, goal: g })} style={{ padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${form.goal === g ? 'var(--primary)' : 'var(--border)'}`, background: form.goal === g ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: form.goal === g ? '#818cf8' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', textAlign: 'center' }}>
                      {g}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>Back</button>
                  <button id="register-btn" type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.85rem', opacity: loading ? 0.7 : 1 }} disabled={loading}>
                    {loading ? 'Creating account...' : <><Briefcase size={16} /> Create Account</>}
                  </button>
                </div>
              </form>
            </>
          )}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
