import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const AccessDenied = () => {
  const { user } = useAuth();
  const role = user?.role?.replace('ROLE_', '').toUpperCase();
  const returnPath = role === 'ADMIN' ? '/admin/dashboard' : role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--error-light)', color: 'var(--error)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          You do not have the required permissions to view this academic portal section.
        </p>
        <Link to={returnPath}>
          <Button variant="primary" style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Return to Your Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
