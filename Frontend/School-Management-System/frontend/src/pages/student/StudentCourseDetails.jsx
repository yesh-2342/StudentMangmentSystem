import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, User, ArrowLeft, Award, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import AssignmentCard from '../../components/ui/AssignmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';

const StudentCourseDetails = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseDetails = async () => {
    if (!user?.id || !courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getCourseDetails(user.id, courseId);
      setCourseData(data);
    } catch (err) {
      setError('Unable to load course syllabus and grades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [user?.id, courseId]);

  const handleMarkCompleted = async (assignmentId) => {
    try {
      await studentService.markAssignmentCompleted(user.id, courseId, assignmentId);
      fetchCourseDetails();
    } catch (err) {
      alert('Could not update assignment status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading course syllabus..." />;
  if (error) return <ErrorState description={error} onRetry={fetchCourseDetails} />;
  if (!courseData) return <EmptyState title="Course Not Found" description="The requested course could not be located." />;

  const { course, assignments } = courseData;
  const formatGrade = (val) => (val !== null && val !== undefined && val !== -1 ? `${val}%` : '-');

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/student/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>

      <PageHeader
        title={`${course.name} (${course.code})`}
        subtitle={`Instructor: ${course.teacherName || 'Faculty Instructor'}`}
      />

      {/* Grade Breakdown Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Award size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Course Grade Evaluation</h3>
          <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
            Current Average: {course.averageGrade !== 'N/A' ? `${course.averageGrade}%` : 'N/A'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Midterm 1</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {formatGrade(course.gradeOne)}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Midterm 2</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {formatGrade(course.gradeTwo)}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Exam</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {formatGrade(course.gradeThree)}
            </div>
          </div>
        </div>
      </div>

      {/* Course Assignments List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            Course Assignments ({assignments?.length || 0})
          </h3>
        </div>

        {assignments && assignments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onMarkCompleted={handleMarkCompleted}
                linkTo={`/student/courses/${courseId}/assignment/${a.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No Course Assignments"
            description="There are no assignments assigned for this course yet."
          />
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetails;
