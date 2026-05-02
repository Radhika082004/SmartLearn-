'use client';
import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Award, Clock, Zap, ChevronRight, Play, Star, CheckCircle, Target } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../../lib/api';

const progressData = [
  { week: 'W1', hours: 4 }, { week: 'W2', hours: 7 }, { week: 'W3', hours: 5 },
  { week: 'W4', hours: 9 }, { week: 'W5', hours: 12 }, { week: 'W6', hours: 10 },
  { week: 'W7', hours: 14 }, { week: 'W8', hours: 18 },
];



const recommendations = [
  { title: 'TypeScript Mastery', category: 'Web Dev', match: '98%', level: 'Intermediate', icon: '🔷' },
  { title: 'Docker & Kubernetes', category: 'DevOps', match: '95%', level: 'Beginner', icon: '🐳' },
  { title: 'System Design', category: 'Architecture', match: '91%', level: 'Advanced', icon: '🏗️' },
];

const statCards = [
  { label: 'Courses Enrolled', value: '12', icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { label: 'Hours Learned', value: '89', icon: Clock, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { label: 'Skills Gained', value: '24', icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { label: 'Certificates', value: '3', icon: Award, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    user_name: 'Student',
    career_goal: 'Growth',
    courses_enrolled: 0,
    courses_completed: 0,
    avg_progress: 0,
    skills_gained: 0,
    certifications_count: 0,
    assessments_taken: 0,
    learning_streak: 7,
    total_hours: 0,
    weekly_data: [],
    skill_gaps: [],
    recommendations: []
  });
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, coursesData] = await Promise.all([
          apiFetch('/dashboard/'),
          apiFetch('/enrollments/')
        ]);
        setStats(prev => ({ ...prev, ...statsData }));
        setEnrolledCourses(Array.isArray(coursesData) ? coursesData : (coursesData.results || []));
      } catch (err: any) {
        if (!err.message?.includes('401')) {
          console.error('Failed to load dashboard data:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
          Welcome back, <span className="gradient-text">{stats.user_name}!</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>You&apos;re on a {stats.learning_streak}-day streak! Keep going to reach your {stats.career_goal} goal.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Courses Enrolled', value: stats.courses_enrolled, icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Hours Learned', value: stats.total_hours, icon: Clock, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { label: 'Skills Gained', value: stats.skills_gained, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Certificates', value: stats.certifications_count, icon: Award, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Learning Activity Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>Learning Activity</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hours learned per week</p>
            </div>

          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.weekly_data || []}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Skill Analysis */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>Skill Analysis</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>AI-identified skill gaps</p>
          {(stats.skill_gaps || []).map((s: any) => (
            <div key={s.skill} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>{s.skill}</span>
                <span style={{ fontSize: '0.8rem', color: s.color, fontWeight: 600 }}>{s.level}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${s.level}%`, background: `linear-gradient(90deg,${s.color},${s.color}bb)` }} />
              </div>
            </div>
          ))}
          <Link href="/assessment" className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <Target size={14} /> Take Full Assessment
          </Link>
        </div>
      </div>

      {/* Enrolled Courses + AI Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
        {/* Enrolled Courses */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, color: '#f1f5f9' }}>Continue Learning</h2>
            <Link href="/courses" style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View all <ChevronRight size={14} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrolledCourses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No courses enrolled yet.</p>
            ) : enrolledCourses.map((e: any) => {
              const c = e.course;
              return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
                  {c.thumbnail_url?.startsWith('http') ? (
                    <img src={c.thumbnail_url} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    c.thumbnail_url || '📚'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary" style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem' }}>{c.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star size={10} fill="#f59e0b" color="#f59e0b" />{c.rating}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${e.progress}%` }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, flexShrink: 0 }}>{e.progress}%</span>
                  </div>
                </div>
                <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Play size={14} color="#818cf8" fill="#818cf8" />
                </button>
              </div>
            )})}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Zap size={16} color="#818cf8" />
            <h2 style={{ fontWeight: 700, color: '#f1f5f9' }}>AI Recommendations</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(stats.recommendations || []).map((r: any) => (
              <div key={r.title} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{r.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{r.category} · {r.level}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}><CheckCircle size={10} /> {r.match} Match</span>
                  <button onClick={() => window.open(r.external_url, '_blank')} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
