import React, { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User';
  const role = user?.role?.replace('ROLE_', '') || 'Portal';
  const roleKey = role.toLowerCase();
  const initial = displayName.charAt(0).toUpperCase();

  const notificationPath = roleKey === 'admin' ? '/admin/notifications' : roleKey === 'teacher' ? '/teacher/notifications' : '/student/notifications';
  const profilePath = roleKey === 'admin' ? '/admin/profile' : roleKey === 'teacher' ? '/teacher/profile' : '/student/profile';

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      if (roleKey === 'admin') navigate('/admin/students');
      else if (roleKey === 'teacher') navigate('/teacher/students');
      else navigate('/student/courses');
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="btn-icon" onClick={onToggleSidebar} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div className="navbar-title">
          <strong>Project 577</strong>
          <span>Digital Academic Performance Monitoring</span>
        </div>
      </div>

      <div className="navbar-right">
        <label className="navbar-search" aria-label="Search academic records">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search courses, students, grades..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </label>
        <button
          className="btn-icon"
          type="button"
          aria-label="Notifications"
          onClick={() => navigate(notificationPath)}
          title="View Notifications"
        >
          <Bell size={18} />
        </button>
        <div
          className="navbar-user"
          onClick={() => navigate(profilePath)}
          style={{ cursor: 'pointer' }}
          title="View Profile"
        >
          <span className="avatar">{initial}</span>
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>{displayName}</strong>
            <small style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{role}</small>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
