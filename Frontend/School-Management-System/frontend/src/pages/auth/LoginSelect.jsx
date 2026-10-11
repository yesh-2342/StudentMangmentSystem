import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Users, Shield, ArrowRight } from 'lucide-react';

const roles = [
  {
    id: 'student',
    title: 'Student Login',
    badge: 'Student Portal',
    description: 'Access academic progress, grades, attendance, assessments, and learning resources.',
    icon: GraduationCap,
    accentColor: '#1d546c',
    bgGradient: 'linear-gradient(135deg, rgba(29, 84, 108, 0.08) 0%, rgba(29, 84, 108, 0.02) 100%)',
    borderColor: 'rgba(29, 84, 108, 0.25)',
    buttonText: 'Continue as Student',
    path: '/login/student',
  },
  {
    id: 'teacher',
    title: 'Teacher/Faculty Login',
    badge: 'Faculty Portal',
    description: 'Manage assigned classes, academic performance, assessments, attendance, and consultations.',
    icon: Users,
    accentColor: '#0f766e',
    bgGradient: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(15, 118, 110, 0.02) 100%)',
    borderColor: 'rgba(15, 118, 110, 0.25)',
    buttonText: 'Continue as Teacher',
    path: '/login/teacher',
  },
  {
    id: 'admin',
    title: 'Administrator Login',
    badge: 'Institutional Admin',
    description: 'Access institutional administration, academic oversight, governance, and reports.',
    icon: Shield,
    accentColor: '#4338ca',
    bgGradient: 'linear-gradient(135deg, rgba(67, 56, 202, 0.08) 0%, rgba(67, 56, 202, 0.02) 100%)',
    borderColor: 'rgba(67, 56, 202, 0.25)',
    buttonText: 'Continue as Admin',
    path: '/login/admin',
  },
];

const LoginSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1080px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary)', color: '#ffffff', marginBottom: '1rem', boxShadow: '0 8px 16px rgba(29, 84, 108, 0.2)' }}>
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            DAPMIAS Academic Portal
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.5 }}>
            Digital Academic Performance Monitoring & Institutional Analytics System (Project 577). Select your role to sign in to your authorized portal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className="role-selection-card"
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  border: `1.5px solid ${r.borderColor}`,
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => navigate(r.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = r.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = r.borderColor;
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: r.bgGradient, color: r.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${r.borderColor}` }}>
                      <Icon size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '999px', background: r.bgGradient, color: r.accentColor, border: `1px solid ${r.borderColor}` }}>
                      {r.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {r.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {r.description}
                  </p>
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: r.accentColor,
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(r.path);
                  }}
                >
                  {r.buttonText} <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Need a student account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginSelect;
