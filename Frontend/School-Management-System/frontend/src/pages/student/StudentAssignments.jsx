import React, { useEffect, useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import AssignmentCard from '../../components/ui/AssignmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const StudentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAssignments(user.id);
      setAssignments(data);
    } catch (err) {
      setError('Unable to load assignments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user?.id]);

  const handleMarkCompleted = async (assignmentId) => {
    const a = assignments.find((item) => item.id === assignmentId);
    if (!a) return;
    try {
      await studentService.markAssignmentCompleted(user.id, a.courseId, assignmentId);
      fetchAssignments();
    } catch (err) {
      alert('Could not update assignment status.');
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'PENDING') return a.isDone === 0;
    if (filter === 'COMPLETED') return a.isDone === 1;
    return true;
  });

  if (loading) return <LoadingSpinner message="Loading your assignments..." />;
  if (error) return <ErrorState description={error} onRetry={fetchAssignments} />;

  return (
    <div>
      <PageHeader
        title="Course Assignments"
        subtitle="Track upcoming homework, project deliverables, and completed tasks."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', background: '#ffffff', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <button
              className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('ALL')}
            >
              All ({assignments.length})
            </button>
            <button
              className={`btn btn-sm ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('PENDING')}
            >
              Pending ({assignments.filter((a) => a.isDone === 0).length})
            </button>
            <button
              className={`btn btn-sm ${filter === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('COMPLETED')}
            >
              Completed ({assignments.filter((a) => a.isDone === 1).length})
            </button>
          </div>
        }
      />

      {filteredAssignments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredAssignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onMarkCompleted={handleMarkCompleted}
              linkTo={`/student/courses/${a.courseId}/assignment/${a.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Assignments"
          description={`You have no ${filter.toLowerCase()} assignments.`}
        />
      )}
    </div>
  );
};

export default StudentAssignments;
