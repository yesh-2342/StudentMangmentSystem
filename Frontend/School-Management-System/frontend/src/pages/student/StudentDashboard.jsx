import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, CheckCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import CourseCard from '../../components/ui/CourseCard';
import AssignmentCard from '../../components/ui/AssignmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getDashboard(user.id);
      setDashboard(data);
    } catch (err) {
      setError('Unable to load student dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id]);

  const handleMarkCompleted = async (assignmentId) => {
    if (!dashboard?.recentAssignments) return;
    const assignment = dashboard.recentAssignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    try {
      await studentService.markAssignmentCompleted(user.id, assignment.courseId, assignmentId);
      fetchDashboard();
    } catch (err) {
      alert('Could not update assignment completion status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your academic dashboard..." />;
  if (error) return <ErrorState description={error} onRetry={fetchDashboard} />;
  if (!dashboard) return <EmptyState title="No Dashboard Data" description="No academic information found for your student profile." />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${dashboard.firstName || dashboard.studentName || 'Student'}!`}
        subtitle="Here is your academic overview and current course progression."
      />

      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard
          icon={BookOpen}
          color="blue"
          value={dashboard.totalCourses}
          label="Enrolled Courses"
        />
        <StatCard
          icon={FileText}
          color="purple"
          value={dashboard.totalAssignments}
          label="Total Assignments"
        />
        <StatCard
          icon={CheckCircle}
          color="green"
          value={dashboard.completedAssignments}
          label="Completed"
        />
        <StatCard
          icon={Clock}
          color="amber"
          value={dashboard.pendingAssignments}
          label="Pending Tasks"
        />
        <StatCard
          icon={Award}
          color="blue"
          value={dashboard.averageGrade !== 'N/A' ? `${dashboard.averageGrade}%` : 'N/A'}
          label="Cumulative Average"
        />
      </div>

      {/* Enrolled Courses Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            My Courses ({dashboard.courses?.length || 0})
          </h2>
        </div>

        {dashboard.courses && dashboard.courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {dashboard.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                linkTo={`/student/courses/${course.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Courses Enrolled"
            description="You are not enrolled in any courses yet. Please contact your administrator."
          />
        )}
      </div>

      {/* Recent Assignments Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Recent Course Assignments
          </h2>
        </div>

        {dashboard.recentAssignments && dashboard.recentAssignments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {dashboard.recentAssignments.slice(0, 6).map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onMarkCompleted={handleMarkCompleted}
                linkTo={`/student/courses/${assignment.courseId}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No Pending Assignments"
            description="You have no assignments due at this time. Great job staying ahead!"
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
