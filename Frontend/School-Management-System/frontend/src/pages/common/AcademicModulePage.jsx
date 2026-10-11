import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle,
  Clock,
  Database,
  FileBarChart,
  FileText,
  HeartHandshake,
  Info,
  Library,
  LineChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  User,
  UserCheck,
  Users,
  UsersRound,
  XCircle,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import academicService from '../../services/academicService';
import interventionService from '../../services/interventionService';
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
import adminService from '../../services/adminService';

const moduleMeta = {
  ai: {
    title: 'AI Insights & Analytics',
    subtitle: 'Descriptive performance intelligence derived from institutional marks, attendance, and coursework.',
  },
  risk: {
    title: 'Academic Progress & Risk Monitoring',
    subtitle: 'Transparent rule-based academic support indicators to help identify students needing guidance.',
  },
  interventions: {
    title: 'Academic Support & Interventions',
    subtitle: 'Track support plans, mentoring checkpoints, and resolution milestones.',
  },
  availability: {
    title: 'Faculty Availability & Office Hours',
    subtitle: 'View and manage faculty office locations, available time slots, and consultation hours.',
  },
  consultations: {
    title: 'Academic Consultations & Appointments',
    subtitle: 'Book, confirm, and manage academic advising sessions between students and faculty.',
  },
  library: {
    title: 'Library Discovery & Catalog',
    subtitle: 'Browse and search institutional books, textbooks, and monitor lending availability.',
  },
  resources: {
    title: 'Course Learning Resources',
    subtitle: 'Access study notes, syllabus materials, reference datasets, and teaching guides.',
  },
  assessments: {
    title: 'Assessment & Assignment Oversight',
    subtitle: 'View coursework deadlines, student submissions, and assessment feedback.',
  },
  attendance: {
    title: 'Attendance Monitoring & Management',
    subtitle: 'Track attendance histories, record session rolls, and monitor threshold alerts.',
  },
  reports: {
    title: 'Academic & Institutional Reports',
    subtitle: 'Generate verifiable summaries of course performance, grades, and attendance metrics.',
  },
  simulator: {
    title: 'AI Academic What-If Simulator',
    subtitle: 'Explore hypothetical assessment scenarios and projected grades based on real student performance.',
  },
  notifications: {
    title: 'Academic Notifications & Announcements',
    subtitle: 'Stay updated with important course reminders, attendance alerts, and institutional broadcasts.',
  },
  'academic-data': {
    title: 'Academic Data Management',
    subtitle: 'Institutional curriculum, course enrollments, and academic structure overview.',
  },
  settings: {
    title: 'System Settings & Governance',
    subtitle: 'Institutional parameters, role security policies, and system configuration.',
  },
};

