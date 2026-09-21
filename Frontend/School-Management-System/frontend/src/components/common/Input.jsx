import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`form-input ${className}`}
        style={error ? { borderColor: 'var(--error)' } : {}}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default Input;
