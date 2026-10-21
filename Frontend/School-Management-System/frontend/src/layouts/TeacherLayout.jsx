import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  CalendarCheck,
  ClipboardCheck,
  FileBarChart,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Library,
  LineChart,
  User,
  Users,
  Activity,
  Award,
  FileCheck,
  HelpCircle,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import AcademicAssistantDrawer from '../components/chat/AcademicAssistantDrawer';

const teacherSections = [
  {
    title: 'Teaching Workspace',
    items: [
      { path: '/teacher/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/teacher/class-health', label: 'Class Health Dashboard', icon: Activity },
      { path: '/teacher/courses', label: 'My Classes & Subjects', icon: BookOpen },
      { path: '/teacher/students', label: 'Student Management', icon: Users },
      { path: '/teacher/attendance', label: 'Attendance Roll Call', icon: CalendarCheck },
    ],
  },
  {
    title: 'Academics & Grading',
    items: [
      { path: '/teacher/bulk-marks', label: 'Bulk Marks Entry', icon: Award },
      { path: '/teacher/submissions', label: 'Submission Tracker', icon: FileCheck },
      { path: '/teacher/doubts', label: 'Doubt & Clarifications', icon: HelpCircle },
      { path: '/teacher/assignments', label: 'Assessment Oversight', icon: FileText },
      { path: '/teacher/ai-insights', label: 'Class AI Analytics', icon: Brain },
      { path: '/teacher/at-risk', label: 'At-Risk Monitoring', icon: AlertTriangle },
      { path: '/teacher/interventions', label: 'Interventions', icon: HeartHandshake },
    ],
  },
  {
    title: 'Advising & Resources',
    items: [
      { path: '/teacher/assistant', label: 'Academic Assistant', icon: Bot },
      { path: '/teacher/consultations', label: 'Consultation Requests', icon: ClipboardCheck },
      { path: '/teacher/availability', label: 'My Office Hours', icon: CalendarCheck },
      { path: '/teacher/resources', label: 'Teaching Resources', icon: BookMarked },
      { path: '/teacher/library', label: 'Library', icon: Library },
      { path: '/teacher/reports', label: 'Class & Subject Reports', icon: FileBarChart },
      { path: '/teacher/simulator', label: 'What-If Simulator', icon: LineChart },
    ],
  },
  {
    title: 'Account',
    items: [
      { path: '/teacher/notifications', label: 'Faculty Notifications', icon: Bell },
      { path: '/teacher/profile', label: 'Faculty Profile', icon: User },
    ],
  },
];

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        sections={teacherSections}
        title="Project 577"
        roleLabel="Faculty"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>

      {/* Floating Academic Assistant Trigger */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 45 }}>
        {!chatOpen && (
          <button
            className="chat-fab-button"
            onClick={() => setChatOpen(true)}
            aria-label="Open Academic Assistant"
          >
            <Bot size={18} />
            <span>Academic Assistant</span>
          </button>
        )}
      </div>

      <AcademicAssistantDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default TeacherLayout;
