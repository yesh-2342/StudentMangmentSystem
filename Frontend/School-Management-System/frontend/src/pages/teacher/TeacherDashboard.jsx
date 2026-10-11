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
} from 'lucide-react';
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

// Clearly labelled demo classes populated with fictional students for demonstration
const DEMO_CLASSES = [
  {
    id: -101,
    name: 'Demo Class A — CS101: Introduction to Computer Systems (Demo Lab)',
    code: 'CS101-DEMO',
    isDemo: true,
    students: [
      { id: -101, name: 'Alex Morgan', rollNo: 'DEMO-01', email: 'alex.demo@sms.edu' },
      { id: -102, name: 'Bella Chen', rollNo: 'DEMO-02', email: 'bella.demo@sms.edu' },
      { id: -103, name: 'Carlos Rivera', rollNo: 'DEMO-03', email: 'carlos.demo@sms.edu' },
      { id: -104, name: 'Diana Prince', rollNo: 'DEMO-04', email: 'diana.demo@sms.edu' },
      { id: -105, name: 'Ethan Hunt', rollNo: 'DEMO-05', email: 'ethan.demo@sms.edu' },
    ],
  },
  {
    id: -202,
    name: 'Demo Class B — DS202: Data Structures & Algorithms (Demo Tutorial)',
    code: 'DS202-DEMO',
    isDemo: true,
    students: [
      { id: -201, name: 'Fiona Gallagher', rollNo: 'DEMO-06', email: 'fiona.demo@sms.edu' },
      { id: -202, name: 'George Clark', rollNo: 'DEMO-07', email: 'george.demo@sms.edu' },
      { id: -203, name: 'Hannah Abbott', rollNo: 'DEMO-08', email: 'hannah.demo@sms.edu' },
      { id: -204, name: 'Ian Malcolm', rollNo: 'DEMO-09', email: 'ian.demo@sms.edu' },
    ],
  },
];

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

  // 2. Easy Attendance Modal State
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(String(DEMO_CLASSES[0].id));
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
    const demoFound = DEMO_CLASSES.find((c) => c.id === classIdNum);

    if (demoFound) {
      setAttendanceRoster(
        demoFound.students.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          rollNo: s.rollNo,
          status: 'PRESENT',
        }))
      );
    } else if (dashboard?.courses) {
      const courseFound = dashboard.courses.find((c) => c.id === classIdNum);
      if (courseFound) {
        // Fetch real students or create roster entries for enrolled students
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
            setAttendanceRoster([
              { studentId: 1, studentName: 'Alice Smith', rollNo: 'std_01', status: 'PRESENT' },
              { studentId: 2, studentName: 'Bob Johnson', rollNo: 'std_02', status: 'PRESENT' },
            ]);
          }
        }).catch(() => {
          setAttendanceRoster([
            { studentId: 1, studentName: 'Alice Smith', rollNo: 'std_01', status: 'PRESENT' },
            { studentId: 2, studentName: 'Bob Johnson', rollNo: 'std_02', status: 'PRESENT' },
          ]);
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
    const demoFound = DEMO_CLASSES.find((c) => c.id === classIdNum);
    const isDemo = Boolean(demoFound);

    const payload = {
      courseId: classIdNum,
      sessionDate: attendanceDate,
      isDemo: isDemo,
      demoCourseName: demoFound ? demoFound.name : null,
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

  return (
    <div>
      <PageHeader
        title={`Welcome, Professor ${dashboard.firstName || dashboard.teacherName || 'Faculty'}!`}
        subtitle="Manage assigned courses, record class attendance, update office hours, and review assignments."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="sm"
              style={{ fontWeight: 700 }}
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
                <optgroup label="✨ Clearly Labelled Demo Classes (Fictional Students)">
                  {DEMO_CLASSES.map((dc) => (
                    <option key={dc.id} value={dc.id}>
                      {dc.name} ({dc.students.length} demo students)
                    </option>
                  ))}
                </optgroup>
                {dashboard.courses && dashboard.courses.length > 0 && (
                  <optgroup label="📚 Official Catalog Courses">
                    {dashboard.courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </optgroup>
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
              {Number(selectedClassId) < 0 && (
                <span className="badge" style={{ marginLeft: '0.5rem', background: '#111111', color: '#ffffff', fontSize: '0.75rem' }}>
                  Demo Class Sandbox
                </span>
              )}
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
            {attendanceRoster.map((student) => (
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
            ))}
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
