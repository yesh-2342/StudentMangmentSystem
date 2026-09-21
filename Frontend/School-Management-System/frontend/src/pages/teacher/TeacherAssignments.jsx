import React, { useEffect, useState } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';

const TeacherAssignments = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getCourses(user.id);
      setCourses(data);
    } catch (err) {
      setError('Unable to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading course assignments..." />;
  if (error) return <ErrorState description={error} onRetry={fetchCourses} />;

  return (
    <div>
      <PageHeader
        title="Class Assignments Management"
        subtitle="Select a course to create, edit, delete, or check student submission rates."
      />

      {courses && courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {courses.map((c) => (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-info">{c.code}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {c.totalAssignments} Students Enrolled
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{c.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage quizzes, projects, homework tasks, and review completion rates.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <Link to={`/teacher/courses/${c.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Manage Course Assignments <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Courses"
          description="You do not have any courses assigned to manage assignments."
        />
      )}
    </div>
  );
};

export default TeacherAssignments;
