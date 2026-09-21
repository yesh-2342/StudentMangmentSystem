import React from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ navItems, title = 'Academic ERP', roleLabel = 'Portal', isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35, background: 'rgba(15, 23, 42, 0.4)' }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <GraduationCap size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="sidebar-title">{title}</span>
            <span className="sidebar-badge">{roleLabel}</span>
          </div>
          {isOpen && (
            <button className="btn-icon" style={{ marginLeft: 'auto' }} onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {item.icon && <item.icon size={18} />}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user ? `${user.firstName || ''} ${user.lastName || user.username}` : 'User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.role}
            </span>
          </div>
          <button className="btn-icon" onClick={logout} title="Logout" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
