import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Unable to load data',
  description = 'An error occurred while fetching information from the server.',
  retryLabel = 'Try again',
  onRetry,
}) => {
  return (
    <div className="state-container">
      <div className="state-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
        <AlertTriangle size={28} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
