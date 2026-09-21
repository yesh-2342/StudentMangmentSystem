import React from 'react';

const LoadingSpinner = ({ message = 'Loading academic data...', size = 32 }) => {
  return (
    <div className="state-container">
      <div className="spinner" style={{ width: size, height: size }} />
      {message && <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
