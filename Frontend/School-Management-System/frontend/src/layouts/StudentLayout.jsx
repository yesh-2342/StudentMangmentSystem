import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
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
  TrendingUp,
  User,
  CheckSquare,
  Calculator,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import AcademicAssistantDrawer from '../components/chat/AcademicAssistantDrawer';

const studentSections = [
  {
    title: 'Academics',
    items: [
      { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/student/todos', label: 'Academic To-Do List', icon: CheckSquare },
      { path: '/student/study-plan', label: 'Study Planner', icon: Calendar },
      { path: '/student/academic-progress', label: 'My Academic Progress', icon: TrendingUp },
      { path: '/student/courses', label: 'Courses & Subjects', icon: BookOpen },
      { path: '/student/assignments', label: 'Assessments & Tasks', icon: FileText },
      { path: '/student/attendance', label: 'Attendance & Recovery', icon: CalendarCheck },
    ],
  },
  {
    title: 'Learning & Support',
    items: [
      { path: '/student/assistant', label: 'Academic Assistant', icon: Bot },
      { path: '/student/doubts', label: 'Doubt & Clarifications', icon: HelpCircle },
      { path: '/student/recovery', label: 'Recovery Calculator', icon: Calculator },
      { path: '/student/consultations', label: 'Book Consultation', icon: ClipboardCheck },
      { path: '/student/interventions', label: 'Academic Support Plans', icon: HeartHandshake },
      { path: '/student/library', label: 'Library Catalog', icon: Library },
      { path: '/student/resources', label: 'Learning Resources', icon: BookMarked },
      { path: '/student/simulator', label: 'What-If Simulator', icon: LineChart },
      { path: '/student/reports', label: 'My Academic Reports', icon: FileBarChart },
    ],
  },
  {
    title: 'Account',
    items: [
      { path: '/student/notifications', label: 'Notifications', icon: Bell },
      { path: '/student/profile', label: 'My Profile', icon: User },
    ],
  },
];

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        sections={studentSections}
        title="Project 577"
        roleLabel="Student"
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

export default StudentLayout;
