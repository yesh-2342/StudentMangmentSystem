import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';

const StudentAssignmentDetails = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAssignment = async () => {
    if (!user?.id || !courseId || !assignmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAssignmentDetails(user.id, courseId, assignmentId);
      setAssignment(data);
    } catch (err) {
      setError('Unable to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [user?.id, courseId, assignmentId]);

  const handleMarkCompleted = async () => {
    setActionLoading(true);
    try {
      await studentService.markAssignmentCompleted(user.id, courseId, assignmentId);
      setAssignment((prev) => ({ ...prev, isDone: 1 }));
    } catch (err) {
      alert('Failed to mark assignment as completed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading assignment details..." />;
  if (error) return <ErrorState description={error} onRetry={fetchAssignment} />;
  if (!assignment) return <EmptyState title="Assignment Not Found" description="Could not find details for this task." />;

  const isDone = assignment.isDone === 1;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/student/courses/${courseId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Course
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
              {assignment.courseCode || assignment.courseName || 'Course Assignment'}
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {assignment.name}
            </h1>
          </div>
          {isDone ? (
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
              <CheckCircle2 size={14} /> Completed
            </span>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
              <Clock size={14} /> Pending ({assignment.daysRemaining} days left)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Calendar size={18} />
            <span>Due Date: <strong>{assignment.dueDate}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Clock size={18} />
            <span>Time Remaining: <strong>{assignment.daysRemaining >= 0 ? `${assignment.daysRemaining} days` : 'Overdue'}</strong></span>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Instructions & Description
          </h3>
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
            {assignment.description || 'No instructions provided.'}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          {!isDone ? (
            <Button variant="primary" onClick={handleMarkCompleted} loading={actionLoading}>
              <CheckCircle2 size={16} /> Mark as Completed
            </Button>
          ) : (
            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> You have completed this assignment!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentDetails;
