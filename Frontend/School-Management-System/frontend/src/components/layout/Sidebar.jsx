import React from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({
  sections,
  navItems,
  title = 'Project 577',
  roleLabel = 'Portal',
  isOpen,
  onClose,
}) => {
  const { logout, user } = useAuth();

  // Normalize sections if only navItems passed
  const navSections = sections || [{ title: null, items: navItems || [] }];

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User';
  const roleDisplay = user?.role?.replace('ROLE_', '') || 'Portal';

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35, background: 'rgba(15, 23, 42, 0.45)' }}
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
            <button className="btn-icon" style={{ marginLeft: 'auto', width: 32, height: 32 }} onClick={onClose} aria-label="Close sidebar">
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '0.4rem' }}>
              {section.title && (
                <div className="sidebar-section-header">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {item.icon && <item.icon size={17} />}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {roleDisplay}
            </span>
          </div>
          <button
            className="btn-icon"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            style={{ width: 32, height: 32 }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
