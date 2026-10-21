import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Bot,
  CalendarCheck,
  ClipboardCheck,
  Database,
  FileBarChart,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Library,
  LineChart,
  Settings,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import AcademicAssistantDrawer from '../components/chat/AcademicAssistantDrawer';

const adminSections = [
  {
    title: 'Overview',
    items: [
      { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/admin/academic-data', label: 'Institutional Analytics', icon: LineChart },
    ],
  },
  {
    title: 'People',
    items: [
      { path: '/admin/students', label: 'Student Management', icon: GraduationCap },
      { path: '/admin/teachers', label: 'Faculty Management', icon: Users },
      { path: '/admin/users', label: 'User & Role Management', icon: UserCheck },
    ],
  },
  {
    title: 'Academics',
    items: [
      { path: '/admin/courses', label: 'Course & Subject Management', icon: BookOpen },
      { path: '/admin/attendance', label: 'Attendance Oversight', icon: CalendarCheck },
      { path: '/admin/assessments', label: 'Assessment Oversight', icon: FileText },
    ],
  },
  {
    title: 'Student Support',
    items: [
      { path: '/admin/at-risk', label: 'At-Risk Student Oversight', icon: AlertTriangle },
      { path: '/admin/interventions', label: 'Intervention Management', icon: HeartHandshake },
      { path: '/admin/consultations', label: 'Consultation Oversight', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Resources',
    items: [
      { path: '/admin/assistant', label: 'Academic Assistant', icon: Bot },
      { path: '/admin/library', label: 'Library & Resource Management', icon: Library },
      { path: '/admin/notifications', label: 'Notifications & Announcements', icon: Bell },
      { path: '/admin/reports', label: 'Institutional Reports', icon: FileBarChart },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/settings', label: 'System Settings', icon: Settings },
      { path: '/admin/profile', label: 'Admin Profile', icon: Shield },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        sections={adminSections}
        title="Project 577"
        roleLabel="Administrator"
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

export default AdminLayout;
