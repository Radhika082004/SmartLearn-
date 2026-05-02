'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, BookOpen, Target, BarChart3, FileText, Award, Code2, User, LogOut, Bell, Search } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/courses', icon: BookOpen, label: 'Browse Courses' },
  { href: '/learning-path', icon: Target, label: 'Learning Path' },
  { href: '/assessment', icon: Target, label: 'Skill Assessment' },
  { href: '/resume', icon: FileText, label: 'Resume Analysis' },
  { href: '/analytics', icon: BarChart3, label: 'Performance' },
  { href: '/certifications', icon: Award, label: 'Certifications' },
  { href: '/playground', icon: Code2, label: 'Code Playground' },
  { href: '/profile', icon: User, label: 'My Profile' },
];

import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

import DashboardBackground from '../../components/DashboardBackground';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetch('/profile/');
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user in layout:', err);
      }
    };
    fetchUser();
  }, []);

  const initials = user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const name = user?.full_name || 'Student';
  const role = user?.job_role || 'Learner';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      <DashboardBackground />
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9' }}>Smart<span style={{ color: '#818cf8' }}>Learn</span></span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: '1rem', overflowY: 'auto' }}>
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={`nav-item ${pathname === href ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role}</div>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('access');
              localStorage.removeItem('refresh');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="nav-item" 
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'none', marginTop: '0.25rem', color: '#ef4444' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-layout" style={{ flex: 1 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Search courses, skills..." />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.6rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-dark)' }} />
            </button>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', cursor: 'pointer' }}>{initials}</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
