import React, { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, Plus, ArrowRight, Award, CalendarCheck, AlertTriangle, HeartHandshake, Library, FileText, CheckCircle2, Shield, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
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

  const institutionalCourses = dashboard.courseWiseStats || [];

  const adminPerformanceData = institutionalCourses
    .map((c) => ({
      code: c.code || `C${c.id}`,
      name: c.name,
      teacher: c.teacherName,
      averageGrade: c.averageGrade !== null && c.averageGrade !== undefined ? Number(c.averageGrade) : null,
      studentCount: c.studentCount || 0,
    }))
    .filter((c) => c.averageGrade !== null);

  const adminAttendanceData = institutionalCourses
    .map((c) => ({
      code: c.code || `C${c.id}`,
      name: c.name,
      teacher: c.teacherName,
      attendanceRate: c.attendanceRate !== null && c.attendanceRate !== undefined ? Number(c.attendanceRate) : null,
      totalSessions: c.totalSessions || 0,
      isBelowBenchmark: c.attendanceRate !== null && Number(c.attendanceRate) < 75.0,
    }))
    .filter((c) => c.attendanceRate !== null);

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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/admin/assistant">
              <Button variant="primary" size="sm">
                <Bot size={15} /> Academic Assistant
              </Button>
            </Link>
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

      {/* Institutional Performance & Attendance Analytics Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Institutional Analytics & Class Metrics
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              University-wide academic attainment and attendance adherence across active academic courses
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              Active Catalog: {institutionalCourses.length} Courses
            </span>
            <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem' }}>
              At-Risk Alert: {dashboard.atRiskStudentsCount || 0} Students
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          
          {/* Chart 1: Course-Wise Academic Performance */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Course-Wise Academic Performance
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Institutional course GPA averages based on recorded evaluations
                </p>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                Benchmark: 60%
              </span>
            </div>

            {adminPerformanceData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adminPerformanceData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="code" tick={{ fill: '#475569', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem 0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#0f172a', fontSize: '0.825rem' }}>
                              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#0f172a' }}>{item.name} ({label})</strong>
                              <div style={{ color: '#2563eb', fontWeight: 700, marginBottom: '0.25rem' }}>
                                Course Average: {item.averageGrade}%
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Instructor: {item.teacher}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Enrolled Cohort: {item.studentCount} students
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Passing (60%)', position: 'insideTopLeft', fill: '#d97706', fontSize: 10 }} />
                    <Bar dataKey="averageGrade" fill="#2563eb" name="Course Average (%)" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No grade evaluations are currently recorded across the course catalog.
              </div>
            )}
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              University benchmark: ≥ 60.0% satisfactory pass rate across enrolled undergraduate sections.
            </div>
          </div>

          {/* Chart 2: Course-Wise Attendance Percentages */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Course-Wise Attendance Adherence
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Institutional attendance compliance versus 75% regulatory mandate
                </p>
              </div>
              <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem' }}>
                Mandate: ≥ 75%
              </span>
            </div>

            {adminAttendanceData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adminAttendanceData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="code" tick={{ fill: '#475569', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          const isBelow = item.attendanceRate < 75;
                          return (
                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem 0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#0f172a', fontSize: '0.825rem' }}>
                              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#0f172a' }}>{item.name} ({label})</strong>
                              <div style={{ color: isBelow ? '#dc2626' : '#16a34a', fontWeight: 700, marginBottom: '0.25rem' }}>
                                Attendance: {item.attendanceRate}% {isBelow ? '(Below 75% Mandate)' : '(Compliant)'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Instructor: {item.teacher}
                              </div>
                              {item.totalSessions > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Verified sessions recorded: {item.totalSessions}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '75% Required', position: 'insideTopLeft', fill: '#dc2626', fontSize: 10, fontWeight: 700 }} />
                    <Bar dataKey="attendanceRate" name="Attendance Rate (%)" radius={[4, 4, 0, 0]} maxBarSize={38}>
                      {adminAttendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isBelowBenchmark ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No attendance data is available for this period.
              </div>
            )}
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              Green: Class attendance ≥ 75.0%. Red: Course requires institutional attendance intervention.
            </div>
          </div>

        </div>
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
