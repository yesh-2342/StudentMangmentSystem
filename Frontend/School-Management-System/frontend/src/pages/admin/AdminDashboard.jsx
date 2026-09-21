import React, { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, Plus, ArrowRight } from 'lucide-react';
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

  const studentColumns = [
    {
      header: 'Student',
      key: 'firstName',
      render: (_, row) => <strong>{row.firstName} {row.lastName}</strong>,
    },
    { header: 'Username', key: 'userName' },
    { header: 'Email', key: 'email' },
    {
      header: 'Enrolled Courses',
      key: 'courseCount',
      render: (val) => <span className="badge badge-info">{val} Courses</span>,
    },
  ];

  const courseColumns = [
    {
      header: 'Code',
      key: 'code',
      render: (val) => <span className="badge badge-info">{val}</span>,
    },
    {
      header: 'Course Title',
      key: 'name',
      render: (val) => <strong>{val}</strong>,
    },
    { header: 'Instructor', key: 'teacherName' },
    {
      header: 'Students',
      key: 'studentCount',
      render: (val) => <span className="badge badge-success">{val} Students</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Institution Administration Overview"
        subtitle="Manage academic entities, course assignments, faculty directories, and student admissions."
      />

      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard
          icon={GraduationCap}
          color="blue"
          value={dashboard.totalStudents}
          label="Total Registered Students"
        />
        <StatCard
          icon={Users}
          color="purple"
          value={dashboard.totalTeachers}
          label="Total Faculty Members"
        />
        <StatCard
          icon={BookOpen}
          color="green"
          value={dashboard.totalCourses}
          label="Active Courses"
        />
      </div>

      {/* Quick Action Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/students" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Manage Students</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enroll or drop courses</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </Link>
        <Link to="/admin/teachers" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Manage Faculty</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Review teaching assignments</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </Link>
        <Link to="/admin/courses" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Manage Courses</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create courses and assign teachers</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </Link>
      </div>

      {/* Recent Courses */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Recent Course Catalog</h3>
          <Link to="/admin/courses" className="btn btn-secondary btn-sm">
            View All Courses <ArrowRight size={14} />
          </Link>
        </div>
        <DataTable
          columns={courseColumns}
          data={dashboard.recentCourses || []}
          keyField="id"
          emptyMessage="No courses created yet."
        />
      </div>

      {/* Recent Students */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Recent Student Registrations</h3>
          <Link to="/admin/students" className="btn btn-secondary btn-sm">
            View All Students <ArrowRight size={14} />
          </Link>
        </div>
        <DataTable
          columns={studentColumns}
          data={dashboard.recentStudents || []}
          keyField="id"
          emptyMessage="No students registered yet."
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
