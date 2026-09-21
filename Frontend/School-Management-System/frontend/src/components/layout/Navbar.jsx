import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-icon" onClick={onToggleSidebar} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.firstName || user?.username || 'User'}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {user?.username}
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
