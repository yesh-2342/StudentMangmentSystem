import React from 'react';
import { Shield, Server, Database, Key } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/layout/PageHeader';

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 760 }}>
      <PageHeader
        title="Administrator Profile & Security"
        subtitle="System administrative credentials, security configurations, and backend connectivity."
      />

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              System Administrator
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Username: @{user?.username || 'admin'}
            </p>
          </div>
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
            Active Root Admin
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator Name</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{user?.firstName} {user?.lastName}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Email</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{user?.email || 'admin@erp.edu'}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Level</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>ROLE_ADMIN (Full Privileges)</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authentication Mode</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>Spring Security In-Memory / MySQL</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} color="var(--primary)" /> Connected Backend Environment
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Backend Architecture:</span>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Spring Boot + Spring Security</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Database Layer:</span>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>MySQL Relational Database</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Frontend Framework:</span>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>React 18 + Vite + React Router v6</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Communication:</span>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>Axios HTTP REST + Session Cookies</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
