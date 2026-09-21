import React, { useEffect, useState } from 'react';
import { BookOpen, Users, FileText, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import CourseCard from '../../components/ui/CourseCard';
import AssignmentCard from '../../components/ui/AssignmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getDashboard(user.id);
      setDashboard(data);
    } catch (err) {
      setError('Unable to load faculty dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading faculty portal..." />;
  if (error) return <ErrorState description={error} onRetry={fetchDashboard} />;
  if (!dashboard) return <EmptyState title="No Dashboard Data" description="No faculty records located." />;

  return (
    <div>
      <PageHeader
        title={`Welcome, Professor ${dashboard.firstName || dashboard.teacherName || 'Faculty'}!`}
        subtitle="Manage assigned courses, monitor student progress, review assignments, and post semester grades."
      />

      {/* Stat Cards Grid */}
      <div className="stat-grid">
        <StatCard
          icon={BookOpen}
          color="blue"
          value={dashboard.totalCourses}
          label="Courses Instructed"
        />
        <StatCard
          icon={Users}
          color="purple"
          value={dashboard.totalStudents}
          label="Enrolled Students"
        />
        <StatCard
          icon={FileText}
          color="amber"
          value={dashboard.totalAssignments}
          label="Assignments Given"
        />
        <StatCard
          icon={Clock}
          color="green"
          value={dashboard.upcomingAssignments}
          label="Upcoming Due Dates"
        />
      </div>

      {/* Courses List */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Courses You Teach ({dashboard.courses?.length || 0})
          </h2>
        </div>

        {dashboard.courses && dashboard.courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {dashboard.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                linkTo={`/teacher/courses/${course.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Courses Assigned"
            description="You do not have any courses assigned to you in the catalog currently."
          />
        )}
      </div>

      {/* Recent Assignments */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Active Assignments
          </h2>
        </div>

        {dashboard.recentAssignments && dashboard.recentAssignments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {dashboard.recentAssignments.slice(0, 6).map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                linkTo={`/teacher/courses/${assignment.courseId}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No Assignments Given"
            description="You have not created any assignments for your classes yet."
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
