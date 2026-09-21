import React from 'react';
import { BookOpen, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, linkTo, footerAction }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span className="badge badge-info">{course.code || 'COURSE'}</span>
        {course.averageGrade && (
          <span className="badge badge-success">Avg: {course.averageGrade}</span>
        )}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {course.name}
      </h3>

      {course.teacherName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <User size={14} />
          <span>{course.teacherName}</span>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {course.totalAssignments !== undefined ? `${course.totalAssignments} Assignments` : ''}
        </span>
        {linkTo ? (
          <Link to={linkTo} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            View Course <ArrowRight size={14} />
          </Link>
        ) : footerAction}
      </div>
    </div>
  );
};

export default CourseCard;
