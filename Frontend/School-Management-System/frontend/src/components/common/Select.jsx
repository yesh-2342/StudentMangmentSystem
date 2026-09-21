import React from 'react';

const Select = ({
  label,
  id,
  options = [],
  error,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      <select
        id={id}
        className={`form-select ${className}`}
        style={error ? { borderColor: 'var(--error)' } : {}}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default Select;
