"use client";
import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, MapPin, Github, Linkedin, Edit3, Save, Camera, Award, BookOpen, Target, TrendingUp } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';
import { apiFetch } from '../../lib/api';

const RECOMMENDED_SKILLS = ['React.js', 'Node.js', 'Python', 'MongoDB', 'REST APIs', 'Git', 'JavaScript', 'CSS'];
const interests = ['Web Development', 'AI/ML', 'Open Source', 'Cloud Computing'];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ name: '', email: '', role: '', location: '', github: '', linkedin: '', bio: '', career_goal: '' });
  const [skills, setSkills] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, hours: 0, streak: 0 });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, userSkills, dashboard] = await Promise.all([
          apiFetch('/profile/'),
          apiFetch('/skills/mine/'),
          apiFetch('/dashboard/')
        ]);
        
        setForm({
          name: profile.full_name,
          email: profile.email,
          role: profile.job_role || 'Student',
          location: profile.location || 'Not set',
          github: profile.github_url || '',
          linkedin: profile.linkedin_url || '',
          bio: profile.bio || '',
          career_goal: profile.career_goal || ''
        });
        setSkills(userSkills);
        setStats({
          courses: dashboard.courses_enrolled,
          hours: dashboard.total_hours,
          streak: dashboard.learning_streak
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        job_role: form.role,
        location: form.location,
        github_url: form.github,
        linkedin_url: form.linkedin,
        bio: form.bio,
        career_goal: form.career_goal
      };
      await apiFetch('/profile/', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      setEditing(false);
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      const data = await apiFetch('/skills/mine/', {
        method: 'POST',
        body: JSON.stringify({ skill_name: newSkill, level: 'beginner' })
      });
      setSkills([...skills, data]);
      setNewSkill('');
    } catch (err: any) {
      alert('Failed to add skill: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!editing) return;
    // Note: If the backend doesn't support DELETE yet, we might need to add it.
    // Assuming backend DELETE is standard for this kind of app or we just update the set.
    // For now, let's just implement the UI side and backend integration if possible.
    // Looking at urls.py, there is no direct delete endpoint for a specific skill.
    // Let's stick to adding for now as requested.
  };

  const initials = form.name ? form.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  if (loading) return <DashboardLayout><div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading Profile...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>My Profile</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your personal information and career goals.</p>
          </div>
          <button className={editing ? 'btn-primary' : 'btn-outline'} onClick={() => editing ? handleSave() : setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Profile</>}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          {/* Left: Avatar + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: '0 auto' }}>{initials}</div>
                {editing && (
                  <button style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                    <Camera size={13} />
                  </button>
                )}
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.3rem' }}>{form.name}</h2>
              <p style={{ color: '#818cf8', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{form.role}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}><MapPin size={12} />{form.location}</p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around' }}>
                {[{ v: stats.courses, l: 'Courses' }, { v: `${stats.hours}h`, l: 'Learning' }, { v: stats.streak, l: 'Streak' }].map(s => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '1.15rem', fontFamily: 'Outfit,sans-serif' }}>{s.v}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: '1rem' }}>Achievements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[{ icon: '🔥', label: '7-Day Streak', color: '#f59e0b' }, { icon: '⚡', label: 'Fast Learner', color: '#6366f1' }, { icon: '🎯', label: 'Goal Setter', color: '#10b981' }, { icon: '📚', label: 'Bookworm', color: '#06b6d4' }].map(b => (
                  <div key={b.label} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.6rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{b.icon}</div>
                    <div style={{ fontSize: '0.72rem', color: b.color, fontWeight: 600 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Personal Info */}
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={17} color="#818cf8" /> Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Full Name', field: 'name', icon: User },
                  { label: 'Email Address', field: 'email', icon: Mail },
                  { label: 'Job Role', field: 'role', icon: Briefcase },
                  { label: 'Location', field: 'location', icon: MapPin },
                  { label: 'GitHub', field: 'github', icon: Github },
                  { label: 'LinkedIn', field: 'linkedin', icon: Linkedin },
                ].map(({ label, field, icon: Icon }) => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                    {editing ? (
                      <input className="input-field" value={form[field as keyof typeof form]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                    ) : (
                      <div style={{ padding: '0.65rem 0.75rem', fontSize: '0.9rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={14} color="var(--text-muted)" />{form[field as keyof typeof form]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</label>
                {editing ? (
                  <textarea className="input-field" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem' }}>{form.bio}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target size={17} color="#818cf8" /> Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: editing ? '1rem' : 0 }}>
                {skills.map(s => (
                  <span key={s.id} className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem', cursor: editing ? 'pointer' : 'default' }}>{s.skill_name} | {s.level} {editing && '×'}</span>
                ))}
              </div>
              {editing && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input className="input-field" placeholder="Add a skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddSkill()} style={{ flex: 1 }} />
                  <button className="btn-primary" style={{ padding: '0.6rem 1rem' }} onClick={handleAddSkill}>Add</button>
                </div>
              )}
            </div>

            {/* Career Goals & Interests */}
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={17} color="#818cf8" /> Interests & Goals</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {interests.map(i => <span key={i} className="badge badge-cyan" style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}>{i}</span>)}
              </div>
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(99,102,241,0.06)', borderRadius: '0.75rem', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Goal</div>
                {editing ? (
                  <input className="input-field" value={form.career_goal} onChange={e => setForm({ ...form, career_goal: e.target.value })} placeholder="e.g. Become a AI Engineer" />
                ) : (
                  <div style={{ fontWeight: 700, color: '#818cf8' }}>{form.career_goal || 'No goal set yet'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
