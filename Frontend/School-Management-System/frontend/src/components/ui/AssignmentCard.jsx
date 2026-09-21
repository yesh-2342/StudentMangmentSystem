import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignmentCard = ({ assignment, onMarkCompleted, linkTo }) => {
  const isDone = assignment.isDone === 1;
  const isOverdue = !isDone && assignment.daysRemaining < 0;
  const isDueSoon = !isDone && assignment.daysRemaining >= 0 && assignment.daysRemaining <= 2;

  let badge = <span className="badge badge-warning"><Clock size={12} /> {assignment.daysRemaining} days left</span>;
  if (isDone) {
    badge = <span className="badge badge-success"><CheckCircle2 size={12} /> Completed</span>;
  } else if (isOverdue) {
    badge = <span className="badge badge-danger"><AlertCircle size={12} /> Overdue</span>;
  } else if (isDueSoon) {
    badge = <span className="badge badge-warning"><Clock size={12} /> Due Soon ({assignment.daysRemaining}d)</span>;
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
          {assignment.courseCode || assignment.courseName || 'Assignment'}
        </span>
        {badge}
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {assignment.name}
      </h4>

      {assignment.description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {assignment.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>Due: {assignment.dueDate || 'No date'}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isDone && onMarkCompleted && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onMarkCompleted(assignment.id)}
            >
              Mark Done
            </button>
          )}
          {linkTo && (
            <Link to={linkTo} className="btn btn-secondary btn-sm">
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
