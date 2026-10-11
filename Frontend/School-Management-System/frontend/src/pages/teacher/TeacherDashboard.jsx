import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, FileText, Clock, AlertTriangle, ArrowRight, Sparkles, CheckCircle2, CalendarCheck, LineChart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import CourseCard from '../../components/ui/CourseCard';
import AssignmentCard from '../../components/ui/AssignmentCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [dashData, atRiskData] = await Promise.allSettled([
        teacherService.getDashboard(user.id),
        teacherService.getAtRiskStudents(user.id),
      ]);

      if (dashData.status === 'fulfilled') {
        setDashboard(dashData.value);
      }
      if (atRiskData.status === 'fulfilled' && Array.isArray(atRiskData.value)) {
        setAtRiskCount(atRiskData.value.length);
      }
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
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/teacher/at-risk">
              <Button variant="danger" size="sm" style={{ fontWeight: 700 }}>
                <AlertTriangle size={16} /> View Academically At-Risk Students ({atRiskCount})
              </Button>
            </Link>
            <Link to="/teacher/simulator">
              <Button variant="secondary" size="sm">
                <LineChart size={16} /> What-If Simulator
              </Button>
            </Link>
          </div>
        }
      />

      {/* Priority 1-Click Feature: At-Risk Students Alert Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Academic Performance Alert
              </strong>
              <span className="badge badge-warning" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                {atRiskCount} Student{atRiskCount !== 1 ? 's' : ''} Flagged
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Identified students in your classes with assessment marks below 60% or attendance below 75%.
            </p>
          </div>
        </div>

        <Link to="/teacher/at-risk">
          <Button variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            View Academically At-Risk Students <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
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

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/teacher/students" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(29, 84, 108, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Student Management</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View roster & edit student details</span>
          </div>
        </Link>

        <Link to="/teacher/attendance" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(15, 118, 110, 0.1)', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Class Attendance</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Record session rolls & histories</span>
          </div>
        </Link>

        <Link to="/teacher/simulator" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LineChart size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>What-If Simulator</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulate hypothetical grades & standing</span>
          </div>
        </Link>
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
            Active Coursework & Diagnostic Assessments
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
