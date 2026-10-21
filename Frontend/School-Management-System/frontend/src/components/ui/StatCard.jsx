import React from 'react';

const StatCard = ({ icon: Icon, color = 'blue', value, label, subtext, onClick, style, className = '' }) => {
  return (
    <div
      className={`stat-card ${onClick ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        ...style,
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ' ? onClick(e) : null) : undefined}
    >
      {Icon && (
        <div className={`stat-icon-box ${color}`}>
          <Icon size={24} />
        </div>
      )}
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
