"use client";
import { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardLayout from '../dashboard/layout';
import { TrendingUp, Clock, CheckCircle, Target, Award } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null); //stores the backend data usually null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await apiFetch('/dashboard/');
        setData(stats);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardLayout><div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading Analytics...</div></DashboardLayout>;
  if (!data) return <DashboardLayout><div style={{ padding: '3rem', color: '#ef4444' }}>Failed to load data.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Performance Analytics</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Detailed insights into your learning performance and progress.</p>
        </div>

        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Avg. Progress', value: `${data.avg_progress}%`, icon: Target, color: '#6366f1', change: '+2%' },
            { label: 'Study Hours', value: `${data.total_hours}h`, icon: Clock, color: '#06b6d4', change: '+5h' },
            { label: 'Courses Done', value: `${data.courses_completed}/${data.courses_enrolled}`, icon: CheckCircle, color: '#10b981', change: '100%' },
            { label: 'Current Streak', value: `${data.learning_streak} days`, icon: Award, color: '#f59e0b', change: '🔥' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={19} color={s.color} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: 99 }}>{s.change}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Weekly Activity */}
          <div className="card">
            <h2 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem' }}>Weekly Study Hours</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weekly_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="week" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Radar */}
          <div className="card">
            <h2 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem' }}>Skill Proficiency Radar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={data.radar_data}>
                <PolarGrid stroke="rgba(99,102,241,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1.25rem' }}>Course Performance</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Course', 'Progress', 'Quiz Score', 'Time Spent', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.course_performance.map((c: any, i: number) => (
                  <tr key={c.course} style={{ borderBottom: i < data.course_performance.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{c.course}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-bar" style={{ width: 100 }}><div className="progress-fill" style={{ width: `${c.score}%` }} /></div>
                        <span style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>{c.score}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: (typeof c.quiz === 'string' && c.quiz.includes('%') && parseInt(c.quiz) >= 80) ? '#34d399' : '#fbbf24', fontWeight: 700 }}>{c.quiz}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.timeSpent}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${c.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
