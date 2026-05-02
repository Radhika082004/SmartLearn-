'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { Search, Filter, Star, Clock, Users, BookOpen, ChevronRight, SlidersHorizontal, Zap } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';

const categories = ['All', 'Web Development', 'Data Science', 'AI/ML', 'DevOps', 'Mobile', 'Design', 'Cloud'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

function CoursesContent() {
  const searchParams = useSearchParams();
  const initSearch = searchParams.get('search') || '';
  const initRecommend = searchParams.get('recommend') === 'true';

  const [search, setSearch] = useState(initSearch);
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommended, setShowRecommended] = useState<boolean>(searchParams.has('recommend') ? initRecommend : true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showRecommended) params.append('recommend', 'true');
      if (category !== 'All') params.append('category', category);
      if (level !== 'All Levels') params.append('level', level.toLowerCase());
      if (initSearch) params.append('search', initSearch);
      
      const data = await apiFetch(`/courses/?${params.toString()}`);
      setCourses(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, level, showRecommended]);

  const filtered = courses.filter((c: any) => {
    const titleMatch = c.title?.toLowerCase().includes(search.toLowerCase());
    const tagsMatch = c.skills?.some((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));
    return titleMatch || tagsMatch;
  });

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Browse Courses</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>AI-curated courses matched to your skill profile</p>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '0.35rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
            <button onClick={() => setShowRecommended(true)} style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', background: showRecommended ? 'var(--primary)' : 'transparent', color: showRecommended ? 'white' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Recommended</button>
            <button onClick={() => setShowRecommended(false)} style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none', background: !showRecommended ? 'var(--primary)' : 'transparent', color: !showRecommended ? 'white' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>All Courses</button>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" style={{ paddingLeft: '2.25rem' }} placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field" style={{ width: 180 }} value={level} onChange={e => setLevel(e.target.value)}>
              {levels.map(l => <option key={l} value={l} style={{ background: '#111128' }}>{l}</option>)}
            </select>
          </div>
          {/* Category chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: '0.35rem 0.9rem', borderRadius: 99, border: `1px solid ${category === c ? 'var(--primary)' : 'var(--border)'}`, background: category === c ? 'rgba(99,102,241,0.15)' : 'transparent', color: category === c ? '#818cf8' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s' }}>{c}</button>
            ))}
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{loading ? 'Loading courses...' : `${filtered.length} courses found`}</p>

        {/* Course Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
          {!loading && filtered.map((c: any, index: number) => {
            const isTopMatch = showRecommended && index < 3 && c.ai_match_score > 85;
            return (
              <Link href={`/courses/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', padding: '1.25rem', height: '100%', position: 'relative', border: isTopMatch ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border)', background: isTopMatch ? 'rgba(99,102,241,0.03)' : 'var(--card-bg)' }}>
                  {isTopMatch && (
                    <div style={{ position: 'absolute', top: -12, left: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(99,102,241,0.4)', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Zap size={10} fill="white" /> TOP MATCH
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, backgroundImage: c.thumbnail_url ? `url(${c.thumbnail_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>{!c.thumbnail_url && '📚'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      {c.ai_match_score && <span className="badge badge-success" style={{ fontSize: '0.72rem', background: c.ai_match_score > 90 ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.1)' }}>🎯 {c.ai_match_score}% Match</span>}
                      <span style={{ fontWeight: 700, color: c.is_free ? '#34d399' : '#f1f5f9', fontSize: '0.9rem' }}>{c.is_free ? 'Free' : `$${c.price}`}</span>
                    </div>
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{c.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', minHeight: '2rem' }}>
                    {c.skills?.slice(0, 3).map((s: any) => <span key={s.name} className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>{s.name}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Star size={12} fill="#f59e0b" color="#f59e0b" />{c.rating} ({c.review_count?.toLocaleString()})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} />{c.duration_hours}h</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} />{(c.student_count || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${c.level === 'beginner' ? 'badge-success' : c.level === 'intermediate' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>{c.level}</span>
                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>View <ChevronRight size={14} /></button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<DashboardLayout><div>Loading...</div></DashboardLayout>}>
      <CoursesContent />
    </Suspense>
  );
}
