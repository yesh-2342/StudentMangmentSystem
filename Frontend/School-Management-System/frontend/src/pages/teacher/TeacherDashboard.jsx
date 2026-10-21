import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  LineChart,
  UserCheck,
  Check,
  X,
  Calendar,
  MapPin,
  Save,
  CheckCircle,
  Bot,
  Activity,
  Award,
  FileCheck,
  HelpCircle,
} from 'lucide-react';
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
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import academicService from '../../services/academicService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import CourseCard from '../../components/ui/CourseCard';
import AssignmentCard from '../../components/ui/AssignmentCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';



const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Teacher Availability State
  const [availabilitySlot, setAvailabilitySlot] = useState({
    id: null,
    status: 'AVAILABLE',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '12:00',
    officeLocation: 'Faculty Cabin 304, Academic Block',
    notes: 'Open office consultation hours. Walk-ins and portal bookings welcomed.',
  });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [availabilitySuccess, setAvailabilitySuccess] = useState(null);

  // 2. Attendance Modal State
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [dashData, atRiskData, availData] = await Promise.allSettled([
        teacherService.getDashboard(user.id),
        teacherService.getAtRiskStudents(user.id),
        academicService.getAvailability(),
      ]);

      if (dashData.status === 'fulfilled') {
        setDashboard(dashData.value);
        if (dashData.value?.courses?.length > 0 && !selectedClassId) {
          setSelectedClassId(String(dashData.value.courses[0].id));
        }
      }
      if (atRiskData.status === 'fulfilled' && Array.isArray(atRiskData.value)) {
        setAtRiskCount(atRiskData.value.length);
      }
      if (availData.status === 'fulfilled' && Array.isArray(availData.value)) {
        const mySlot = availData.value.find((s) => s.teacherId === user.id);
        if (mySlot) {
          setAvailabilitySlot({
            id: mySlot.id,
            status: mySlot.status || 'AVAILABLE',
            dayOfWeek: mySlot.dayOfWeek || 'MONDAY',
            startTime: mySlot.startTime || '09:00',
            endTime: mySlot.endTime || '12:00',
            officeLocation: mySlot.officeLocation || 'Faculty Cabin 304, Academic Block',
            notes: mySlot.notes || 'Open office consultation hours.',
          });
        }
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

  // Update Roster when Selected Class changes in Attendance Modal
  useEffect(() => {
    const classIdNum = Number(selectedClassId);
    if (!classIdNum) {
      setAttendanceRoster([]);
      return;
    }

    if (dashboard?.courses) {
      const courseFound = dashboard.courses.find((c) => c.id === classIdNum);
      if (courseFound) {
        teacherService.getStudents(user.id).then((allStudents) => {
          if (Array.isArray(allStudents) && allStudents.length > 0) {
            setAttendanceRoster(
              allStudents.map((s) => ({
                studentId: s.id,
                studentName: `${s.firstName || ''} ${s.lastName || s.username || 'Student'}`.trim(),
                rollNo: s.username || `ID-${s.id}`,
                status: 'PRESENT',
              }))
            );
          } else {
            setAttendanceRoster([]);
          }
        }).catch(() => {
          setAttendanceRoster([]);
        });
      }
    }
  }, [selectedClassId, dashboard?.courses, user?.id]);

  // 1. Handle Save Teacher Availability
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setSavingAvailability(true);
    setAvailabilitySuccess(null);
    try {
      await academicService.saveAvailability({
        id: availabilitySlot.id,
        teacherId: user.id,
        status: availabilitySlot.status,
        dayOfWeek: availabilitySlot.dayOfWeek,
        startTime: availabilitySlot.startTime,
        endTime: availabilitySlot.endTime,
        officeLocation: availabilitySlot.officeLocation,
        notes: availabilitySlot.notes,
      });
      setAvailabilitySuccess('Availability and consultation schedule saved successfully.');
      setTimeout(() => setAvailabilitySuccess(null), 4000);
    } catch (err) {
      alert('Failed to save availability: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingAvailability(false);
    }
  };

  // 2. Handle Attendance Actions
  const handleSetStudentStatus = (studentId, newStatus) => {
    setAttendanceRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setAttendanceRoster((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
  };

  const handleSaveAttendance = async () => {
    if (!attendanceDate) {
      setAttendanceError('Please choose a valid session date.');
      return;
    }
    setSavingAttendance(true);
    setAttendanceError(null);
    setAttendanceSuccess(null);

    const classIdNum = Number(selectedClassId);
    const payload = {
      courseId: classIdNum,
      sessionDate: attendanceDate,
      records: attendanceRoster.map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        status: s.status,
      })),
    };

    try {
      await academicService.recordAttendance(payload);
      setAttendanceSuccess(
        `Attendance successfully saved for ${attendanceRoster.length} students on ${attendanceDate}!`
      );
      setTimeout(() => {
        setAttendanceSuccess(null);
        setAttendanceModalOpen(false);
      }, 2500);
    } catch (err) {
      setAttendanceError(err.response?.data?.message || err.message || 'Failed to record attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading faculty portal..." />;
  if (error) return <ErrorState description={error} onRetry={fetchDashboard} />;
  if (!dashboard) return <EmptyState title="No Dashboard Data" description="No faculty records located." />;

  const teacherCourses = dashboard?.courses || [];

  // 1. Subject-Wise Average Marks for Teacher's Assigned Courses
  const coursePerformanceChartData = teacherCourses
    .map((c) => {
      const avg = c.averageGrade && c.averageGrade !== 'N/A' && !isNaN(Number(c.averageGrade))
        ? Number(c.averageGrade)
        : null;
      return {
        code: c.code || `C${c.id}`,
        name: c.name,
        averageGrade: avg,
        enrolledStudents: c.totalAssignments || 0,
        completedSubmissions: c.completedAssignments || 0,
      };
    })
    .filter((c) => c.averageGrade !== null);

  // 2. Class Attendance Percentage by Assigned Course
  const courseAttendanceChartData = teacherCourses
    .map((c) => {
      const rate = c.attendanceRate !== null && c.attendanceRate !== undefined && !isNaN(Number(c.attendanceRate))
        ? Number(c.attendanceRate)
        : null;
      return {
        code: c.code || `C${c.id}`,
        name: c.name,
        attendanceRate: rate,
        totalSessions: c.totalSessions || 0,
        attendedSessions: c.attendedSessions || 0,
        isBelowBenchmark: rate !== null && rate < 75.0,
      };
    })
    .filter((c) => c.attendanceRate !== null);

  return (
    <div>
      <PageHeader
        title={`Welcome, Professor ${dashboard.firstName || dashboard.teacherName || 'Faculty'}!`}
        subtitle="Manage assigned courses, record class attendance, update office hours, and review assignments."
        actions={
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/teacher/assistant')}
            >
              <Bot size={16} /> Academic Assistant
            </Button>
            <Button
              variant="secondary"
              size="sm"
              style={{ fontWeight: 650 }}
              onClick={() => {
                setAttendanceModalOpen(true);
                setAttendanceSuccess(null);
                setAttendanceError(null);
              }}
            >
              <UserCheck size={16} /> Take Attendance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/teacher/at-risk')}
            >
              <AlertTriangle size={16} /> At-Risk Students ({atRiskCount})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/teacher/simulator')}
            >
              <LineChart size={16} /> What-If Simulator
            </Button>
          </div>
        }
      />

      {/* Priority Alert Banner */}
      <div
        style={{
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e5e5e5)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Academic Performance Alert
              </strong>
              <span className="badge" style={{ background: '#111111', color: '#ffffff', border: '1px solid #111111' }}>
                {atRiskCount} Student{atRiskCount !== 1 ? 's' : ''} Flagged
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Identified students in your classes with assessment marks below 60% or attendance below 75%.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          onClick={() => navigate('/teacher/at-risk')}
        >
          View Academically At-Risk Students <ArrowRight size={16} />
        </Button>
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

      {/* Faculty Quick Management Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div
          className="card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', border: '1px solid var(--border)' }}
          onClick={() => navigate('/teacher/class-health')}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.4rem', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a' }}>
              <Activity size={18} />
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Class Health Dashboard</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Monitor cohort health metrics, average grades, and at-risk student concentrations.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', border: '1px solid var(--border)' }}
          onClick={() => navigate('/teacher/bulk-marks')}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.4rem', borderRadius: '6px', background: '#fef3c7', color: '#d97706' }}>
              <Award size={18} />
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Bulk Marks Entry</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Batch input Midterm, Coursework, and Final marks with automated student progress alerts.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', border: '1px solid var(--border)' }}
          onClick={() => navigate('/teacher/submissions')}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.4rem', borderRadius: '6px', background: '#eff6ff', color: '#2563eb' }}>
              <FileCheck size={18} />
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Submission Tracker</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Verify student coursework submissions and monitor real-time class submission percentages.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease', border: '1px solid var(--border)' }}
          onClick={() => navigate('/teacher/doubts')}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.4rem', borderRadius: '6px', background: '#fdf2f8', color: '#db2777' }}>
              <HelpCircle size={18} />
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Doubt &amp; Clarifications</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Address student lecture inquiries and publish verified answers with instant delivery.
          </p>
        </div>
      </div>

      {/* FEATURE 1: TEACHER AVAILABILITY SECTION */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Faculty Availability & Office Consultation Hours
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              Configure your real-time availability status, advising days, office location, and hours visible to enrolled students.
            </p>
          </div>
          <div>
            <span
              className="badge"
              style={{
                background: availabilitySlot.status === 'AVAILABLE' ? '#111111' : availabilitySlot.status === 'BUSY' ? '#666666' : '#ffffff',
                color: availabilitySlot.status === 'UNAVAILABLE' ? '#111111' : '#ffffff',
                border: '1px solid #111111',
                padding: '0.4rem 0.85rem',
                fontSize: '0.85rem',
              }}
            >
              Status: {availabilitySlot.status}
            </span>
          </div>
        </div>

        {availabilitySuccess && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#fafafa', border: '1px solid #111111', color: '#111111', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <CheckCircle size={18} /> {availabilitySuccess}
          </div>
        )}

        <form onSubmit={handleSaveAvailability}>
          {/* Status Selector Pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Current Status
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { value: 'AVAILABLE', label: 'Available for Consultation' },
                { value: 'BUSY', label: 'Busy / In Lecture' },
                { value: 'UNAVAILABLE', label: 'Unavailable / Out of Office' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setAvailabilitySlot({ ...availabilitySlot, status: item.value })}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: availabilitySlot.status === item.value ? '#111111' : '#ffffff',
                    color: availabilitySlot.status === item.value ? '#ffffff' : '#111111',
                    border: `1.5px solid ${availabilitySlot.status === item.value ? '#111111' : 'var(--border)'}`,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule & Office Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Available Day
              </label>
              <select
                value={availabilitySlot.dayOfWeek}
                onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, dayOfWeek: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <option value="MONDAY">MONDAY</option>
                <option value="TUESDAY">TUESDAY</option>
                <option value="WEDNESDAY">WEDNESDAY</option>
                <option value="THURSDAY">THURSDAY</option>
                <option value="FRIDAY">FRIDAY</option>
                <option value="WEEKDAYS">MON - FRI (WEEKDAYS)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Consultation Start Time
              </label>
              <input
                type="time"
                value={availabilitySlot.startTime}
                onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, startTime: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Consultation End Time
              </label>
              <input
                type="time"
                value={availabilitySlot.endTime}
                onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, endTime: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Office / Cabin Location
              </label>
              <input
                type="text"
                placeholder="e.g. Faculty Cabin 304, Academic Block"
                value={availabilitySlot.officeLocation}
                onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, officeLocation: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Consultation Guidance / Instructions for Students
            </label>
            <input
              type="text"
              placeholder="e.g. Please bring current coursework marks. Walk-ins permitted during scheduled hours."
              value={availabilitySlot.notes}
              onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, notes: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" loading={savingAvailability} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> Save Availability Settings
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div
          className="card card-hover"
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', cursor: 'pointer' }}
          onClick={() => {
            setAttendanceModalOpen(true);
            setAttendanceSuccess(null);
            setAttendanceError(null);
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f5f5f5', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Take Attendance</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official & demo class roll calls</span>
          </div>
        </div>

        <Link to="/teacher/students" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f5f5f5', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5' }}>
            <Users size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Student Management</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View roster & edit student details</span>
          </div>
        </Link>

        <Link to="/teacher/attendance" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f5f5f5', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5' }}>
            <CalendarCheck size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>Attendance Logs</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical session rolls & records</span>
          </div>
        </Link>
      </div>

      {/* Class Performance and Attendance Analytics Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Class Performance & Attendance Analytics
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Real-time academic evaluation metrics and verified attendance for your assigned instructional cohorts
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              Assigned Courses: {teacherCourses.length}
            </span>
            <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem' }}>
              At-Risk Students: {atRiskCount}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          
          {/* Chart 1: Subject-Wise Average Marks */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Cohort Average Marks by Course
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Mean percentage across all enrolled students in your classes
                </p>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                Benchmark: 60%
              </span>
            </div>

            {coursePerformanceChartData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformanceChartData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
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
                                Class Average: {item.averageGrade}%
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Cohort Size: {item.enrolledStudents} students
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Submissions Completed: {item.completedSubmissions}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Passing Benchmark (60%)', position: 'insideTopLeft', fill: '#d97706', fontSize: 10 }} />
                    <Bar dataKey="averageGrade" fill="#2563eb" name="Class Average (%)" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No student assessment grades are recorded yet for your assigned classes.
              </div>
            )}
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              Tracks overall cohort performance per assigned subject based on recorded continuous assessments.
            </div>
          </div>

          {/* Chart 2: Attendance Percentage by Subject */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Class Attendance Rate by Course
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Aggregated roll call attendance against 75% institutional policy
                </p>
              </div>
              <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.75rem' }}>
                Threshold: 75%
              </span>
            </div>

            {courseAttendanceChartData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseAttendanceChartData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
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
                                Class Attendance: {item.attendanceRate}% {isBelow ? '(Below Threshold)' : '(Compliant)'}
                              </div>
                              {item.totalSessions > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Sessions logged: {item.attendedSessions} present of {item.totalSessions} total student records
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
                      {courseAttendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isBelowBenchmark ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No attendance logs found for your assigned courses. Use "Take Attendance" above to record sessions.
              </div>
            )}
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              Green: Class attendance ≥ 75.0%. Red: Class falls below mandatory attendance standard.
            </div>
          </div>

        </div>
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

      {/* FEATURE 2: EASY ATTENDANCE MODAL WITH DEMO CLASSES */}
      <Modal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        title="Take Class Attendance"
        maxWidth={760}
      >
        <div>
          {attendanceSuccess && (
            <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#fafafa', border: '1px solid #111111', color: '#111111', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <CheckCircle size={18} /> {attendanceSuccess}
            </div>
          )}

          {attendanceError && (
            <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#f5f5f5', border: '1px solid #111111', color: '#111111', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {attendanceError}
            </div>
          )}

          {/* Class and Date Selection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Select Class / Cohort *
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                {dashboard.courses && dashboard.courses.length > 0 ? (
                  dashboard.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))
                ) : (
                  <option value="">No courses assigned yet</option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Attendance Date *
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </div>
          </div>

          {/* Roster Header & Mark All Present Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Class Roster ({attendanceRoster.length} Students)
              </strong>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleMarkAllPresent}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <Check size={14} /> Mark All Present
            </Button>
          </div>

          {/* Students Roster List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
            {attendanceRoster.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No students enrolled in this course or class yet.
              </div>
            ) : (
              attendanceRoster.map((student) => (
              <div
                key={student.studentId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: '#fafafa',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                    {student.studentName}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Roll: {student.rollNo}
                  </span>
                </div>

                {/* Present, Absent, Late Options */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[
                    { key: 'PRESENT', label: 'Present' },
                    { key: 'LATE', label: 'Late' },
                    { key: 'ABSENT', label: 'Absent' },
                  ].map((opt) => {
                    const isSelected = student.status === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSetStudentStatus(student.studentId, opt.key)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          background: isSelected ? '#111111' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#333333',
                          border: `1px solid ${isSelected ? '#111111' : 'var(--border)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )))}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Note: Existing attendance for this session date will be updated, preventing duplicate logs.
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="secondary" onClick={() => setAttendanceModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={savingAttendance}
                onClick={handleSaveAttendance}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={15} /> Save Attendance
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
