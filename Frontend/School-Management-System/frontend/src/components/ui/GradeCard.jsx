import React from 'react';
import { Award, BookOpen } from 'lucide-react';

const GradeCard = ({ grade }) => {
  const formatGrade = (val) => (val !== null && val !== undefined && val !== -1 ? `${val}%` : '-');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-info">{grade.courseCode || 'COURSE'}</span>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {grade.courseName}
          </h4>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
            {grade.average !== 'N/A' ? `${grade.average}%` : 'N/A'}
          </div>
          {grade.letterGrade && grade.letterGrade !== '-' && (
            <span className="badge badge-success">Grade: {grade.letterGrade}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exam 1</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatGrade(grade.gradeOne)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exam 2</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatGrade(grade.gradeTwo)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Final Exam</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatGrade(grade.gradeThree)}</div>
        </div>
      </div>
    </div>
  );
};

export default GradeCard;