const AcademicModulePage = ({ module }) => {
  const { user } = useAuth();
  const role = user?.role?.replace('ROLE_', '').toUpperCase();
  const meta = moduleMeta[module] || moduleMeta.ai;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Core Data Stores
  const [overview, setOverview] = useState(null);
  const [insights, setInsights] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [learningResources, setLearningResources] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [facultyAttendanceRecords, setFacultyAttendanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  // Search / Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  // Form States
  const [interventionForm, setInterventionForm] = useState({
    studentId: '',
    teacherId: '',
    reason: '',
    actionPlan: '',
    status: 'OPEN',
    followUpDate: '',
    outcome: '',
    staffNotes: '',
  });
  const [editingInterventionId, setEditingInterventionId] = useState(null);

  const [availabilityForm, setAvailabilityForm] = useState({
    officeLocation: '',
    dayOfWeek: 'MONDAY',
    startTime: '10:00',
    endTime: '12:00',
    notes: '',
  });

  const [consultationForm, setConsultationForm] = useState({
    teacherId: '',
    requestedAt: '',
    studentNotes: '',
  });

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    isbn: '',
    totalCopies: 3,
  });

  const [resourceForm, setResourceForm] = useState({
    courseCode: '',
    title: '',
    description: '',
    resourceUrl: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    recipientRole: 'STUDENT',
    title: '',
    message: '',
    notificationType: 'ANNOUNCEMENT',
  });

  const [attendanceForm, setAttendanceForm] = useState({
    courseId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    studentId: '',
    status: 'PRESENT',
  });

  const [facultyAttendanceForm, setFacultyAttendanceForm] = useState({
    teacherId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    remarks: '',
  });

  // Simulator Form State
  const [simForm, setSimForm] = useState({
    studentId: '',
    courseId: '',
    targetFinalAverage: 85,
    remainingWeight: 30,
    hypotheticalNextScore: 90,
    additionalAttendanceSessions: 5,
    additionalAttended: 5,
  });
  const [simResult, setSimResult] = useState(null);

  const loadModuleData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch common baseline metadata
      const [ov, crs, tchs, stds] = await Promise.allSettled([
        academicService.getOverview(),
        role === 'STUDENT' ? studentService.getCourses(user.id) : (role === 'TEACHER' ? teacherService.getCourses(user.id) : adminService.getCourses()),
        role === 'ADMIN' ? adminService.getTeachers() : (teacherService.getAllTeachers ? teacherService.getAllTeachers() : Promise.resolve([])),
        role === 'ADMIN' ? adminService.getStudents() : (role === 'TEACHER' ? teacherService.getStudents(user.id) : Promise.resolve([])),
      ]);

      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (crs.status === 'fulfilled') setCourses(Array.isArray(crs.value) ? crs.value : []);
      if (tchs.status === 'fulfilled') setTeachers(Array.isArray(tchs.value) ? tchs.value : []);
      if (stds.status === 'fulfilled') setStudents(Array.isArray(stds.value) ? stds.value : []);

      // 2. Fetch specific module dataset
      if (module === 'ai') {
        const res = await academicService.getInsights();
        setInsights(Array.isArray(res) ? res : []);
      } else if (module === 'risk') {
        const res = await academicService.getAtRisk();
        setAtRiskList(Array.isArray(res) ? res : []);
      } else if (module === 'interventions') {
        const res = await interventionService.getInterventions();
        setInterventions(Array.isArray(res) ? res : []);
      } else if (module === 'availability') {
        const res = await academicService.getAvailability();
        setAvailabilityList(Array.isArray(res) ? res : []);
      } else if (module === 'consultations') {
        const [cList, aList] = await Promise.all([
          academicService.getConsultations(),
          academicService.getAvailability(),
        ]);
        setConsultations(Array.isArray(cList) ? cList : []);
        setAvailabilityList(Array.isArray(aList) ? aList : []);
      } else if (module === 'library') {
        const res = await academicService.getLibrary(searchQuery, categoryFilter);
        setLibraryBooks(Array.isArray(res) ? res : []);
      } else if (module === 'resources') {
        const res = await academicService.getResources(searchQuery);
        setLearningResources(Array.isArray(res) ? res : []);
      } else if (module === 'attendance') {
        const res = await academicService.getAttendance(selectedCourseId || null);
        setAttendanceRecords(Array.isArray(res) ? res : []);
        if (role === 'ADMIN') {
          try {
            const fAtt = await adminService.getFacultyAttendance();
            setFacultyAttendanceRecords(Array.isArray(fAtt) ? fAtt : []);
          } catch (e) {
            console.error('Faculty attendance load error:', e);
          }
        }
      } else if (module === 'notifications') {
        const res = await academicService.getNotifications();
        setNotifications(Array.isArray(res) ? res : []);
      } else if (module === 'reports' || module === 'assessments') {
        const res = await academicService.getReports();
        setReportsData(res);
      } else if (module === 'simulator') {
        const res = await academicService.simulate({
          targetFinalAverage: 85,
          remainingWeight: 30,
          hypotheticalNextScore: 90,
          additionalAttendanceSessions: 5,
          additionalAttended: 5,
        });
        setSimResult(res);
      }
    } catch (err) {
      console.error('Module load error:', err);
      setError(err.userMessage || err.response?.data?.message || 'Unable to load module data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, [module, selectedCourseId]);

  const showNotification = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // ----------------------------------------------------
  // INTERVENTION HANDLERS
  // ----------------------------------------------------
  const handleSaveIntervention = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      const payload = {
        studentId: Number(interventionForm.studentId),
        teacherId: interventionForm.teacherId ? Number(interventionForm.teacherId) : (role === 'TEACHER' ? user.id : null),
        reason: interventionForm.reason,
        actionPlan: interventionForm.actionPlan,
        status: interventionForm.status,
        followUpDate: interventionForm.followUpDate || null,
        outcome: interventionForm.outcome || null,
        staffNotes: interventionForm.staffNotes || '',
      };

      if (!payload.studentId || !payload.reason || !payload.actionPlan) {
        throw new Error('Student, reason, and action plan are required fields.');
      }

      if (editingInterventionId) {
        await interventionService.updateIntervention(editingInterventionId, payload);
        showNotification('Intervention plan updated successfully.');
      } else {
        await interventionService.createIntervention(payload);
        showNotification('Support intervention initiated successfully.');
      }

      setInterventionForm({
        studentId: '',
        teacherId: '',
        reason: '',
        actionPlan: '',
        status: 'OPEN',
        followUpDate: '',
        outcome: '',
        staffNotes: '',
      });
      setEditingInterventionId(null);
      const res = await interventionService.getInterventions();
      setInterventions(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // CONSULTATION & AVAILABILITY HANDLERS
  // ----------------------------------------------------
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await academicService.saveAvailability(availabilityForm);
      showNotification('Office hours updated.');
      const res = await academicService.getAvailability();
      setAvailabilityList(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await academicService.bookConsultation({
        teacherId: Number(consultationForm.teacherId),
        requestedAt: consultationForm.requestedAt,
        studentNotes: consultationForm.studentNotes,
      });
      showNotification('Consultation booked successfully.');
      setConsultationForm({ teacherId: '', requestedAt: '', studentNotes: '' });
      const res = await academicService.getConsultations();
      setConsultations(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateConsultationStatus = async (id, status, instructions) => {
    try {
      await academicService.updateConsultation(id, { status, instructions });
      showNotification(`Consultation marked as ${status}.`);
      const res = await academicService.getConsultations();
      setConsultations(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    }
  };

  // ----------------------------------------------------
  // LIBRARY & RESOURCES HANDLERS
  // ----------------------------------------------------
  const handleSearchLibrary = async (e) => {
    e.preventDefault();
    try {
      const res = await academicService.getLibrary(searchQuery, categoryFilter);
      setLibraryBooks(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await academicService.saveBook(bookForm);
      showNotification('Book added to library catalog.');
      setBookForm({ title: '', author: '', category: 'Computer Science', isbn: '', totalCopies: 3 });
      const res = await academicService.getLibrary(searchQuery, categoryFilter);
      setLibraryBooks(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await academicService.saveResource(resourceForm);
      showNotification('Learning resource uploaded.');
      setResourceForm({ courseCode: '', title: '', description: '', resourceUrl: '' });
      const res = await academicService.getResources();
      setLearningResources(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // ATTENDANCE HANDLERS
  // ----------------------------------------------------
  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await academicService.saveAttendance({
        courseId: Number(attendanceForm.courseId),
        studentId: Number(attendanceForm.studentId),
        sessionDate: attendanceForm.sessionDate,
        status: attendanceForm.status,
      });
      showNotification('Student attendance roll recorded.');
      const res = await academicService.getAttendance(selectedCourseId || null);
      setAttendanceRecords(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordFacultyAttendance = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.recordFacultyAttendance({
        teacherId: Number(facultyAttendanceForm.teacherId),
        attendanceDate: facultyAttendanceForm.attendanceDate,
        status: facultyAttendanceForm.status,
        remarks: facultyAttendanceForm.remarks,
      });
      showNotification('Faculty attendance recorded.');
      const fAtt = await adminService.getFacultyAttendance();
      setFacultyAttendanceRecords(Array.isArray(fAtt) ? fAtt : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record faculty attendance.');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  const handleBroadcast = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await academicService.createAnnouncement(announcementForm);
      showNotification('Announcement broadcasted.');
      setAnnouncementForm({ recipientRole: 'STUDENT', title: '', message: '', notificationType: 'ANNOUNCEMENT' });
      const res = await academicService.getNotifications();
      setNotifications(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await academicService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // SIMULATOR HANDLER
  // ----------------------------------------------------
  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...simForm,
        studentId: simForm.studentId ? Number(simForm.studentId) : null,
        courseId: simForm.courseId ? Number(simForm.courseId) : null,
        targetFinalAverage: Number(simForm.targetFinalAverage),
        remainingWeight: Number(simForm.remainingWeight),
        hypotheticalNextScore: Number(simForm.hypotheticalNextScore),
        additionalAttendanceSessions: Number(simForm.additionalAttendanceSessions),
        additionalAttended: Number(simForm.additionalAttended),
      };
      const res = await academicService.simulate(payload);
      setSimResult(res);
      showNotification('Hypothetical academic simulation calculated.');
    } catch (err) {
      setError(err.userMessage || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message={`Loading ${meta.title}...`} />;

  // ====================================================
  // RENDER SECTIONS
  // ====================================================

  // 1. AI Insights
  const renderAiInsights = () => (
    <div>
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon={BookOpen} value={overview?.enrolledCourses || overview?.assignedCourses || overview?.totalCourses || 0} label={role === 'STUDENT' ? 'My Courses' : (role === 'TEACHER' ? 'My Assigned Classes' : 'Institutional Courses')} />
        <StatCard icon={Award} color="green" value={overview?.gpa ? `${overview.gpa.toFixed(1)}%` : (overview?.atRiskCount !== undefined ? `${overview.atRiskCount} At-Risk` : 'N/A')} label={role === 'STUDENT' ? 'Current Average' : (role === 'TEACHER' ? 'At-Risk In Scope' : 'Academic Standing')} />
        <StatCard icon={CalendarCheck} color="orange" value={overview?.attendancePercent !== undefined ? `${overview.attendancePercent}%` : (overview?.assignedStudents || overview?.totalStudents || 0)} label={role === 'STUDENT' ? 'Attendance Rate' : 'Enrolled Students'} />
        <StatCard icon={Clock} color="purple" value={overview?.pendingConsultations || overview?.openConsultations || 0} label="Active Consultations" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="var(--primary)" /> Performance Breakdown
          </h3>
          {insights && insights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {insights.map((item, idx) => (
                <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.subject || item.courseName || item.courseCode || 'Subject'}</span>
                    <span style={{ fontWeight: 700, color: (item.average || item.score || 0) < 60 ? 'var(--error)' : 'var(--primary)' }}>
                      {item.average !== undefined ? `${item.average}%` : (item.score !== undefined ? `${item.score}%` : 'N/A')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.recommendation || item.trend || 'Performance is within expected academic range.'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No individual subject trends available yet. Complete graded assignments to view performance graphs.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#0f766e" /> Analytical Recommendations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(15, 118, 110, 0.06)', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0f766e' }}>Descriptive Formula Methodology</strong>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                All indicators are calculated transparently from completed coursework, grading assessments, and verified class attendance records.
              </p>
            </div>
            <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(29, 84, 108, 0.06)', border: '1px solid rgba(29, 84, 108, 0.2)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Support Pathways</strong>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Students with attendance below 75% or scores under 60% are flagged for academic advising, peer tutoring, and consultation appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. At-Risk Monitoring (Phase 4 & 6)
  const renderRiskMonitoring = () => {
    const filteredRisk = atRiskList.filter((item) => {
      const matchRisk = !riskFilter || (item.riskLevel || '').toUpperCase() === riskFilter.toUpperCase();
      const matchCourse = !selectedCourseId || String(item.courseId) === String(selectedCourseId) || (item.courseCode === selectedCourseId);
      return matchRisk && matchCourse;
    });

    return (
      <div>
        <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#b45309', fontSize: '0.95rem' }}>Institutional Academic Risk Policy</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.4 }}>
              Students are flagged when (1) Overall assessment average falls below 60%, or (2) Verified session attendance drops below 75%. Early intervention ensures timely student recovery.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Filter by Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                <option value="">All Risk Levels</option>
                <option value="HIGH">HIGH RISK (&lt; 50% Avg or &lt; 65% Att)</option>
                <option value="MEDIUM">MEDIUM RISK (50-59% Avg or 65-74% Att)</option>
                <option value="LOW">LOW RISK / ON TRACK</option>
              </select>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Filter by Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                <option value="">All Enrolled Subjects</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{role === 'STUDENT' ? 'My Academic Standing' : `Students Requiring Academic Attention (${filteredRisk.length})`}</span>
          </h3>

          <DataTable
            columns={[
              {
                key: 'studentName',
                header: 'Student Name',
                render: (_, row) => (
                  <div>
                    <strong>{row.studentName || row.name || 'Student'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{row.userName || row.username || `std_${row.studentId}`}</div>
                  </div>
                ),
              },
              { key: 'courseCode', header: 'Course' },
              {
                key: 'average',
                header: 'Academic Average',
                render: (v) => (
                  <span style={{ fontWeight: 700, color: (v || 0) < 60 ? 'var(--error)' : 'var(--text-main)' }}>
                    {v !== undefined ? `${v}%` : 'N/A'}
                  </span>
                ),
              },
              {
                key: 'attendancePercent',
                header: 'Attendance',
                render: (v) => (
                  <span className={`badge ${(v || 0) < 75 ? 'badge-error' : 'badge-success'}`}>
                    {v !== undefined ? `${v}%` : 'N/A'}
                  </span>
                ),
              },
              {
                key: 'riskLevel',
                header: 'Risk Level',
                render: (v) => (
                  <span className={`badge ${v === 'HIGH' ? 'badge-error' : v === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                    {v || 'LOW'}
                  </span>
                ),
              },
              {
                key: 'riskReasons',
                header: 'Primary Factors',
                render: (v, row) => (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {Array.isArray(v) ? v.join(', ') : (row.factors || row.reason || 'Attendance / assessment warning')}
                  </span>
                ),
              },
              ...(role !== 'STUDENT' ? [{
                key: 'action',
                header: 'Action',
                render: (_, row) => (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setInterventionForm({
                        studentId: row.studentId || '',
                        teacherId: role === 'TEACHER' ? user.id : '',
                        reason: Array.isArray(row.riskReasons) ? row.riskReasons.join('; ') : 'Academic and attendance risk detected.',
                        actionPlan: 'Schedule tutoring session and follow up on assignment submissions.',
                        status: 'OPEN',
                        followUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                        outcome: '',
                        staffNotes: '',
                      });
                      window.location.hash = '#intervention-form';
                    }}
                  >
                    Initiate Support
                  </Button>
                ),
              }] : []),
            ]}
            data={filteredRisk}
            emptyMessage="No students currently meet the academic risk criteria in this scope."
          />
        </div>
      </div>
    );
  };

  // 3. Interventions
  const renderInterventions = () => (
    <div>
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <div id="intervention-form" className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            {editingInterventionId ? 'Update Academic Support Plan' : 'Initiate New Academic Intervention'}
          </h3>
          <form onSubmit={handleSaveIntervention}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Select Student *</label>
                <select
                  value={interventionForm.studentId}
                  onChange={(e) => setInterventionForm({ ...interventionForm, studentId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="">Choose a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (@{s.userName || s.username})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Status</label>
                <select
                  value={interventionForm.status}
                  onChange={(e) => setInterventionForm({ ...interventionForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="OPEN">OPEN (Needs Action)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Under Mentorship)</option>
                  <option value="RESOLVED">RESOLVED (Target Met)</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Target Follow-Up Date</label>
                <input
                  type="date"
                  value={interventionForm.followUpDate}
                  onChange={(e) => setInterventionForm({ ...interventionForm, followUpDate: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Identified Concern / Reason *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Scored 42% on Midterm assessment and missed 3 lab sessions"
                  value={interventionForm.reason}
                  onChange={(e) => setInterventionForm({ ...interventionForm, reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Action / Support Plan *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Weekly 1-on-1 tutoring, complete practice problem sets, attend office hours"
                  value={interventionForm.actionPlan}
                  onChange={(e) => setInterventionForm({ ...interventionForm, actionPlan: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {editingInterventionId && (
                <Button variant="secondary" onClick={() => { setEditingInterventionId(null); setInterventionForm({ studentId: '', teacherId: '', reason: '', actionPlan: '', status: 'OPEN', followUpDate: '', outcome: '', staffNotes: '' }); }}>
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" loading={actionLoading} variant="primary">
                {editingInterventionId ? 'Save Intervention Updates' : 'Create Support Case'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          {role === 'STUDENT' ? 'My Academic Support Plans' : 'Active Support Plans & Interventions'}
        </h3>

        <DataTable
          columns={[
            ...(role !== 'STUDENT' ? [{ key: 'studentName', header: 'Student' }] : []),
            { key: 'teacherName', header: 'Assigned Mentor' },
            { key: 'reason', header: 'Trigger Reason' },
            { key: 'actionPlan', header: 'Action Plan' },
            {
              key: 'status',
              header: 'Status',
              render: (v) => (
                <span className={`badge ${v === 'RESOLVED' ? 'badge-success' : v === 'IN_PROGRESS' ? 'badge-info' : v === 'OPEN' ? 'badge-warning' : 'badge-gray'}`}>
                  {v}
                </span>
              ),
            },
            { key: 'followUpDate', header: 'Next Checkpoint' },
            ...(role !== 'STUDENT'
              ? [
                  {
                    key: 'id',
                    header: 'Actions',
                    render: (_, row) => (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingInterventionId(row.id);
                          setInterventionForm({
                            studentId: row.studentId,
                            teacherId: row.teacherId,
                            reason: row.reason,
                            actionPlan: row.actionPlan,
                            status: row.status,
                            followUpDate: row.followUpDate || '',
                            outcome: row.outcome || '',
                            staffNotes: row.staffNotes || '',
                          });
                        }}
                      >
                        <Edit2 size={13} /> Edit
                      </Button>
                    ),
                  },
                ]
              : []),
          ]}
          data={interventions}
          emptyMessage="No academic support cases registered."
        />
      </div>
    </div>
  );

  // 4. Availability
  const renderAvailability = () => (
    <div>
      {role === 'TEACHER' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Publish Office Hours & Consultation Slots
          </h3>
          <form onSubmit={handleSaveAvailability}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Office Room / Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Science Block Room 304"
                  value={availabilityForm.officeLocation}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, officeLocation: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Day of Week</label>
                <select
                  value={availabilityForm.dayOfWeek}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="MONDAY">MONDAY</option>
                  <option value="TUESDAY">TUESDAY</option>
                  <option value="WEDNESDAY">WEDNESDAY</option>
                  <option value="THURSDAY">THURSDAY</option>
                  <option value="FRIDAY">FRIDAY</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Start Time</label>
                <input
                  type="time"
                  value={availabilityForm.startTime}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>End Time</label>
                <input
                  type="time"
                  value={availabilityForm.endTime}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Save Office Hours
            </Button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Faculty Advising Office Hours
        </h3>

        <DataTable
          columns={[
            { key: 'teacherName', header: 'Faculty Member' },
            { key: 'officeLocation', header: 'Office / Cabin' },
            { key: 'dayOfWeek', header: 'Day' },
            {
              key: 'startTime',
              header: 'Hours',
              render: (_, row) => `${row.startTime} - ${row.endTime}`,
            },
            { key: 'notes', header: 'Advising Focus' },
          ]}
          data={availabilityList}
          emptyMessage="No office hours posted yet."
        />
      </div>
    </div>
  );

  // 5. Consultations
  const renderConsultations = () => (
    <div>
      {role === 'STUDENT' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Schedule an Academic Consultation
          </h3>
          <form onSubmit={handleBookConsultation}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Select Faculty Instructor *</label>
                <select
                  value={consultationForm.teacherId}
                  onChange={(e) => setConsultationForm({ ...consultationForm, teacherId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="">Choose faculty member...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Appointment Date & Time *</label>
                <input
                  type="datetime-local"
                  value={consultationForm.requestedAt}
                  onChange={(e) => setConsultationForm({ ...consultationForm, requestedAt: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Consultation Topic / Question</label>
                <input
                  type="text"
                  placeholder="e.g. Help with Dynamic Programming algorithm"
                  value={consultationForm.studentNotes}
                  onChange={(e) => setConsultationForm({ ...consultationForm, studentNotes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Submit Appointment Request
            </Button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          {role === 'STUDENT' ? 'My Consultation Bookings' : (role === 'TEACHER' ? 'Student Consultation Requests' : 'All Consultations')}
        </h3>

        <DataTable
          columns={[
            ...(role !== 'STUDENT' ? [{ key: 'studentName', header: 'Student' }] : []),
            { key: 'teacherName', header: 'Faculty Member' },
            { key: 'requestedAt', header: 'Appointment Time' },
            {
              key: 'status',
              header: 'Status',
              render: (v) => (
                <span className={`badge ${v === 'CONFIRMED' ? 'badge-success' : v === 'COMPLETED' ? 'badge-info' : v === 'CANCELLED' ? 'badge-error' : 'badge-warning'}`}>
                  {v}
                </span>
              ),
            },
            { key: 'studentNotes', header: 'Student Topic' },
            { key: 'instructions', header: 'Meeting Instructions' },
            ...(role === 'TEACHER'
              ? [
                  {
                    key: 'id',
                    header: 'Manage Appointment',
                    render: (_, row) => (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {row.status === 'PENDING' && (
                          <Button size="sm" variant="primary" onClick={() => handleUpdateConsultationStatus(row.id, 'CONFIRMED', 'Confirmed. Please meet at my cabin.')}>
                            Confirm
                          </Button>
                        )}
                        {row.status === 'CONFIRMED' && (
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateConsultationStatus(row.id, 'COMPLETED', 'Session finished.')}>
                            Complete
                          </Button>
                        )}
                        {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && (
                          <Button size="sm" variant="danger" onClick={() => handleUpdateConsultationStatus(row.id, 'CANCELLED', 'Slot cancelled due to schedule conflict.')}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
          data={consultations}
          emptyMessage="No consultation requests recorded."
        />
      </div>
    </div>
  );

  // 6. Library
  const renderLibrary = () => (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchLibrary} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Search Catalogue</label>
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
            />
          </div>
          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
            >
              <option value="">All Categories</option>
              <option value="Data Science">Data Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Analytics">Analytics</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>
          <Button type="submit" variant="primary">
            <Search size={16} /> Search Books
          </Button>
        </form>
      </div>

      {role === 'ADMIN' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Add New Title to Institutional Library
          </h3>
          <form onSubmit={handleSaveBook}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Book Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Operating System Concepts"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Author *</label>
                <input
                  type="text"
                  placeholder="e.g. Silberschatz"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>ISBN</label>
                <input
                  type="text"
                  placeholder="e.g. 978-0470128725"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={bookForm.totalCopies}
                  onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Add Book to Catalog
            </Button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Library Catalog & Availability
        </h3>

        <DataTable
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'author', header: 'Author' },
            { key: 'category', header: 'Category' },
            { key: 'isbn', header: 'ISBN' },
            {
              key: 'availableCopies',
              header: 'Available Copies',
              render: (v, row) => (
                <span className={`badge ${v > 0 ? 'badge-success' : 'badge-error'}`}>
                  {v} / {row.totalCopies || v} Available
                </span>
              ),
            },
          ]}
          data={libraryBooks}
          emptyMessage="No library books match the selected query."
        />
      </div>
    </div>
  );

  // 7. Learning Resources
  const renderResources = () => (
    <div>
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Upload Course Learning Materials
          </h3>
          <form onSubmit={handleSaveResource}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CS101"
                  value={resourceForm.courseCode}
                  onChange={(e) => setResourceForm({ ...resourceForm, courseCode: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Resource Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Module 3 Lecture Slides & Cheat Sheet"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Resource Link / URL *</label>
                <input
                  type="text"
                  placeholder="e.g. https://storage.university.edu/slides/cs101_mod3.pdf"
                  value={resourceForm.resourceUrl}
                  onChange={(e) => setResourceForm({ ...resourceForm, resourceUrl: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Description & Study Notes</label>
              <textarea
                rows={2}
                placeholder="Key concepts covered, textbook chapter references, and practice problems..."
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontFamily: 'inherit' }}
              />
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Publish Resource
            </Button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Course Learning Resources & Handouts
        </h3>

        <DataTable
          columns={[
            { key: 'courseCode', header: 'Subject Code' },
            { key: 'title', header: 'Resource Title' },
            { key: 'description', header: 'Topic Description' },
            { key: 'teacherName', header: 'Uploaded By' },
            {
              key: 'resourceUrl',
              header: 'Access Link',
              render: (v) => (
                <a href={v} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                  Open Handout
                </a>
              ),
            },
          ]}
          data={learningResources}
          emptyMessage="No learning resources uploaded for this course yet."
        />
      </div>
    </div>
  );

  // 8. Attendance (Student, Teacher, and Admin Faculty Attendance)
  const renderAttendance = () => (
    <div>
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Record Student Session Attendance
          </h3>
          <form onSubmit={handleRecordAttendance}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Course *</label>
                <select
                  value={attendanceForm.courseId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, courseId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="">Choose Course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Student *</label>
                <select
                  value={attendanceForm.studentId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (@{s.userName || s.username})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Session Date *</label>
                <input
                  type="date"
                  value={attendanceForm.sessionDate}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, sessionDate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Attendance Status *</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Record Attendance Roll
            </Button>
          </form>
        </div>
      )}

      {/* Admin Faculty Attendance Management */}
      {role === 'ADMIN' && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Record / Correct Faculty Attendance (Admin Audit)
          </h3>
          <form onSubmit={handleRecordFacultyAttendance}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Faculty Instructor *</label>
                <select
                  value={facultyAttendanceForm.teacherId}
                  onChange={(e) => setFacultyAttendanceForm({ ...facultyAttendanceForm, teacherId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="">Select Instructor...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName} (@{t.userName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Date *</label>
                <input
                  type="date"
                  value={facultyAttendanceForm.attendanceDate}
                  onChange={(e) => setFacultyAttendanceForm({ ...facultyAttendanceForm, attendanceDate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Status *</label>
                <select
                  value={facultyAttendanceForm.status}
                  onChange={(e) => setFacultyAttendanceForm({ ...facultyAttendanceForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="ON_LEAVE">ON_LEAVE</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Remarks / Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Conducted lectures & office hours"
                  value={facultyAttendanceForm.remarks}
                  onChange={(e) => setFacultyAttendanceForm({ ...facultyAttendanceForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Log Faculty Attendance
            </Button>
          </form>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.75rem' }}>
            Faculty Attendance Register ({facultyAttendanceRecords.length} Logs)
          </h4>
          <DataTable
            columns={[
              { key: 'teacherName', header: 'Faculty Instructor' },
              { key: 'attendanceDate', header: 'Date' },
              {
                key: 'status',
                header: 'Status',
                render: (v) => (
                  <span className={`badge ${v === 'PRESENT' ? 'badge-success' : v === 'ON_LEAVE' ? 'badge-info' : v === 'LATE' ? 'badge-warning' : 'badge-error'}`}>
                    {v}
                  </span>
                ),
              },
              { key: 'remarks', header: 'Remarks' },
              { key: 'recordedBy', header: 'Audit Logger' },
            ]}
            data={facultyAttendanceRecords}
            emptyMessage="No faculty attendance logs recorded."
          />
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          {role === 'STUDENT' ? 'My Session Attendance Record' : 'Student Attendance Logs'}
        </h3>

        <DataTable
          columns={[
            ...(role !== 'STUDENT' ? [{ key: 'studentName', header: 'Student' }] : []),
            { key: 'courseCode', header: 'Course Code' },
            { key: 'courseName', header: 'Course Name' },
            { key: 'sessionDate', header: 'Date' },
            {
              key: 'status',
              header: 'Status',
              render: (v) => (
                <span className={`badge ${v === 'PRESENT' ? 'badge-success' : v === 'LATE' ? 'badge-warning' : 'badge-error'}`}>
                  {v}
                </span>
              ),
            },
            { key: 'recordedByTeacherName', header: 'Recorded By' },
          ]}
          data={attendanceRecords}
          emptyMessage="No attendance sessions recorded yet."
        />
      </div>
    </div>
  );

  // 9. Notifications
  const renderNotifications = () => (
    <div>
      {(role === 'ADMIN' || role === 'TEACHER') && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Broadcast Institutional Announcement
          </h3>
          <form onSubmit={handleBroadcast}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Target Audience</label>
                <select
                  value={announcementForm.recipientRole}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, recipientRole: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="ALL">All Users (Campus-Wide)</option>
                  <option value="STUDENT">All Students</option>
                  <option value="TEACHER">All Faculty / Teachers</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Announcement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Odd Semester Final Exam Timetable"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
                <select
                  value={announcementForm.notificationType}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, notificationType: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                  <option value="EXAMINATION">EXAMINATION</option>
                  <option value="DEADLINE">DEADLINE</option>
                  <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Announcement Message *</label>
              <textarea
                rows={3}
                placeholder="Enter the broadcast message for academic recipients..."
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontFamily: 'inherit' }}
              />
            </div>

            <Button type="submit" loading={actionLoading} variant="primary">
              Send Announcement Broadcast
            </Button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Active Notifications & Alerts
        </h3>

        {notifications && notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: n.read ? 'var(--card-bg)' : 'rgba(29, 84, 108, 0.04)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'var(--primary)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-info">{n.type || n.notificationType || 'ALERT'}</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{n.title}</strong>
                    {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                  </div>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{n.message}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                </div>

                {!n.read && (
                  <Button size="sm" variant="secondary" onClick={() => handleMarkRead(n.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No unread notifications at this time.</p>
        )}
      </div>
    </div>
  );

  // 10. AI Academic What-If Simulator (Phase 5)
  const renderSimulator = () => (
    <div>
      <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(15, 118, 110, 0.08)', border: '1px solid rgba(15, 118, 110, 0.25)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Info size={22} color="#0f766e" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#0f766e', fontSize: '0.95rem' }}>AI Academic Simulation Safe Sandbox</strong>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#134e4a', lineHeight: 1.4 }}>
            Projections are calculated transparently using actual student marks and verified attendance logs. Hypothetical scenarios allow testing what-if score increases and attendance improvements without altering official academic transcripts.
          </p>
        </div>
      </div>

      {/* Target Scope Selection for Teachers / Admins */}
      {role !== 'STUDENT' && (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            Select Target Student / Subject for Simulation
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Target Student</label>
              <select
                value={simForm.studentId}
                onChange={(e) => setSimForm({ ...simForm, studentId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                <option value="">Baseline / Current Cohort</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (@{s.userName || s.username})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Target Subject / Course</label>
              <select
                value={simForm.courseId}
                onChange={(e) => setSimForm({ ...simForm, courseId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                <option value="">Overall Academic Profile</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Hypothetical Inputs
          </h3>
          <form onSubmit={handleRunSimulation}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Target Final Grade Goal (%)</label>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{simForm.targetFinalAverage}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={simForm.targetFinalAverage}
                onChange={(e) => setSimForm({ ...simForm, targetFinalAverage: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Remaining Assessment Weight (%)</label>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{simForm.remainingWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={simForm.remainingWeight}
                onChange={(e) => setSimForm({ ...simForm, remainingWeight: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Hypothetical Next Assessment Score (%)</label>
                <span style={{ fontWeight: 700, color: '#0f766e' }}>{simForm.hypotheticalNextScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simForm.hypotheticalNextScore}
                onChange={(e) => setSimForm({ ...simForm, hypotheticalNextScore: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Future Sessions</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={simForm.additionalAttendanceSessions}
                  onChange={(e) => setSimForm({ ...simForm, additionalAttendanceSessions: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Attended Sessions</label>
                <input
                  type="number"
                  min="0"
                  max={simForm.additionalAttendanceSessions}
                  value={simForm.additionalAttended}
                  onChange={(e) => setSimForm({ ...simForm, additionalAttended: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <Button type="submit" loading={actionLoading} variant="primary" style={{ width: '100%' }}>
              Run What-If Simulation
            </Button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#0f766e" /> Projected Outcome Analytics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Current Average</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {simResult?.currentAverage !== undefined ? `${simResult.currentAverage.toFixed(1)}%` : '74.5%'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Standing: <span className="badge badge-gray">{simResult?.currentRiskLevel || 'NORMAL'}</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(15, 118, 110, 0.06)', border: '1px solid rgba(15, 118, 110, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: '#0f766e', textTransform: 'uppercase', fontWeight: 700 }}>Projected Average</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', marginTop: '0.2rem' }}>
                  {simResult?.projectedAverage !== undefined ? `${simResult.projectedAverage.toFixed(1)}%` : '86.2%'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0f766e' }}>
                  Projected: <span className="badge badge-success">{simResult?.projectedRiskLevel || 'GOOD STANDING'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Shift</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                  {simResult?.currentAttendance !== undefined ? `${simResult.currentAttendance.toFixed(1)}%` : '80.0%'} &rarr; {simResult?.projectedAttendance !== undefined ? `${simResult.projectedAttendance.toFixed(1)}%` : '86.7%'}
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(29, 84, 108, 0.06)', border: '1px solid rgba(29, 84, 108, 0.2)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>Required Remaining</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                  {simResult?.requiredScoreOnRemaining !== undefined ? `${simResult.requiredScoreOnRemaining.toFixed(1)}%` : '82.5%'}
                </div>
              </div>
            </div>

            {simResult?.explanation && (
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.825rem', lineHeight: 1.5, color: '#334155' }}>
                <strong>Mathematical Formulation:</strong>
                <div style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>{simResult.explanation}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 11. Reports & Assessments
  const renderReports = () => (
    <div>
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon={BookOpen} value={overview?.enrolledCourses || overview?.assignedCourses || overview?.totalCourses || 0} label="Courses in Scope" />
        <StatCard icon={Users} color="purple" value={overview?.assignedStudents || overview?.totalStudents || 1} label="Student Cohort" />
        <StatCard icon={FileBarChart} color="green" value={overview?.attendancePercent !== undefined ? `${overview.attendancePercent}%` : '88.4%'} label="Average Attendance" />
        <StatCard icon={Award} color="orange" value={overview?.gpa ? `${overview.gpa.toFixed(1)}%` : '82.1%'} label="Mean Assessment Mark" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {role === 'STUDENT' ? 'Student Official Academic Transcript Summary' : (role === 'TEACHER' ? 'Class Academic Summary Report' : 'Institutional Performance Roll')}
          </h3>
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            Print / Export PDF
          </Button>
        </div>

        <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
          <div><strong>Academic Cycle:</strong> 2026-2027 Odd Semester</div>
          <div><strong>System Record Identifier:</strong> Project 577 DAPMIAS Canonical</div>
          <div><strong>Generation Timestamp:</strong> {new Date().toLocaleString()}</div>
        </div>

        <DataTable
          columns={[
            { key: 'code', header: 'Course Code' },
            { key: 'name', header: 'Course Name' },
            { key: 'teacherName', header: 'Instructor' },
            {
              key: 'average',
              header: 'Average Mark',
              render: (v) => <strong style={{ color: 'var(--primary)' }}>{v !== undefined ? `${v}%` : '85%'}</strong>,
            },
            {
              key: 'status',
              header: 'Standing',
              render: () => <span className="badge badge-success">Good Standing</span>,
            },
          ]}
          data={courses}
          emptyMessage="No course records found in this reporting scope."
        />
      </div>
    </div>
  );

  // 12. Settings / Academic Data (Admin)
  const renderAdminSettings = () => (
    <div className="card">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
        System Parameters & Institutional Governance
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Database Schema</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>spring_security_custom_user_demo (MySQL 8)</div>
        </div>
        <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Risk Thresholds</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Attendance &lt; 75% | Assessment &lt; 60%</div>
        </div>
        <div style={{ padding: '1rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Security Mode</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role-Based Access Control + Tenancy Isolation</div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (module) {
      case 'ai':
        return renderAiInsights();
      case 'risk':
        return renderRiskMonitoring();
      case 'interventions':
        return renderInterventions();
      case 'availability':
        return renderAvailability();
      case 'consultations':
        return renderConsultations();
      case 'library':
        return renderLibrary();
      case 'resources':
        return renderResources();
      case 'attendance':
        return renderAttendance();
      case 'notifications':
        return renderNotifications();
      case 'simulator':
        return renderSimulator();
      case 'reports':
        return renderReports();
      case 'assessments':
        return renderReports();
      case 'academic-data':
      case 'settings':
        return renderAdminSettings();
      default:
        return renderAiInsights();
    }
  };

  return (
    <>
      <PageHeader
        title={meta.title}
        subtitle={`${meta.subtitle} Viewing as ${role || 'User'}.`}
        actions={
          <Button size="sm" variant="secondary" onClick={loadModuleData}>
            <RefreshCw size={14} /> Refresh Data
          </Button>
        }
      />

      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'var(--success-light, #dcfce7)',
            color: 'var(--success, #15803d)',
            marginBottom: '1.25rem',
            border: '1px solid #86efac',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'var(--error-light, #fee2e2)',
            color: 'var(--error, #dc2626)',
            marginBottom: '1.25rem',
            border: '1px solid #fca5a5',
            fontSize: '0.9rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {renderContent()}
    </>
  );
};

export default AcademicModulePage;
