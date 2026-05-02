"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, Target, Clock, BookOpen, Zap, Lock } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';
import { apiFetch } from '../../lib/api';
import Link from 'next/link';

const paths = [
  {
    title: 'Full Stack Web Developer',
    match: '98%',
    duration: '6 months',
    icon: '🌐',
    currentPhase: 1,
    phases: [
      {
        title: 'Frontend Foundations', status: 'completed', courses: [
          { name: 'HTML & CSS Mastery', done: true }, { name: 'JavaScript Essentials', done: true }, { name: 'Responsive Web Design', done: true },
        ]
      },
      {
        title: 'React & Modern JS', status: 'active', courses: [
          { name: 'React.js – Complete Guide', done: false }, { name: 'TypeScript Fundamentals', done: false }, { name: 'State Management (Redux)', done: false },
        ]
      },
      {
        title: 'Backend Development', status: 'locked', courses: [
          { name: 'Node.js & Express APIs', done: false }, { name: 'MongoDB & Mongoose', done: false }, { name: 'REST & GraphQL APIs', done: false },
        ]
      },
      {
        title: 'DevOps & Deployment', status: 'locked', courses: [
          { name: 'Docker Fundamentals', done: false }, { name: 'CI/CD Pipelines', done: false }, { name: 'AWS Deployment', done: false },
        ]
      },
    ]
  }
];

export default function LearningPathPage() {
  const [activePath, setActivePath] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const data = await apiFetch('/learning-path/');
        const results = Array.isArray(data) ? data : (data.results || []);
        if (results && results.length > 0) {
          setActivePath(results[0]);
        }
      } catch (err) {
        console.error('Failed to fetch path:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, []);

  if (loading) return <DashboardLayout><div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading Learning Path...</div></DashboardLayout>;
  
  if (!activePath) {
      return (
          <DashboardLayout>
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <h2 style={{ color: '#f1f5f9' }}>No Active Learning Path</h2>
                  <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Update your career goal in your profile to generate a path.</p>
                  <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Profile</Link>
              </div>
          </DashboardLayout>
      );
  }

  // Grouping courses by category to simulate phases
  const categories = Array.from(new Set((activePath.courses || []).map((c: any) => c.category)));
  const phases = categories.map((cat: any, idx: number) => ({
      title: cat,
      status: idx === 0 ? 'active' : 'locked',
      courses: activePath.courses.filter((c: any) => c.category === cat).map((c: any) => ({
          id: c.id,
          name: c.title,
          done: false
      }))
  }));

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Learning Path</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your personalized AI-curated roadmap to {activePath.title}.</p>
        </div>

        {/* Path Header */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))', borderColor: 'rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ fontSize: '3rem' }}>{'🚀'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#f1f5f9' }}>{activePath.title}</h2>
                <span className="badge badge-success">🎯 {activePath.ai_match_score || 95}% Match</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {'6 months'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} /> {activePath.courses?.length} Courses</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Target size={14} /> {phases.length} Phases</span>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall Progress</span>
                  <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>{activePath.overall_progress}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}><div className="progress-fill" style={{ width: `${activePath.overall_progress}%` }} /></div>
              </div>
            </div>
            <Link href="/courses" className="btn-primary" style={{ textDecoration: 'none' }}><Zap size={15} /> Continue Learning</Link>
          </div>
        </div>

        {/* Phases */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 31, top: 0, bottom: 0, width: 2, background: 'var(--border)', zIndex: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {phases.map((phase, pi) => (
              <div key={phase.title} style={{ display: 'flex', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                {/* Phase icon */}
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: phase.status === 'completed' ? 'rgba(16,185,129,0.15)' : phase.status === 'active' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${phase.status === 'completed' ? '#10b981' : phase.status === 'active' ? '#6366f1' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 2 }}>
                  {phase.status === 'completed' ? <CheckCircle size={24} color="#10b981" /> : phase.status === 'active' ? <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#6366f1', animation: 'pulse-glow 2s infinite' }} /> : <Lock size={20} color="var(--text-muted)" />}
                </div>
                {/* Phase content */}
                <div className="card" style={{ flex: 1, opacity: phase.status === 'locked' ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PHASE {pi + 1}</span>
                        <span className={`badge ${phase.status === 'completed' ? 'badge-success' : phase.status === 'active' ? 'badge-primary' : ''}`} style={{ fontSize: '0.7rem' }}>
                          {phase.status === 'completed' ? '✓ Completed' : phase.status === 'active' ? '▶ In Progress' : '🔒 Locked'}
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginTop: '0.25rem' }}>{phase.title}</h3>
                    </div>
                    {phase.status === 'active' && <Link href="/courses" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', textDecoration: 'none' }}>Continue <ChevronRight size={14} /></Link>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {phase.courses.map((course: any) => (
                      <Link href={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                          {course.done ? <CheckCircle size={16} color="#10b981" /> : <Circle size={16} color="var(--text-muted)" />}
                          <span style={{ fontSize: '0.875rem', color: course.done ? '#34d399' : '#94a3b8', textDecoration: course.done ? 'line-through' : 'none' }}>{course.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
