'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChevronRight, Brain, AlertCircle, Trophy } from 'lucide-react';
import DashboardLayout from '../dashboard/layout';
import { apiFetch } from '../../lib/api';
import Link from 'next/link'; //Used for navigation (without page reload)
//List of domains you can choose:
const assessmentTypes = [
  { id: 'web', label: 'Web Development', icon: '🌐', desc: 'HTML, CSS, JavaScript, React' },
  { id: 'ds', label: 'Data Science', icon: '📊', desc: 'Python, Pandas, ML basics' },
  { id: 'ai', label: 'AI/ML', icon: '🤖', desc: 'Neural Networks, Scikit-learn' },
  { id: 'devops', label: 'DevOps', icon: '⚙️', desc: 'Docker, CI/CD, Cloud' },
  { id: 'dsa', label: 'DSA & Algorithms', icon: '🧮', desc: 'Arrays, Trees, Sorting' },
];

export default function AssessmentPage() {
  const [phase, setPhase] = useState<'select' | 'quiz' | 'result'>('select');
  const [selectedType, setSelectedType] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins for 20 questions
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [backendResult, setBackendResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<{correct_skills: string[], gap_skills: string[]}>({ correct_skills: [], gap_skills: [] });

  useEffect(() => {
    let timer: any;
    if (phase === 'quiz' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startAssessment = async () => {
    if (!selectedType) return;
    setLoadingQuestions(true);
    try {
      const data = await apiFetch(`/assessments/?domain=${selectedType}`);
      setQuestions(data);
      setAnswers([]);
      setCurrent(0);
      setTimeLeft(1200);
      setPhase('quiz');
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      alert('Failed to load assessment questions. Please try again.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswer = (idx: number) => { setSelected(idx); };
  
  const handleScoreQuiz = async (finalAnswers: any[]) => {
    setSubmitting(true);
    try {
      const payload = {
        type: selectedType,
        answers: finalAnswers.map((a, i) => ({
          question_id: questions[i].id,
          selected_option: a
        }))
      };

      const response = await apiFetch('/assessments/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setBackendResult(response.result);
      setRecommendations(response.ai_recommendations);
      setAnalysis({
        correct_skills: response.correct_skills || [],
        gap_skills: response.gap_skills || []
      });
      setPhase('result');
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (current + 1 >= questions.length) { 
        handleScoreQuiz(newAnswers); 
    }
    else { setCurrent(current + 1); }
  };

  const score = backendResult?.correct_answers || 0;
  const totalQ = questions.length || 1;
  const pct = backendResult?.score || 0;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <DashboardLayout>
      {phase === 'select' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Skill Assessment</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Take an AI-powered test to identify your strengths and skill gaps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {assessmentTypes.map(t => (
              <div key={t.id} onClick={() => setSelectedType(t.id)} className="card" style={{ cursor: 'pointer', border: `1px solid ${selectedType === t.id ? 'var(--primary)' : 'var(--border)'}`, background: selectedType === t.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)', textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{t.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.4rem' }}>{t.label}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.desc}</p>
                {selectedType === t.id && <div style={{ marginTop: '0.75rem' }}><CheckCircle size={20} color="#10b981" style={{ margin: '0 auto' }} /></div>}
              </div>
            ))}
          </div>
          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(99,102,241,0.06)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[{ icon: '❓', label: '20 Questions' }, { icon: '⏱️', label: '20 Minutes' }, { icon: '🎯', label: 'AI Scored' }, { icon: '📋', label: 'Instant Report' }].map(i => (
                <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>{i.icon}</span> {i.label}
                </div>
              ))}
            </div>
          </div>
          <button id="start-assessment-btn" className="btn-primary" style={{ padding: '0.85rem 2rem' }} onClick={startAssessment} disabled={!selectedType || loadingQuestions}>
            {loadingQuestions ? 'Loading Questions...' : 'Start Assessment'} <ChevronRight size={18} />
          </button>
        </div>
      )}

      {phase === 'quiz' && questions.length > 0 && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Skill Assessment</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Question {current + 1} of {questions.length}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '0.5rem 1rem', borderRadius: '0.75rem' }}>
              <Clock size={16} color="#fbbf24" />
              <span style={{ color: '#fbbf24', fontWeight: 600, fontFamily: 'monospace' }}>{mins}:{secs}</span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: '2rem', height: 8 }}>
            <div className="progress-fill" style={{ width: `${((current) / questions.length) * 100}%` }} />
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{selectedType}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>{questions[current].difficulty}</span>
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#f1f5f9', marginBottom: '1.75rem', lineHeight: 1.5 }}>{questions[current].question_text}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {[questions[current].option_a, questions[current].option_b, questions[current].option_c, questions[current].option_d].map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)} style={{ padding: '1rem 1.25rem', borderRadius: '0.75rem', border: `1px solid ${selected === i ? 'var(--primary)' : 'var(--border)'}`, background: selected === i ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: selected === i ? '#818cf8' : '#cbd5e1', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', fontWeight: selected === i ? 600 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${selected === i ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: selected === i ? '#818cf8' : 'var(--text-muted)', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button id="next-question-btn" className="btn-primary" onClick={handleNext} disabled={selected === null || submitting} style={{ opacity: (selected === null || submitting) ? 0.5 : 1 }}>
                {submitting ? 'Submitting...' : (current + 1 === questions.length ? 'Submit' : 'Next')} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: pct >= 60 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `3px solid ${pct >= 60 ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              {pct >= 60 ? <Trophy size={36} color="#10b981" /> : <AlertCircle size={36} color="#ef4444" />}
            </div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>Assessment Complete!</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your AI skill analysis is ready</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171', marginBottom: '0.5rem' }}>{pct}%</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You answered {score} out of {totalQ} correctly</div>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              {[{ label: 'Correct', value: score, color: '#10b981' }, { label: 'Incorrect', value: totalQ - score, color: '#ef4444' }, { label: 'Accuracy', value: `${pct}%`, color: '#818cf8' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Outfit,sans-serif' }}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card">
                <h3 style={{ fontWeight: 700, color: '#34d399', marginBottom: '1rem', fontSize: '1rem' }}>Key Strengths</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {analysis.correct_skills.length > 0 ? analysis.correct_skills.map(s => (
                        <span key={s} className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>{s}</span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Identify strengths by answering correctly</span>}
                </div>
            </div>
            <div className="card">
                <h3 style={{ fontWeight: 700, color: '#f87171', marginBottom: '1rem', fontSize: '1rem' }}>Skill Gaps</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {analysis.gap_skills.length > 0 ? analysis.gap_skills.map(s => (
                        <span key={s} className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>{s}</span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No significant gaps identified!</span>}
                </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>AI Recommendations</h3>
            {recommendations.length > 0 ? recommendations.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(99,102,241,0.06)', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{r.type === 'course' ? '📚' : '📜'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9' }}>{r.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.reason}</div>
                  </div>
                </div>
                {r.type === 'course' && <Link href={`/courses?search=${encodeURIComponent(r.title.replace('Improve ', ''))}&recommend=true`} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', textDecoration: 'none' }}>Enroll Now</Link>}
              </div>
            )) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recommendations yet. Great job!</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button id="retake-assessment-btn" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setPhase('select'); setCurrent(0); setAnswers([]); setSelected(null); setTimeLeft(1200); }}>Retake</button>
            <Link href="/learning-path" className="btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>View My Path <ChevronRight size={16} /></Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
