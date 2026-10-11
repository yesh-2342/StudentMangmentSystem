import React, { useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Users, Shield, ArrowLeft, ArrowRight, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const roleMeta = {
  student: {
    name: 'Student',
    title: 'Student Portal Sign In',
    subtitle: 'Enter your student credentials to view your courses, grades, and academic records',
    icon: GraduationCap,
    accentColor: '#1d546c',
    expectedRole: 'STUDENT',
    defaultRedirect: '/student/dashboard',
    placeholderUser: 'e.g. test.student01 or your student ID',
  },
  teacher: {
    name: 'Teacher / Faculty',
    title: 'Faculty Portal Sign In',
    subtitle: 'Sign in to access your assigned classes, gradebooks, attendance, and consultations',
    icon: Users,
    accentColor: '#0f766e',
    expectedRole: 'TEACHER',
    defaultRedirect: '/teacher/dashboard',
    placeholderUser: 'e.g. test.teacher01 or faculty username',
  },
  admin: {
    name: 'Administrator',
    title: 'Institutional Admin Sign In',
    subtitle: 'Sign in to access system oversight, user management, and institutional analytics',
    icon: Shield,
    accentColor: '#4338ca',
    expectedRole: 'ADMIN',
    defaultRedirect: '/admin/dashboard',
    placeholderUser: 'e.g. admin',
  },
};

const RoleLoginForm = ({ roleType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { login } = useAuth();

  const activeRole = (roleType || params.role || 'student').toLowerCase();
  const meta = roleMeta[activeRole] || roleMeta.student;
  const Icon = meta.icon;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    location.search.includes('expired=true') ? 'Your session has expired. Please sign in again.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both your username and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(username, password, meta.expectedRole);
      const actualRole = user.role?.replace('ROLE_', '').toUpperCase();

      // Client-side guard verification in addition to backend check
      if (actualRole !== meta.expectedRole) {
        setError(`Access restricted: Your account has the role "${actualRole}", which cannot log in via the ${meta.name} Portal.`);
        return;
      }

      if (actualRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (actualRole === 'TEACHER') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Authentication failed. Please check your username and password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '440px', width: '100%', margin: '0 auto', background: 'var(--card-bg, #ffffff)', borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              background: 'var(--bg-main, #f8fafc)',
              border: '1px solid var(--border)',
            }}
          >
            <ArrowLeft size={14} /> Back to Role Selection
          </Link>
        </div>

        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: `${meta.accentColor}15`,
              color: meta.accentColor,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              border: `1px solid ${meta.accentColor}30`,
            }}
          >
            <Icon size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            {meta.title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {meta.subtitle}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              background: 'var(--error-light, #fee2e2)',
              color: 'var(--error, #dc2626)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              marginBottom: '1.25rem',
              border: '1px solid #fca5a5',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="username"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}
            >
              Username / Identification
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <User size={16} />
              </span>
              <input
                id="username"
                type="text"
                placeholder={meta.placeholderUser}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <Lock size={16} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.7rem 2.5rem 0.7rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--text-main)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              background: meta.accentColor,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: `0 4px 14px ${meta.accentColor}40`,
            }}
          >
            {loading ? 'Authenticating...' : `Sign In as ${meta.name}`} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {activeRole === 'student' ? (
            <>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: meta.accentColor, fontWeight: 600 }}>
                Register as Student
              </Link>
            </>
          ) : (
            <span>Need faculty/admin credentials? Contact system administration.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleLoginForm;
