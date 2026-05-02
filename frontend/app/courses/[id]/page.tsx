'use client';
import { useState, useEffect, use } from 'react';
import { Star, Clock, Users, PlayCircle, FileText, CheckCircle, ChevronRight, Lock, Award, Play } from 'lucide-react';
import DashboardLayout from '../../dashboard/layout';

import { apiFetch } from '../../../lib/api';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiFetch(`/courses/${resolvedParams.id}/`);
        setCourse(data);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (resolvedParams.id) {
      fetchCourse();
    }
  }, [resolvedParams.id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await apiFetch('/enrollments/', {
        method: 'POST',
        body: JSON.stringify({ course_id: course.id })
      });
    } catch (err: any) {
      console.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading course details...</div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div style={{ padding: '3rem', color: '#ef4444' }}>Course not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ paddingBottom: '3rem' }}>
        {/* Header Section */}
        <div style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg,rgba(99,102,241,0.2) 0%,rgba(17,17,40,1) 100%)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '3rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {/* Left Info */}
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>🎯 {course.match} Match</span>
                <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>{course.level}</span>
              </div>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.2, marginBottom: '1rem' }}>{course.title}</h1>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 700 }}>{course.description}</p>
              <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Star size={16} fill="#f59e0b" color="#f59e0b" /> <strong style={{ color: '#f1f5f9' }}>{course.rating.toFixed(1)}</strong> ({course.review_count.toLocaleString()} reviews)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16} /> {course.student_count.toLocaleString()} students</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {course.duration_hours}h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{course.instructor?.[0] || 'I'}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Instructor</div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{course.instructor}</div>
                </div>
              </div>
            </div>

            {/* Right Card / Video Preview */}
            <div style={{ width: 340, flexShrink: 0 }}>
              <div className="card" style={{ padding: '0.5rem', background: 'rgba(17,17,40,0.8)' }}>
                <div style={{ height: 180, borderRadius: '0.75rem', backgroundImage: `url(${course.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                       <Play size={28} color="white" fill="white" style={{ marginLeft: 4 }} />
                     </div>
                   </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Outfit,sans-serif', marginBottom: '1.25rem' }}>{course.is_free ? 'Free' : `$${course.price}`}</div>
                  {course.is_external ? (
                    <button 
                      onClick={async () => {
                        await handleEnroll();
                        window.open(course.external_url, '_blank');
                      }} 
                      disabled={enrolling}
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginBottom: '1rem', opacity: enrolling ? 0.7 : 1 }}
                    >
                      {enrolling ? 'Enrolling...' : `Start on ${course.provider || 'YouTube'}`}
                    </button>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrolling} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginBottom: '1rem', opacity: enrolling ? 0.7 : 1 }}>{enrolling ? 'Enrolling...' : 'Enroll Now'}</button>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>{course.is_external ? `Free online course via ${course.provider}` : '30-Day Money-Back Guarantee'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          {/* Main Info */}
          <div>
            {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f1f5f9', marginBottom: '1.25rem' }}>What you'll learn</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {course.what_you_will_learn.map((item: string) => (
                    <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.modules && course.modules.length > 0 && (
              <div className="card">
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f1f5f9', marginBottom: '1.25rem' }}>Course Content</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <span>{course.modules.length} modules • {course.duration_hours}h total length</span>
                  <span style={{ color: '#818cf8', cursor: 'pointer' }}>Expand all modules</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {course.modules.map((mod: any, i: number) => (
                    <div key={mod.title} style={{ border: '1px solid var(--border)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                      <div onClick={() => setOpenModule(openModule === i ? null : i)} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <ChevronRight size={18} color="var(--text-muted)" style={{ transform: openModule === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                          <h3 style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '1rem' }}>{mod.title}</h3>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{mod.lessons?.length || 0} lessons</span>
                      </div>
                      {openModule === i && mod.lessons && (
                        <div style={{ padding: '0 1.25rem 1.25rem' }}>
                          {mod.lessons.map((l: any) => (
                            <div key={l.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <PlayCircle size={16} color={'#64748b'} />
                                <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>{l.title}</span>
                              </div>
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.duration_minutes}m</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="card">
                <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1.25rem' }}>Included in this course</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[{ icon: PlayCircle, t: '32 hours on-demand video' }, { icon: FileText, t: '15 articles & notes' }, { icon: CheckCircle, t: '4 Skill assessments' }, { icon: Award, t: 'Certificate of completion' }].map(inc => (
                    <div key={inc.t} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <inc.icon size={16} color="#818cf8" /> {inc.t}
                    </div>
                  ))}
                </div>
             </div>

             <div className="card" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <h3 style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.75rem' }}>AI Insights</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>Based on your recent assessment, this course directly addresses your gap in <strong>React Hooks</strong> and <strong>State Management</strong>.</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {course.skills?.map((s: any) => <span key={s.name} className="badge badge-success" style={{ fontSize: '0.7rem' }}>{s.name}</span>)}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
