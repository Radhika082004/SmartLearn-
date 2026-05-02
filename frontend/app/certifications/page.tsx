"use client";
import { useState, useEffect } from 'react';
import { Award, CheckCircle, Lock, Star, ChevronRight, ExternalLink } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';
import { apiFetch } from '../../lib/api';
import Link from 'next/link';

export default function CertificationsPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await apiFetch('/certifications/');
        setCerts(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error('Failed to fetch certifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleViewPath = () => {
    window.location.href = '/learning-path';
  };

  if (loading) return <DashboardLayout><div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading Certifications...</div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Certification Roadmap</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>AI-recommended industry certifications based on your skills and career goals.</p>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[{ label: 'Recommended', value: certs.length, color: '#6366f1' }, { label: 'In Progress', value: 0, color: '#06b6d4' }, { label: 'Completed', value: 0, color: '#10b981' }].map(s => (
            <div className="stat-card" key={s.label} style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color, fontFamily: 'Outfit,sans-serif' }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Certs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1.25rem' }}>
          {certs.map((cert: any, index: number) => {
            const isTopMatch = index < 3 && cert.ai_match_score > 85;
            return (
              <div className="card" key={cert.title} style={{ opacity: 1, position: 'relative', overflow: 'hidden', border: isTopMatch ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border)', background: isTopMatch ? 'rgba(99,102,241,0.03)' : 'var(--card-bg)' }}>
                {isTopMatch && (
                  <div style={{ position: 'absolute', top: 12, right: -30, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '0.2rem 2.5rem', transform: 'rotate(45deg)', fontSize: '0.65rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(99,102,241,0.3)', zIndex: 1 }}>
                    TOP PICK
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{'📜'}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cert.provider}</div>
                      <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>{cert.level}</div>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem', background: cert.ai_match_score > 90 ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.1)' }}>🎯 {cert.ai_match_score}% Match</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{cert.title}</h3>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', minHeight: '2rem' }}>
                  {cert.required_skills?.map((s: any) => <span key={s.name} className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', opacity: 0.9 }}>{s.name}</span>)}
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cert.description || 'Boost your career with this industry-recognized certification.'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={12} fill="#f59e0b" color="#f59e0b" /> {cert.duration_weeks} weeks</span>
                  <button className={'btn-primary'} style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem', borderRadius: '0.5rem' }} onClick={() => window.open(cert.external_url, '_blank')}>
                    View <ExternalLink size={14} style={{ marginLeft: '0.2rem' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
