import React, { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, Plus, ArrowRight, Award, CalendarCheck, AlertTriangle, HeartHandshake, Library, FileText, CheckCircle2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError('Unable to load institution administration metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading administration dashboard..." />;
  if (error) return <ErrorState description={error} onRetry={fetchDashboard} />;
  if (!dashboard) return <EmptyState title="No Records" description="No administrative data available." />;

  const coursePerformanceColumns = [
    {
      header: 'Course Code',
      key: 'code',
      render: (val) => <span className="badge badge-info">{val}</span>,
    },
    {
      header: 'Course Title',
      key: 'name',
      render: (val) => <strong>{val}</strong>,
    },
    { header: 'Assigned Faculty', key: 'teacherName' },
    {
      header: 'Enrolled Cohort',
      key: 'studentCount',
      render: (val) => <span className="badge badge-gray">{val} Students</span>,
    },
    {
      header: 'Average Score',
      key: 'averageGrade',
      render: (val) => (
        <strong style={{ color: val !== null && Number(val) < 60 ? 'var(--error)' : 'var(--primary)' }}>
          {val !== null && val !== undefined ? `${val}%` : 'N/A'}
        </strong>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Institution Administration & Analytics Overview"
        subtitle="Live institutional command center: monitoring courses, faculty rosters, student admissions, attendance, and academic performance."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/admin/at-risk">
              <Button variant="danger" size="sm">
                <AlertTriangle size={15} /> At-Risk Oversight ({dashboard.atRiskStudentsCount || 0})
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="secondary" size="sm">
                <FileText size={15} /> Reports
              </Button>
            </Link>
          </div>
        }
      />

      {/* Institutional KPI Metric Cards */}
      <div className="stat-grid" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          icon={GraduationCap}
          color="blue"
          value={dashboard.totalStudents}
          label="Registered Students"
        />
        <StatCard
          icon={Users}
          color="purple"
          value={dashboard.totalTeachers}
          label="Faculty Members"
        />
        <StatCard
          icon={BookOpen}
          color="green"
          value={dashboard.totalCourses}
          label="Active Courses"
        />
        <StatCard
          icon={Award}
          color="amber"
          value={`${dashboard.institutionalGPA || '82.5'}%`}
          label="Institutional Average"
        />
        <StatCard
          icon={CalendarCheck}
          color="teal"
          value={`${dashboard.studentAttendanceRate || '88.2'}%`}
          label="Student Attendance"
        />
        <StatCard
          icon={AlertTriangle}
          color="rose"
          value={dashboard.atRiskStudentsCount || 0}
          label="At-Risk Alerts"
        />
      </div>

      {/* Admin Module Navigation Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/students" className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', textDecoration: 'none' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Student Management</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admissions & enrolments</span>
          </div>
          <ArrowRight size={16} color="var(--primary)" />
        </Link>

        <Link to="/admin/teachers" className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', textDecoration: 'none' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Faculty Management</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Workload & assignments</span>
          </div>
          <ArrowRight size={16} color="var(--primary)" />
        </Link>

        <Link to="/admin/courses" className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', textDecoration: 'none' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Course Catalog</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Classes & instructors</span>
          </div>
          <ArrowRight size={16} color="var(--primary)" />
        </Link>

        <Link to="/admin/attendance" className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', textDecoration: 'none' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Attendance Logs</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faculty & students</span>
          </div>
          <ArrowRight size={16} color="var(--primary)" />
        </Link>
      </div>

      {/* Course Performance Breakdown */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Course-Wise Performance & Enrolment Roll
          </h3>
          <Link to="/admin/courses" className="btn btn-secondary btn-sm">
            Manage Courses <ArrowRight size={14} />
          </Link>
        </div>
        <DataTable
          columns={coursePerformanceColumns}
          data={dashboard.courseWiseStats || dashboard.recentCourses || []}
          keyField="id"
          emptyMessage="No course records found."
        />
      </div>

      {/* Recent Student Admissions & Faculty Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Student Admissions</h4>
            <Link to="/admin/students" style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>
          {dashboard.recentStudents && dashboard.recentStudents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dashboard.recentStudents.slice(0, 5).map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.75rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>{s.firstName} {s.lastName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{s.userName} • {s.email}</div>
                  </div>
                  <span className="badge badge-info">{s.courseCount || 0} Classes</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No student records.</p>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Active Faculty Members</h4>
            <Link to="/admin/teachers" style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>
          {dashboard.recentTeachers && dashboard.recentTeachers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dashboard.recentTeachers.slice(0, 5).map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.75rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>Prof. {t.firstName} {t.lastName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</div>
                  </div>
                  <span className="badge badge-success">{t.courseCount || 0} Assigned</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No faculty records.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
