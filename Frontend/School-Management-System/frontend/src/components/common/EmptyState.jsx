import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="state-container">
      <div className="state-icon" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
        <Icon size={28} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
