import React from 'react';

const StatCard = ({ icon: Icon, color = 'blue', value, label, subtext }) => {
  return (
    <div className="stat-card">
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
