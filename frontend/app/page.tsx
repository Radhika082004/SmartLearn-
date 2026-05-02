'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Brain, BookOpen, TrendingUp, Award, ChevronRight, Star, Users, Zap, Target, BarChart3, Code2, FileSearch, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const features = [
  { icon: Brain, title: 'AI Skill Analysis', desc: 'Evaluates your skills through assessments and resume analysis to identify strengths and gaps.', color: '#6366f1' },
  { icon: Target, title: 'Personalized Paths', desc: 'Custom learning paths aligned to your career goals and current skill level.', color: '#8b5cf6' },
  { icon: FileSearch, title: 'Resume Analysis', desc: 'NLP-powered resume parsing to extract skills and suggest enhancements.', color: '#06b6d4' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'Track course completion, milestones, and learning performance visually.', color: '#10b981' },
  { icon: Code2, title: 'Coding Platform', desc: 'Built-in coding environment for hands-on practice and skill improvement.', color: '#f59e0b' },
  { icon: Award, title: 'Certifications', desc: 'Industry-relevant certification recommendations based on your skill profile.', color: '#ef4444' },
];

const stats = [
  { label: 'Courses Available', value: '15,000+' },
  { label: 'Active Learners', value: '120K+' },
  { label: 'Skills Tracked', value: '500+' },
  { label: 'Completion Rate', value: '89%' },
];

const testimonials = [
  { name: 'Arjun Mehta', role: 'Full Stack Developer', text: 'SmartLearn identified my skill gaps instantly and recommended the perfect React & Node.js path. Got hired in 3 months!', rating: 5, avatar: 'AM' },
  { name: 'Priya Sharma', role: 'Data Scientist', text: 'The AI recommendations were spot-on. The resume analysis feature helped me understand exactly what skills I was missing.', rating: 5, avatar: 'PS' },
  { name: 'Rahul Gupta', role: 'DevOps Engineer', text: 'The personalized learning path saved me months of confusion. Highly recommend for anyone serious about upskilling.', rating: 5, avatar: 'RG' },
];

import AnimatedBackground from '../components/AnimatedBackground';

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUpAnim = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 60, damping: 15 } }
};

