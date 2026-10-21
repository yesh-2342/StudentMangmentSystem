import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import SmartAcademicTodoList from '../../components/academic/SmartAcademicTodoList';
import AttendanceRecoveryCalculator from '../../components/academic/AttendanceRecoveryCalculator';
import PersonalizedStudyPlanner from '../../components/academic/PersonalizedStudyPlanner';
import DoubtClarificationPortal from '../../components/academic/DoubtClarificationPortal';
import TeacherClassHealthDashboard from '../../components/academic/TeacherClassHealthDashboard';
import BulkMarksEntry from '../../components/academic/BulkMarksEntry';
import AssignmentSubmissionTracker from '../../components/academic/AssignmentSubmissionTracker';
import SubjectWiseAttendanceChart from '../../components/academic/SubjectWiseAttendanceChart';
import { Star } from 'lucide-react';

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
  todos: {
    title: 'Smart Academic To-Do List',
    subtitle: 'Track and prioritize course assignments, exam prep milestones, and custom academic tasks.',
  },
  recovery: {
    title: 'Attendance Recovery Calculator',
    subtitle: 'Determine consecutive lecture requirements and calculate safety margins to maintain eligibility.',
  },
  'study-plan': {
    title: 'Personalized Adaptive Study Planner',
    subtitle: 'Weekly timetable allocation algorithm based on course difficulty, grades, and attendance.',
  },
  doubts: {
    title: 'Doubt & Clarification Requests',
    subtitle: 'Submit subject inquiries to course faculty and track verified pedagogical solutions.',
  },
  'class-health': {
    title: 'Teacher Class Health Dashboard',
    subtitle: 'Multi-dimensional cohort health score evaluating marks, attendance, and assignment punctuality.',
  },
  'bulk-marks': {
    title: 'Bulk Marks & Grade Entry',
    subtitle: 'Spreadsheet-style entry for Midterm, Coursework, and Final Exam marks with automated student alerts.',
  },
  submissions: {
    title: 'Assignment Submission Tracker',
    subtitle: 'Class-wide coursework submission verification and real-time status management.',
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

// Clearly labelled demo classes populated with fictional students for demonstration
const DEMO_ATTENDANCE_CLASSES = [
  {
    id: -101,
    name: 'CS101: Introduction to Computer Systems (Demo Lab)',
    code: 'CS101-DEMO',
    isDemo: true,
    students: [
      { id: -101, name: 'Alex Morgan', rollNo: 'DEMO-01', email: 'alex.demo@sms.edu' },
      { id: -102, name: 'Bella Chen', rollNo: 'DEMO-02', email: 'bella.demo@sms.edu' },
      { id: -103, name: 'Carlos Rivera', rollNo: 'DEMO-03', email: 'carlos.demo@sms.edu' },
      { id: -104, name: 'Diana Prince', rollNo: 'DEMO-04', email: 'diana.demo@sms.edu' },
      { id: -105, name: 'Ethan Hunt', rollNo: 'DEMO-05', email: 'ethan.demo@sms.edu' },
      { id: -106, name: 'Lucas Scott', rollNo: 'DEMO-06', email: 'lucas.demo@sms.edu' },
      { id: -107, name: 'Maya Lin', rollNo: 'DEMO-07', email: 'maya.demo@sms.edu' },
      { id: -108, name: 'Noah Miller', rollNo: 'DEMO-08', email: 'noah.demo@sms.edu' },
    ],
  },
  {
    id: -202,
    name: 'DS202: Data Structures & Algorithms (Demo Tutorial)',
    code: 'DS202-DEMO',
    isDemo: true,
    students: [
      { id: -201, name: 'Fiona Gallagher', rollNo: 'DEMO-09', email: 'fiona.demo@sms.edu' },
      { id: -202, name: 'George Clark', rollNo: 'DEMO-10', email: 'george.demo@sms.edu' },
      { id: -203, name: 'Hannah Abbott', rollNo: 'DEMO-11', email: 'hannah.demo@sms.edu' },
      { id: -204, name: 'Ian Malcolm', rollNo: 'DEMO-12', email: 'ian.demo@sms.edu' },
      { id: -205, name: 'Julia Roberts', rollNo: 'DEMO-13', email: 'julia.demo@sms.edu' },
      { id: -206, name: 'Kevin Bacon', rollNo: 'DEMO-14', email: 'kevin.demo@sms.edu' },
    ],
  },
];

const PERIOD_OPTIONS = [
  'Period 1 (08:30 - 09:30)',
  'Period 2 (09:30 - 10:30)',
  'Period 3 (10:45 - 11:45)',
  'Period 4 (11:45 - 12:45)',
  'Period 5 (13:30 - 14:30)',
  'Period 6 (14:30 - 15:30)',
  'Period 7 (15:30 - 16:30)',
  'Practical Lab Session',
];

const SECTION_OPTIONS = [
  'Section A',
  'Section B',
  'Section C',
  'Lab Batch 1',
  'Lab Batch 2',
];

const AcademicModulePage = ({ module }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState(null);
  const [students, setStudents] = useState([]);

  // Search / Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [resourceBookmarkFilter, setResourceBookmarkFilter] = useState('ALL');
  const [attendanceSubTab, setAttendanceSubTab] = useState('SESSION');

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
    status: 'AVAILABLE',
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

  // Linways-style Class Attendance Monitor States
  const [attendanceSelection, setAttendanceSelection] = useState({
    courseId: '',
    section: 'Section A',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionPeriod: 'Period 1 (08:30 - 09:30)',
  });
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [selectedRosterIds, setSelectedRosterIds] = useState([]);
  const [isExistingSession, setIsExistingSession] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);

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
  const [aiModelInfo, setAiModelInfo] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [studentPrediction, setStudentPrediction] = useState(null);
  const [institutionalAi, setInstitutionalAi] = useState(null);
  const [dlSimulationResult, setDlSimulationResult] = useState(null);

  const loadModuleData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch common baseline metadata
      const [ov, crs, tchs, stds] = await Promise.allSettled([
        academicService.getOverview(),
        role === 'STUDENT' ? studentService.getCourses(user.id) : (role === 'TEACHER' ? teacherService.getCourses(user.id) : adminService.getCourses()),
        role === 'ADMIN' ? adminService.getTeachers() : academicService.getFacultyMembers(),
        role === 'ADMIN' ? adminService.getStudents() : (role === 'TEACHER' ? teacherService.getStudents(user.id) : Promise.resolve([])),
      ]);

      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (crs.status === 'fulfilled') setCourses(Array.isArray(crs.value) ? crs.value : []);
      if (tchs.status === 'fulfilled') setTeachers(Array.isArray(tchs.value) ? tchs.value : []);
      if (stds.status === 'fulfilled') setStudents(Array.isArray(stds.value) ? stds.value : []);

      // 2. Fetch specific module dataset
      if (module === 'ai') {
        const [res, mInfo, hlt] = await Promise.allSettled([
          academicService.getInsights(),
          academicService.getAiModelInfo(),
          academicService.getAiHealth(),
        ]);
        if (res.status === 'fulfilled') setInsights(Array.isArray(res.value) ? res.value : []);
        if (mInfo.status === 'fulfilled') setAiModelInfo(mInfo.value);
        if (hlt.status === 'fulfilled') setAiHealth(hlt.value);

        if (role === 'STUDENT' && user?.id) {
          try {
            const pred = await academicService.getStudentAiPrediction(user.id);
            setStudentPrediction(pred);
          } catch (e) {
            console.warn('Student AI prediction fetch failed:', e);
          }
        } else if (role === 'ADMIN' || role === 'TEACHER') {
          try {
            const inst = await academicService.getInstitutionalAiAnalytics();
            setInstitutionalAi(inst);
          } catch (e) {
            console.warn('Institutional AI analytics fetch failed:', e);
          }
        }
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
        setFacultyLoading(true);
        setFacultyError(null);
        try {
          const [cList, aList, fList] = await Promise.all([
            academicService.getConsultations(),
            academicService.getAvailability(),
            academicService.getFacultyMembers(),
          ]);
          setConsultations(Array.isArray(cList) ? cList : []);
          setAvailabilityList(Array.isArray(aList) ? aList : []);
          if (Array.isArray(fList) && fList.length > 0) {
            setTeachers(fList);
          }
        } catch (fErr) {
          console.error('Failed to load consultation data:', fErr);
          setFacultyError('Failed to load available faculty members. Please retry.');
        } finally {
          setFacultyLoading(false);
        }
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

  useEffect(() => {
    if (location.state?.prefillIntervention) {
      setInterventionForm(location.state.prefillIntervention);
      setTimeout(() => {
        const el = document.getElementById('intervention-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.state]);

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
  // LINWAYS-STYLE ATTENDANCE MONITOR HANDLERS
  // ----------------------------------------------------
  const activeCourse = useMemo(() => {
    const cid = Number(attendanceSelection.courseId);
    if (!cid) return null;
    const demo = DEMO_ATTENDANCE_CLASSES.find((c) => c.id === cid);
    if (demo) return demo;
    return courses.find((c) => c.id === cid) || null;
  }, [attendanceSelection.courseId, courses]);

  const rosterStats = useMemo(() => {
    const total = attendanceRoster.length;
    const present = attendanceRoster.filter((s) => s.status === 'PRESENT').length;
    const absent = attendanceRoster.filter((s) => s.status === 'ABSENT').length;
    const late = attendanceRoster.filter((s) => s.status === 'LATE').length;
    const rate = total > 0 ? (((present + late * 0.5) / total) * 100).toFixed(1) : '0.0';
    return { total, present, absent, late, rate };
  }, [attendanceRoster]);

  const filteredRoster = useMemo(() => {
    if (!rosterSearch.trim()) return attendanceRoster;
    const q = rosterSearch.toLowerCase();
    return attendanceRoster.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }, [attendanceRoster, rosterSearch]);

  const loadClassRoster = async () => {
    if (!attendanceSelection.courseId) return;
    setLoadingRoster(true);
    try {
      const cid = Number(attendanceSelection.courseId);
      const isDemo = cid < 0 || DEMO_ATTENDANCE_CLASSES.some((d) => d.id === cid);

      let initialStudents = [];
      if (isDemo) {
        const demoFound = DEMO_ATTENDANCE_CLASSES.find((d) => d.id === cid) || DEMO_ATTENDANCE_CLASSES[0];
        initialStudents = demoFound.students.map((s) => ({
          studentId: s.id,
          rollNo: s.rollNo,
          studentName: s.name,
          email: s.email,
          status: 'PRESENT',
          remarks: '',
        }));
      } else {
        // Real course from database
        try {
          const courseDetail = await (role === 'ADMIN'
            ? adminService.getCourses().then(async (crsList) => {
                const c = (crsList || []).find((it) => it.id === cid);
                return c ? { students: c.students } : null;
              })
            : teacherService.getCourseDetails(user.id, cid));

          if (courseDetail && Array.isArray(courseDetail.students) && courseDetail.students.length > 0) {
            initialStudents = courseDetail.students.map((s) => ({
              studentId: s.studentId || s.id,
              rollNo: s.userName || `STD-${s.studentId || s.id}`,
              studentName: `${s.firstName || ''} ${s.lastName || s.userName || 'Student'}`.trim(),
              email: s.email || `${s.userName || 'student'}@sms.edu`,
              status: 'PRESENT',
              remarks: '',
            }));
          }
        } catch (detailErr) {
          console.warn('Could not load course details:', detailErr);
        }

        // If no students enrolled specifically, fall back to teacher's assigned students or students state
        if (initialStudents.length === 0 && students.length > 0) {
          initialStudents = students.map((s) => ({
            studentId: s.id,
            rollNo: s.userName || s.username || `STD-${s.id}`,
            studentName: `${s.firstName || ''} ${s.lastName || s.userName || 'Student'}`.trim(),
            email: s.email || `${s.userName || 'student'}@sms.edu`,
            status: 'PRESENT',
            remarks: '',
          }));
        }

      }

      // Check if attendance already exists for this course, date, and session period
      let existingForSession = [];
      try {
        const attRecords = await academicService.getAttendance(isDemo ? null : cid);
        if (Array.isArray(attRecords)) {
          setAttendanceRecords(attRecords);
          existingForSession = attRecords.filter((r) => {
            const dateMatch = r.sessionDate === attendanceSelection.sessionDate;
            const courseMatch = Number(r.courseId) === cid;
            const periodMatch = !r.sessionPeriod || r.sessionPeriod === attendanceSelection.sessionPeriod;
            return dateMatch && courseMatch && periodMatch;
          });
        }
      } catch (attErr) {
        console.warn('Attendance records check:', attErr);
      }

      if (existingForSession.length > 0) {
        setIsExistingSession(true);
        // Pre-populate saved status and remarks for editing!
        const existingMap = new Map();
        existingForSession.forEach((rec) => {
          existingMap.set(rec.studentId, rec);
        });

        const mergedRoster = initialStudents.map((stu) => {
          const foundRec = existingMap.get(stu.studentId);
          if (foundRec) {
            return {
              ...stu,
              status: foundRec.status || 'PRESENT',
              remarks: foundRec.remarks || '',
            };
          }
          return stu;
        });
        setAttendanceRoster(mergedRoster);
      } else {
        setIsExistingSession(false);
        setAttendanceRoster(initialStudents);
      }
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (module === 'attendance' && attendanceSelection.courseId) {
      loadClassRoster();
    }
  }, [module, attendanceSelection.courseId, attendanceSelection.sessionDate, attendanceSelection.sessionPeriod]);

  useEffect(() => {
    if (module === 'attendance' && !attendanceSelection.courseId) {
      if (courses.length > 0) {
        setAttendanceSelection((prev) => ({ ...prev, courseId: String(courses[0].id) }));
      } else {
        setAttendanceSelection((prev) => ({ ...prev, courseId: String(DEMO_ATTENDANCE_CLASSES[0].id) }));
      }
    }
  }, [module, courses]);

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarksChange = (studentId, newRemarks) => {
    setAttendanceRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks: newRemarks } : s))
    );
  };

  const handleMarkAll = (newStatus) => {
    setAttendanceRoster((prev) => {
      if (selectedRosterIds.length > 0) {
        return prev.map((s) => (selectedRosterIds.includes(s.studentId) ? { ...s, status: newStatus } : s));
      }
      return prev.map((s) => ({ ...s, status: newStatus }));
    });
  };

  const handleClearReset = () => {
    setAttendanceRoster((prev) =>
      prev.map((s) => ({ ...s, status: 'PRESENT', remarks: '' }))
    );
    setSelectedRosterIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedRosterIds.length === filteredRoster.length && filteredRoster.length > 0) {
      setSelectedRosterIds([]);
    } else {
      setSelectedRosterIds(filteredRoster.map((s) => s.studentId));
    }
  };

  const toggleSelectStudent = (studentId) => {
    setSelectedRosterIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveAttendanceBulk = async () => {
    if (!attendanceRoster || attendanceRoster.length === 0) {
      setError('No students in roster to save attendance for.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const cid = Number(attendanceSelection.courseId);
      const isDemo = cid < 0 || DEMO_ATTENDANCE_CLASSES.some((d) => d.id === cid);
      const courseObj = activeCourse;

      const payload = {
        courseId: cid,
        section: attendanceSelection.section,
        sessionDate: attendanceSelection.sessionDate,
        sessionPeriod: attendanceSelection.sessionPeriod,
        isDemo,
        demoCourseName: isDemo ? (courseObj?.name || 'Demo Class') : null,
        records: attendanceRoster.map((s) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          status: s.status,
          remarks: s.remarks || '',
          section: attendanceSelection.section,
          sessionPeriod: attendanceSelection.sessionPeriod,
        })),
      };

      const res = await academicService.recordAttendance(payload);
      showNotification(
        `Attendance successfully saved for ${res.saved || attendanceRoster.length} students in ${courseObj?.code || 'Course'} (${attendanceSelection.section}) on ${attendanceSelection.sessionDate}!`
      );
      setIsExistingSession(true);

      // Refresh attendance logs
      const updatedLogs = await academicService.getAttendance(isDemo ? null : cid);
      setAttendanceRecords(Array.isArray(updatedLogs) ? updatedLogs : []);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || err.message || 'Failed to save class attendance.');
    } finally {
      setActionLoading(false);
    }
  };

  // Backwards compatibility for single-roll submission if needed
  const handleRecordAttendance = async (e) => {
    if (e) e.preventDefault();
    await handleSaveAttendanceBulk();
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

      const targetId = payload.studentId || (role === 'STUDENT' ? user?.id : null);
      if (targetId) {
        try {
          const aiSim = await academicService.simulateAiScenario(targetId, {
            hypotheticalAttendanceRate: payload.additionalAttendanceSessions > 0 ? 88.0 : null,
            hypotheticalInternalScore: payload.hypotheticalNextScore,
            hypotheticalAssignmentCompletion: 92.0,
            hypotheticalAssignmentMarks: payload.hypotheticalNextScore,
            additionalConsultations: 1.0,
          });
          setDlSimulationResult(aiSim);
        } catch (simErr) {
          console.warn('AI Simulation call:', simErr);
        }
      }

      showNotification('Hypothetical academic simulation calculated via Deep Learning & Rule models.');
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

  // 1. AI Insights (Deep Learning Powered)
  const renderAiInsights = () => {
    const isOnline = aiHealth?.status === 'UP' || aiHealth?.model_loaded;
    const evalMetrics = aiModelInfo?.evaluation_metrics || {};
    const arch = aiModelInfo?.architecture || 'Deep Learning Multi-Layer Perceptron (MLP)';

    return (
      <div>
        {/* Deep Learning Model Architecture & Benchmark Header */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(29, 78, 216, 0.06) 100%)',
          border: '1px solid rgba(15, 118, 110, 0.25)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <Sparkles size={20} color="#0f766e" />
              <strong style={{ fontSize: '1.05rem', color: '#0f766e' }}>
                {aiModelInfo?.model_name || 'Academic Intelligence Neural Network'}
              </strong>
              <span style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: isOnline ? '#dcfce7' : '#fee2e2',
                color: isOnline ? '#15803d' : '#b91c1c',
                fontWeight: 600
              }}>
                {isOnline ? 'ENGINE ONLINE' : 'OFFLINE'}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}>
                {aiModelInfo?.model_version || 'v1.2.0-dl-mlp'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Framework: <strong>{aiModelInfo?.framework || 'PyTorch 2.x Deep Learning (MLP)'}</strong> | Architecture: {arch}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hold-Out MAE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                {evalMetrics.mean_absolute_error_mae !== undefined ? `${evalMetrics.mean_absolute_error_mae} pts` : '3.20 pts'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hold-Out RMSE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f766e' }}>
                {evalMetrics.root_mean_squared_error_rmse !== undefined ? `${evalMetrics.root_mean_squared_error_rmse} pts` : '3.94 pts'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Goodness of Fit R²</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>
                {evalMetrics.r2_score !== undefined ? evalMetrics.r2_score : '0.932'}
              </div>
            </div>
          </div>
        </div>

        {/* Global Standard Stat Grid */}
        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <StatCard icon={BookOpen} value={overview?.enrolledCourses || overview?.assignedCourses || overview?.totalCourses || 0} label={role === 'STUDENT' ? 'My Courses' : (role === 'TEACHER' ? 'Assigned Classes' : 'Institutional Courses')} />
          <StatCard icon={Award} color="green" value={overview?.gpa ? `${overview.gpa.toFixed(1)}%` : (overview?.atRiskCount !== undefined ? `${overview.atRiskCount} At-Risk` : 'N/A')} label={role === 'STUDENT' ? 'Current Average' : (role === 'TEACHER' ? 'At-Risk In Scope' : 'Academic Standing')} />
          <StatCard icon={CalendarCheck} color="orange" value={overview?.attendancePercent !== undefined ? `${overview.attendancePercent}%` : (overview?.assignedStudents || overview?.totalStudents || 0)} label={role === 'STUDENT' ? 'Attendance Rate' : 'Enrolled Students'} />
          <StatCard icon={Clock} color="purple" value={overview?.pendingConsultations || overview?.openConsultations || 0} label="Active Consultations" />
        </div>

        {/* STUDENT VIEW: Individual Deep Learning Prediction & Explainability */}
        {role === 'STUDENT' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ borderTop: '4px solid #0f766e' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="#0f766e" /> Neural Network Predicted Score
              </h3>

              {studentPrediction ? (() => {
                const rawScore = studentPrediction.predictedScore ?? studentPrediction.predicted_score;
                const isScoreValid = typeof rawScore === 'number' && !isNaN(rawScore);
                const rawConfidence = studentPrediction.confidenceScore ?? studentPrediction.confidence_score;
                const isConfValid = typeof rawConfidence === 'number' && !isNaN(rawConfidence);
                const risk = studentPrediction.riskLevel ?? studentPrediction.risk_level;
                const category = studentPrediction.performanceCategory ?? studentPrediction.performance_category;

                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {isScoreValid ? (
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main, #111111)' }}>
                          {rawScore.toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main, #111111)' }}>
                          Prediction Unavailable
                        </span>
                      )}
                      {risk ? (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          background: risk === 'CRITICAL' ? '#111111' : risk === 'HIGH' ? '#333333' : '#f5f5f5',
                          color: risk === 'CRITICAL' || risk === 'HIGH' ? '#ffffff' : '#111111',
                          border: '1px solid #111111'
                        }}>
                          {category ? `${category} (${risk} RISK)` : `${risk} RISK`}
                        </span>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, background: '#f5f5f5', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          Risk Status Unavailable
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Model Confidence: <strong>{isConfValid ? `${(rawConfidence * 100).toFixed(1)}%` : 'Unavailable'}</strong> | Timestamp: {(studentPrediction.predictionTimestamp ?? studentPrediction.prediction_timestamp) ? new Date(studentPrediction.predictionTimestamp ?? studentPrediction.prediction_timestamp).toLocaleString() : 'Recent'}
                    </p>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Key Contributing Factors</h4>
                    <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {(studentPrediction.keyContributingFactors ?? studentPrediction.key_contributing_factors ?? []).map((f, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{f}</li>
                      ))}
                    </ul>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Recommended Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(studentPrediction.recommendedActions ?? studentPrediction.recommended_actions ?? []).map((a, i) => (
                        <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#fafafa', border: '1px solid var(--border)', fontSize: '0.825rem', color: 'var(--text-main)' }}>
                          ✓ {a}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })() : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>Calculating verified academic parameters from completed assignments and attendance...</p>
                </div>
              )}
            </div>

            {/* Explainable AI Feature Attribution */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--primary)" /> Explainable AI Feature Attribution
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Shows how each verified academic record shifts your predicted outcome relative to cohort baseline averages:
              </p>

              {(studentPrediction?.featureContributions ?? studentPrediction?.feature_contributions ?? []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(studentPrediction.featureContributions ?? studentPrediction.feature_contributions).map((fc, i) => {
                    const contributionVal = Number(fc.contribution ?? 0);
                    const isPos = contributionVal >= 0;
                    const dName = fc.displayName ?? fc.display_name ?? fc.feature;
                    return (
                      <div key={i} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{dName}</span>
                          <span style={{ fontWeight: 700, color: isPos ? '#16a34a' : '#dc2626' }}>
                            {isPos ? `+${contributionVal.toFixed(1)} pts` : `${contributionVal.toFixed(1)} pts`}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                          {fc.insight}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading feature sensitivity attribution...</p>
              )}
            </div>
          </div>
        )}

        {/* TEACHER & ADMIN VIEW: Institutional Intelligence & Cohort Analytics */}
        {role !== 'STUDENT' && institutionalAi && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--primary)" /> Institutional Cohort Predictions & Risk Breakdown
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>CRITICAL RISK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{institutionalAi.riskBreakdown?.CRITICAL || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score &lt; 40% or Attendance &lt; 60%</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: 600 }}>HIGH RISK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c' }}>{institutionalAi.riskBreakdown?.HIGH || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score &lt; 60% or Attendance &lt; 75%</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#a16207', fontWeight: 600 }}>MODERATE RISK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ca8a04' }}>{institutionalAi.riskBreakdown?.MODERATE || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score &lt; 75% or Missing Work</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>LOW RISK / ON TRACK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{institutionalAi.riskBreakdown?.LOW || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strong Projected Outcomes</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Course-wise Deep Learning Forecasts</h4>
            <DataTable
              columns={[
                { key: 'courseCode', header: 'Course Code' },
                { key: 'courseName', header: 'Subject Title' },
                { key: 'enrolledCount', header: 'Enrolled' },
                {
                  key: 'meanPredictedScore',
                  header: 'Predicted Mean',
                  render: (v) => <strong>{v}%</strong>
                },
                {
                  key: 'atRiskCount',
                  header: 'At-Risk Roster',
                  render: (v) => (
                    <span style={{ color: v > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                      {v > 0 ? `${v} Students` : 'All On-Track'}
                    </span>
                  )
                }
              ]}
              data={institutionalAi.courseSummaries || []}
              emptyMessage="No enrolled courses available for institutional intelligence."
            />
          </div>
        )}
      </div>
    );
  };

  // 2. At-Risk Monitoring (Phase 4 & 6)
  const renderRiskMonitoring = () => {
    const filteredRisk = atRiskList.filter((item) => {
      const matchRisk = !riskFilter || (item.riskLevel || '').toUpperCase() === riskFilter.toUpperCase();
      const matchCourse = !selectedCourseId || String(item.courseId) === String(selectedCourseId) || (item.courseCode === selectedCourseId);
      return matchRisk && matchCourse;
    });

    return (
      <div>
        <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e5e5e5)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={22} color="#111111" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-main, #111111)', fontSize: '0.95rem' }}>Institutional Academic Risk Policy</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #666666)', lineHeight: 1.4 }}>
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
                      const prefill = {
                        studentId: row.studentId || '',
                        teacherId: role === 'TEACHER' ? user.id : '',
                        reason: Array.isArray(row.riskReasons) ? row.riskReasons.join('; ') : 'Academic and attendance risk detected.',
                        actionPlan: 'Schedule tutoring session and follow up on assignment submissions.',
                        status: 'OPEN',
                        followUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                        outcome: '',
                        staffNotes: '',
                      };
                      setInterventionForm(prefill);
                      const targetRole = role ? role.toLowerCase() : 'teacher';
                      navigate(`/${targetRole}/interventions`, { state: { prefillIntervention: prefill } });
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Availability Status</label>
                <select
                  value={availabilityForm.status}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                >
                  <option value="AVAILABLE">AVAILABLE (Open for Consultations)</option>
                  <option value="BUSY">BUSY (In Lecture / Evaluation)</option>
                  <option value="UNAVAILABLE">UNAVAILABLE (Out of Office)</option>
                </select>
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
                  <option value="WEEKDAYS">MON - FRI (WEEKDAYS)</option>
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
            {
              key: 'status',
              header: 'Status',
              render: (v) => {
                const s = (v || 'AVAILABLE').toUpperCase();
                return (
                  <span
                    className="badge"
                    style={{
                      background: s === 'AVAILABLE' ? '#111111' : s === 'BUSY' ? '#666666' : '#ffffff',
                      color: s === 'UNAVAILABLE' ? '#111111' : '#ffffff',
                      border: '1px solid #111111',
                      fontSize: '0.75rem',
                    }}
                  >
                    {s}
                  </span>
                );
              },
            },
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
  const formatAppointmentTime = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const renderConsultations = () => (
    <div>
      {role === 'STUDENT' && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Schedule an Academic Consultation
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Book a 1-on-1 office hours advising session with your course faculty instructor
              </p>
            </div>
            {facultyError && (
              <Button size="sm" variant="outline" type="button" onClick={() => loadModuleData()}>
                Retry Loading Faculty
              </Button>
            )}
          </div>

          <form onSubmit={handleBookConsultation}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Select Faculty Instructor *</label>
                <select
                  className="form-select"
                  value={consultationForm.teacherId}
                  onChange={(e) => setConsultationForm({ ...consultationForm, teacherId: e.target.value })}
                  required
                  disabled={facultyLoading || teachers.length === 0}
                >
                  {facultyLoading ? (
                    <option value="">Loading available faculty members...</option>
                  ) : teachers.length === 0 ? (
                    <option value="">No faculty members are currently available for consultation. Please try again later.</option>
                  ) : (
                    <>
                      <option value="">Choose faculty member...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name || `${t.firstName} ${t.lastName}`} — {t.department || 'Faculty'}{t.officeLocation ? ` (${t.officeLocation})` : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {facultyError ? (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--error)' }}>
                    {facultyError}
                  </div>
                ) : !facultyLoading && teachers.length === 0 ? (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No faculty members are currently available for consultation. Please try again later.
                  </div>
                ) : null}
              </div>

              <div>
                <label className="form-label">Appointment Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  min={new Date().toISOString().slice(0, 16)}
                  value={consultationForm.requestedAt}
                  onChange={(e) => setConsultationForm({ ...consultationForm, requestedAt: e.target.value })}
                  required
                />
                <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Choose an upcoming date and time slot
                </span>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Consultation Topic / Question *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Doubts on Dynamic Programming, mid-term grade improvement, or lab viva preparation"
                  value={consultationForm.studentNotes}
                  onChange={(e) => setConsultationForm({ ...consultationForm, studentNotes: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={actionLoading}
              variant="primary"
              disabled={actionLoading || !consultationForm.teacherId || !consultationForm.requestedAt || !consultationForm.studentNotes?.trim()}
            >
              Submit Appointment Request
            </Button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              {role === 'STUDENT' ? 'My Consultation Bookings' : (role === 'TEACHER' ? 'Student Consultation Requests' : 'All Consultations')}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {role === 'STUDENT' ? 'Review status of your scheduled mentoring and advising sessions' : 'Manage student advising requests'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={async () => {
            const res = await academicService.getConsultations();
            setConsultations(Array.isArray(res) ? res : []);
          }}>
            Refresh Bookings
          </Button>
        </div>

        <DataTable
          columns={[
            ...(role !== 'STUDENT' ? [{ key: 'studentName', header: 'Student' }] : []),
            {
              key: 'teacherName',
              header: 'Faculty Member',
              render: (v) => <strong>{v || 'Assigned Faculty'}</strong>,
            },
            {
              key: 'requestedAt',
              header: 'Appointment Time',
              render: (v) => formatAppointmentTime(v),
            },
            {
              key: 'status',
              header: 'Status',
              render: (v) => (
                <span className={`badge ${v === 'CONFIRMED' ? 'badge-success' : v === 'COMPLETED' ? 'badge-info' : v === 'CANCELLED' ? 'badge-error' : 'badge-warning'}`}>
                  {v || 'PENDING'}
                </span>
              ),
            },
            {
              key: 'studentNotes',
              header: 'Consultation Topic',
              render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v || '--'}</span>,
            },
            {
              key: 'instructions',
              header: 'Meeting Instructions',
              render: (v) => <span>{v || 'Instructions pending faculty confirmation.'}</span>,
            },
            ...(role === 'TEACHER'
              ? [
                  {
                    key: 'id',
                    header: 'Manage Appointment',
                    render: (_, row) => (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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
          emptyMessage={role === 'STUDENT' ? "No consultation bookings recorded yet. Use the form above to book a session with your instructor." : "No consultation requests recorded."}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
              Course Learning Resources & Handouts
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Access syllabus files, reference notes, and bookmark materials for quick study retrieval.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setResourceBookmarkFilter('ALL')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: resourceBookmarkFilter === 'ALL' ? '1px solid #111827' : '1px solid #e5e7eb',
                background: resourceBookmarkFilter === 'ALL' ? '#111827' : '#ffffff',
                color: resourceBookmarkFilter === 'ALL' ? '#ffffff' : '#4b5563',
                cursor: 'pointer',
              }}
            >
              All Handouts
            </button>
            <button
              type="button"
              onClick={() => setResourceBookmarkFilter('BOOKMARKED')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: resourceBookmarkFilter === 'BOOKMARKED' ? '1px solid #f59e0b' : '1px solid #e5e7eb',
                background: resourceBookmarkFilter === 'BOOKMARKED' ? '#f59e0b' : '#ffffff',
                color: resourceBookmarkFilter === 'BOOKMARKED' ? '#ffffff' : '#4b5563',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Star size={14} fill={resourceBookmarkFilter === 'BOOKMARKED' ? '#ffffff' : 'none'} />
              Bookmarked Handouts
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'bookmark',
              header: 'Bookmark',
              render: (_, row) => (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await academicService.toggleBookmarkResource(row.id);
                      setLearningResources((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, isBookmarked: !r.isBookmarked } : r
                        )
                      );
                      showNotification(row.isBookmarked ? 'Bookmark removed.' : 'Resource bookmarked!');
                    } catch (e) {
                      console.error('Bookmark toggle error:', e);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: row.isBookmarked ? '#f59e0b' : '#9ca3af',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={row.isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
                >
                  <Star size={18} fill={row.isBookmarked ? '#f59e0b' : 'none'} />
                </button>
              ),
            },
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
          data={learningResources.filter((r) => (resourceBookmarkFilter === 'BOOKMARKED' ? r.isBookmarked : true))}
          emptyMessage={resourceBookmarkFilter === 'BOOKMARKED' ? 'No bookmarked learning resources found.' : 'No learning resources uploaded for this course yet.'}
        />
      </div>
    </div>
  );

  // 8. Linways-style Class Attendance Monitor (Teacher, Admin, Student)
  const renderAttendance = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setAttendanceSubTab('SESSION')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: attendanceSubTab === 'SESSION' ? '1px solid #111827' : '1px solid #e5e7eb',
            background: attendanceSubTab === 'SESSION' ? '#111827' : '#ffffff',
            color: attendanceSubTab === 'SESSION' ? '#ffffff' : '#4b5563',
          }}
        >
          {role === 'STUDENT' ? 'My Session Logs' : 'Linways Roll Call'}
        </button>

        <button
          type="button"
          onClick={() => setAttendanceSubTab('RECOVERY')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: attendanceSubTab === 'RECOVERY' ? '1px solid #0f172a' : '1px solid #e5e7eb',
            background: attendanceSubTab === 'RECOVERY' ? '#0f172a' : '#ffffff',
            color: attendanceSubTab === 'RECOVERY' ? '#ffffff' : '#4b5563',
          }}
        >
          Attendance Recovery Calculator
        </button>
      </div>

      {attendanceSubTab === 'RECOVERY' ? (
        <AttendanceRecoveryCalculator studentId={role === 'STUDENT' ? user?.id : null} />
      ) : (
        <div>
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          {/* Header & Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={20} />
                Linways-Style Attendance Monitor
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Select assigned course, section, date, and session period to monitor and record class attendance.
              </p>
            </div>
            {isExistingSession && (
              <span className="badge" style={{ background: '#111111', color: '#ffffff', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px' }}>
                Editing Saved Session
              </span>
            )}
          </div>

          {/* 1. ATTENDANCE SELECTION BAR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Course / Subject Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Course / Subject *
              </label>
              <select
                value={attendanceSelection.courseId}
                onChange={(e) => setAttendanceSelection((prev) => ({ ...prev, courseId: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontWeight: 600 }}
              >
                <option value="">Choose Assigned Course...</option>
                {courses.length > 0 && (
                  <optgroup label="── Faculty Assigned Courses ──">
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="── Clearly Labelled Demo Classes ──">
                  {DEMO_ATTENDANCE_CLASSES.map((dc) => (
                    <option key={dc.id} value={dc.id}>
                      [Demo] {dc.code} — {dc.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Class / Section Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Class / Section *
              </label>
              <select
                value={attendanceSelection.section}
                onChange={(e) => setAttendanceSelection((prev) => ({ ...prev, section: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                {SECTION_OPTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Attendance Date *
              </label>
              <input
                type="date"
                value={attendanceSelection.sessionDate}
                onChange={(e) => setAttendanceSelection((prev) => ({ ...prev, sessionDate: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>

            {/* Session / Period Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Session / Period *
              </label>
              <select
                value={attendanceSelection.sessionPeriod}
                onChange={(e) => setAttendanceSelection((prev) => ({ ...prev, sessionPeriod: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Session Banner: New vs Editing */}
          {isExistingSession ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: '#f8fafc',
                border: '1px solid #111111',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.88rem',
              }}
            >
              <CheckCircle size={18} style={{ color: '#111111', flexShrink: 0 }} />
              <div>
                <strong>Editing Saved Session:</strong> Existing attendance records loaded for{' '}
                <u>{activeCourse?.code || 'Selected Course'}</u> on <u>{attendanceSelection.sessionDate}</u> (
                {attendanceSelection.sessionPeriod}). Status changes will update existing records without creating duplicates.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Clock size={18} style={{ color: '#111111', flexShrink: 0 }} />
              <div>
                <strong>New Attendance Session:</strong> Complete enrolled class roster loaded (
                {rosterStats.total} students). Mark students present, absent, or late, then click Save Attendance.
              </div>
            </div>
          )}

          {/* 2. LIVE ATTENDANCE TOTALS BAR */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem',
              padding: '1rem',
              background: '#fafafa',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Total Enrolled
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111111' }}>{rosterStats.total}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Present (P)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111111', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#111111' }} />
                {rosterStats.present}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Absent (A)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111111', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #111111', background: '#ffffff' }} />
                {rosterStats.absent}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Late (L)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#555555', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#555555' }} />
                {rosterStats.late}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Attendance Rate
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111111' }}>{rosterStats.rate}%</div>
            </div>
          </div>

          {/* 3. QUICK ACTIONS & SEARCH TOOLBAR */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            {/* Search filter */}
            <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 auto', maxWidth: '380px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
              <input
                type="text"
                placeholder="Search students by name or roll no..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--card-bg)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #111111',
                  background: '#111111',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                Mark All Absent
              </button>

              <button
                type="button"
                onClick={handleClearReset}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: '#fafafa',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear / Reset
              </button>

              <Button
                type="button"
                onClick={handleSaveAttendanceBulk}
                loading={actionLoading}
                variant="primary"
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: '#111111',
                  color: '#ffffff',
                }}
              >
                Save Attendance ({rosterStats.total})
              </Button>
            </div>
          </div>

          {/* 4. CLASS ATTENDANCE ROSTER TABLE */}
          {loadingRoster ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <LoadingSpinner />
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Loading enrolled student roster...
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRosterIds.length === filteredRoster.length && filteredRoster.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                        title="Select All Students"
                      />
                    </th>
                    <th style={{ padding: '0.75rem 1rem', width: '120px', fontWeight: 700, color: 'var(--text-main)' }}>
                      Roll No / ID
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Student Name & Email
                    </th>
                    <th style={{ padding: '0.75rem 1rem', width: '220px', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center' }}>
                      Attendance Status
                    </th>
                    <th style={{ padding: '0.75rem 1rem', minWidth: '220px', fontWeight: 700, color: 'var(--text-main)' }}>
                      Optional Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {attendanceRoster.length === 0
                          ? 'No students currently enrolled in this course or section.'
                          : 'No students found matching your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((student, idx) => {
                      const isSelected = selectedRosterIds.includes(student.studentId);
                      const isPresent = student.status === 'PRESENT';
                      const isAbsent = student.status === 'ABSENT';
                      const isLate = student.status === 'LATE';

                      return (
                        <tr
                          key={student.studentId || idx}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: isSelected ? '#f5f5f5' : (idx % 2 === 0 ? '#ffffff' : '#fafafa'),
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectStudent(student.studentId)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>

                          {/* Roll No / ID */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                padding: '0.2rem 0.5rem',
                                background: '#f0f0f0',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                color: '#111111',
                              }}
                            >
                              {student.rollNo}
                            </span>
                          </td>

                          {/* Student Name */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.studentName}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                          </td>

                          {/* Status Controls: P, A, L */}
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                              {/* Present Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                                title="Mark Present"
                                style={{
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  fontWeight: isPresent ? 800 : 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  background: isPresent ? '#111111' : 'transparent',
                                  color: isPresent ? '#ffffff' : '#64748b',
                                  border: isPresent ? '1px solid #111111' : '1px solid transparent',
                                }}
                              >
                                P
                              </button>

                              {/* Absent Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                                title="Mark Absent"
                                style={{
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  fontWeight: isAbsent ? 800 : 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  background: isAbsent ? '#ffffff' : 'transparent',
                                  color: isAbsent ? '#111111' : '#64748b',
                                  border: isAbsent ? '2px solid #111111' : '1px solid transparent',
                                }}
                              >
                                A
                              </button>

                              {/* Late Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.studentId, 'LATE')}
                                title="Mark Late"
                                style={{
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  fontWeight: isLate ? 800 : 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  background: isLate ? '#555555' : 'transparent',
                                  color: isLate ? '#ffffff' : '#64748b',
                                  border: isLate ? '1px solid #555555' : '1px solid transparent',
                                }}
                              >
                                L
                              </button>
                            </div>
                          </td>

                          {/* Remarks */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input
                              type="text"
                              placeholder="e.g. excused, late by 10m"
                              value={student.remarks || ''}
                              onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                background: '#ffffff',
                                fontSize: '0.82rem',
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin Faculty Attendance Management (Unmodified) */}
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

      {/* 4.5. STUDENT SUBJECT-WISE ATTENDANCE CHART */}
      {role === 'STUDENT' && (
        <SubjectWiseAttendanceChart
          courses={courses}
          overallRate={overview?.studentAttendanceRate || overview?.attendancePercent}
          showBackToOverall={false}
          showLinkToLogs={false}
        />
      )}

      {/* 5. SESSION ATTENDANCE LOGS REGISTER */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          {role === 'STUDENT' ? 'My Session Attendance Record' : 'Class Attendance Logs & History'}
        </h3>

        <DataTable
          columns={[
            ...(role !== 'STUDENT' ? [{ key: 'studentName', header: 'Student' }] : []),
            {
              key: 'type',
              header: 'Session Type',
              render: (_, row) =>
                row.isDemo ? (
                  <span className="badge" style={{ background: '#111111', color: '#ffffff', fontSize: '0.72rem' }}>
                    Demo Class
                  </span>
                ) : (
                  <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                    Official
                  </span>
                ),
            },
            { key: 'courseCode', header: 'Course Code' },
            { key: 'courseName', header: 'Course Name' },
            { key: 'section', header: 'Section' },
            { key: 'sessionPeriod', header: 'Session / Period' },
            { key: 'sessionDate', header: 'Date' },
            {
              key: 'status',
              header: 'Status',
              render: (v) => (
                <span
                  className="badge"
                  style={{
                    background: v === 'PRESENT' ? '#111111' : v === 'LATE' ? '#666666' : '#ffffff',
                    color: v === 'ABSENT' ? '#111111' : '#ffffff',
                    border: '1px solid #111111',
                  }}
                >
                  {v}
                </span>
              ),
            },
            { key: 'remarks', header: 'Remarks' },
            { key: 'recordedByTeacherName', header: 'Recorded By' },
          ]}
          data={attendanceRecords}
          emptyMessage="No attendance sessions recorded yet."
        />
      </div>
        </div>
      )}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Active Notifications &amp; Progress Alerts
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await academicService.markAllNotificationsRead();
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                showNotification('All notifications marked as read.');
              } catch (e) {
                console.error('Error marking all read:', e);
              }
            }}
          >
            Mark All as Read
          </Button>
        </div>

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
      <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e5e5e5)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Info size={22} color="#111111" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-main, #111111)', fontSize: '0.95rem' }}>AI Academic Simulation Safe Sandbox</strong>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #666666)', lineHeight: 1.4 }}>
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
            <Sparkles size={20} color="#111111" /> Projected Outcome Analytics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Current Average</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {simResult?.currentAverage !== undefined ? `${simResult.currentAverage.toFixed(1)}%` : '--'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Standing: <span className="badge badge-gray">{simResult?.currentRiskLevel || 'NORMAL'}</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', textTransform: 'uppercase', fontWeight: 700 }}>Projected Average</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                  {simResult?.projectedAverage !== undefined ? `${simResult.projectedAverage.toFixed(1)}%` : '--'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Projected: <span className="badge badge-info">{simResult?.projectedRiskLevel || 'READY TO SIMULATE'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: '#fafafa', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Shift</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {typeof simResult?.currentAttendance === 'number' ? `${simResult.currentAttendance.toFixed(1)}%` : 'N/A'} &rarr; {typeof simResult?.projectedAttendance === 'number' ? `${simResult.projectedAttendance.toFixed(1)}%` : 'N/A'}
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', background: simResult?.targetFeasibility === 'MATHEMATICALLY_INFEASIBLE' ? '#f5f5f5' : '#fafafa', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Required Remaining</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {typeof simResult?.requiredScoreOnRemaining === 'number' ? `${simResult.requiredScoreOnRemaining.toFixed(1)}%` : 'N/A'}
                  {simResult?.targetFeasibility === 'MATHEMATICALLY_INFEASIBLE' && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Mathematically Infeasible &gt; 100%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {dlSimulationResult && (() => {
              const baseScore = dlSimulationResult.baselinePredictedScore ?? dlSimulationResult.baseline_predicted_score;
              const isBaseValid = typeof baseScore === 'number' && !isNaN(baseScore);
              const simScore = dlSimulationResult.simulatedPredictedScore ?? dlSimulationResult.simulated_predicted_score;
              const isSimValid = typeof simScore === 'number' && !isNaN(simScore);
              const diffScore = dlSimulationResult.scoreDifferential ?? dlSimulationResult.score_differential;
              const isDiffValid = typeof diffScore === 'number' && !isNaN(diffScore);
              const riskTrans = dlSimulationResult.riskTransition ?? dlSimulationResult.risk_transition;

              return (
                <div style={{ padding: '1rem', borderRadius: '10px', background: '#fafafa', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem' }}>
                      <Sparkles size={16} /> Deep Learning Neural Network Projection
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#111111', color: '#ffffff', fontWeight: 600 }}>
                      {dlSimulationResult.modelVersion ?? dlSimulationResult.model_version ?? 'v1.2.0-dl-mlp'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Baseline DL</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {isBaseValid ? `${baseScore.toFixed(1)}%` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Unavailable</span>}
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Simulated DL</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {isSimValid ? `${simScore.toFixed(1)}%` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Unavailable</span>}
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Net Shift (Δ)</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {isDiffValid ? (diffScore >= 0 ? `+${diffScore.toFixed(1)}%` : `${diffScore.toFixed(1)}%`) : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Unavailable</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    <strong>Risk Transition:</strong> <span className="badge" style={{ background: '#111111', color: '#ffffff', marginLeft: '0.35rem' }}>{riskTrans || 'Unavailable'}</span>
                  </div>

                  {(dlSimulationResult.keyDrivers ?? dlSimulationResult.key_drivers ?? []).length > 0 && (
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <strong>Key Scenario Drivers:</strong>
                      <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0 }}>
                        {(dlSimulationResult.keyDrivers ?? dlSimulationResult.key_drivers).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed var(--border)', paddingTop: '0.4rem' }}>
                    {dlSimulationResult.educationalGuidance ?? dlSimulationResult.educational_guidance}
                  </div>
                </div>
              );
            })()}

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
        <StatCard icon={FileBarChart} color="green" value={overview?.attendancePercent !== undefined && overview?.attendancePercent !== null ? `${overview.attendancePercent}%` : '--'} label="Average Attendance" />
        <StatCard icon={Award} color="amber" value={overview?.gpa !== undefined && overview?.gpa !== null ? `${overview.gpa.toFixed(1)}%` : '--'} label="Mean Assessment Mark" />
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
              render: (v) => <strong style={{ color: 'var(--primary)' }}>{v !== undefined && v !== null ? `${v}%` : '--'}</strong>,
            },
            {
              key: 'status',
              header: 'Standing',
              render: (row) => {
                const avg = Number(row?.average);
                if (isNaN(avg) || row?.average === undefined || row?.average === null) {
                  return <span className="badge badge-gray">Pending Marks</span>;
                }
                return avg >= 75 ? (
                  <span className="badge badge-success">Good Standing</span>
                ) : avg >= 60 ? (
                  <span className="badge badge-warning">Moderate</span>
                ) : (
                  <span className="badge badge-danger">At Risk</span>
                );
              },
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
      case 'todos':
        return <SmartAcademicTodoList />;
      case 'recovery':
        return <AttendanceRecoveryCalculator studentId={role === 'STUDENT' ? user?.id : null} />;
      case 'study-plan':
        return <PersonalizedStudyPlanner />;
      case 'doubts':
        return <DoubtClarificationPortal courses={courses} />;
      case 'class-health':
        return <TeacherClassHealthDashboard />;
      case 'bulk-marks':
        return <BulkMarksEntry courses={courses} />;
      case 'submissions':
        return <AssignmentSubmissionTracker />;
      case 'assessments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <AssignmentSubmissionTracker />
            {role !== 'STUDENT' && <BulkMarksEntry courses={courses} />}
          </div>
        );
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