const scaleInAnim = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 50, damping: 15 } }
};

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleProtectedClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    if (token) {
      router.push(path);
    } else {
      router.push('/login');
    }
  };

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#0a0a16' }} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', overflow: 'hidden', position: 'relative' }}>
      
      <AnimatedBackground />

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar (Animated) */}
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass" 
          style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0 2rem' }}
        >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Brain size={20} color="white" />
            </motion.div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f1f5f9' }}>Smart<span style={{ color: '#818cf8' }}>Learn</span></span>
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/courses" onClick={(e) => handleProtectedClick(e, '/courses')} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s' }}>Courses</Link>
            <Link href="/dashboard" onClick={(e) => handleProtectedClick(e, '/dashboard')} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Dashboard</Link>
            <Link href="/assessment" onClick={(e) => handleProtectedClick(e, '/assessment')} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Assessment</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login" className="btn-outline" style={{ padding: '0.5rem 1.25rem' }}>Log In</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Get Started</Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Floating Background Orbs */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '10%', left: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.25),transparent)', pointerEvents: 'none', filter: 'blur(40px)' }} 
        />
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', bottom: '10%', right: '5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.2),transparent)', pointerEvents: 'none', filter: 'blur(50px)' }} 
        />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={fadeUpAnim} className="badge badge-primary glow" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <Zap size={14} className="float-anim" style={{ marginRight: '4px' }} /> AI-Powered Learning Platform
          </motion.div>
          
          <motion.h1 variants={fadeUpAnim} style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: '#f1f5f9' }}>
            Learn Smarter with <br/>
            <span className="gradient-text" style={{ display: 'inline-block' }}>AI-Driven</span> Skill Growth
          </motion.h1>
          
          <motion.p variants={fadeUpAnim} style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: 650, margin: '0 auto 2.5rem auto' }}>
            Discover your skill gaps, get personalized course recommendations, and follow AI-curated learning paths aligned to your career goals.
          </motion.p>
          
          <motion.div variants={fadeUpAnim} style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99,102,241,0.5)" }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem' }}>
                Start Learning Free <ChevronRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/assessment" onClick={(e) => handleProtectedClick(e, '/assessment')} className="glass-light" style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem', color: '#818cf8', borderRadius: '0.75rem', fontWeight: 600, display: 'inline-block', textDecoration: 'none' }}>
                Take Skill Assessment
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div variants={staggerContainer} style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '5rem', flexWrap: 'wrap' }}>
            {stats.map(s => (
              <motion.div key={s.label} variants={scaleInAnim} whileHover={{ y: -5 }} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', minWidth: 140 }}>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#818cf8' }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.h2 variants={fadeUpAnim} className="section-title" style={{ fontSize: '2.5rem' }}>Everything You Need to <span className="gradient-text">Grow</span></motion.h2>
            <motion.p variants={fadeUpAnim} style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>A complete AI-powered ecosystem for your learning journey.</motion.p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '2rem' }}>
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                variants={fadeUpAnim}
                whileHover={{ y: -8, scale: 1.03, borderColor: f.color, boxShadow: `0 15px 30px ${f.color}20` }}
                className="card glass"
                style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  background: `linear-gradient(145deg, var(--bg-card) 0%, rgba(10,10,26,0.9) 100%)`
                }}
              >
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `${f.color}15`, filter: 'blur(20px)' }} />
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: `1px solid ${f.color}40`, boxShadow: `0 0 15px ${f.color}30` }}>
                  <f.icon size={28} color={f.color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem', color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '6rem 2rem', background: 'linear-gradient(to bottom, rgba(99,102,241,0.02), rgba(139,92,246,0.05))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 className="section-title" style={{ fontSize: '2.5rem' }}>How <span className="gradient-text">SmartLearn</span> Works</h2>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '3rem' }}
          >
            {[
              { step: '01', title: 'Create Profile', desc: 'Register and set your career goals and current skill level.' },
              { step: '02', title: 'Skill Analysis', desc: 'Take assessments or upload your resume for AI skill extraction.' },
              { step: '03', title: 'Get Recommendations', desc: 'Receive personalized course and certification suggestions.' },
              { step: '04', title: 'Track Progress', desc: 'Monitor your learning journey with detailed analytics.' },
            ].map((item, i) => (
              <motion.div variants={scaleInAnim} key={item.step} style={{ textAlign: 'center', position: 'relative' }}>
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.25))', border: '2px solid rgba(139,92,246,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}
                >
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, color: '#a78bfa', fontSize: '1.4rem' }}>{item.step}</span>
                </motion.div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#f1f5f9', fontSize: '1.2rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>What Learners <span className="gradient-text">Say</span></h2>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem' }}
        >
          {testimonials.map(t => (
            <motion.div variants={fadeUpAnim} whileHover={{ y: -10 }} className="card glass-light" key={t.name} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.1 }}>
                <Star size={60} fill="currentColor" />
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem', fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white', border: '2px solid rgba(255,255,255,0.2)' }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>{t.name}</div>
                  <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 500 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem 8rem', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.6 }}
          className="glass" 
          style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem', borderRadius: '2rem', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
        >
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.25rem', color: '#f1f5f9' }}>Ready to Accelerate Your <span className="gradient-text">Career?</span></h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 2.5rem auto' }}>Join 120,000+ learners who are growing smarter with AI-powered recommendations.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '1.1rem 3rem', fontSize: '1.1rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(99,102,241,0.4)' }}>
              Start Your Journey Free <ChevronRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: '#0a0a16' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Brain size={18} color="#8b5cf6" />
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#f1f5f9' }}>SmartLearn</span>
        </div>
        © 2025 SmartLearn. AI-Powered Learning & Skill Recommendation Platform.
      </footer>
      </div> {/* End Main Content Wrapper */}
    </div>
  );
}
