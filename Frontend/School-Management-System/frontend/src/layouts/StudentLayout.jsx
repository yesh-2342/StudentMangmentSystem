import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
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
  UsersRound,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const studentNavItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/student/ai-insights', label: 'My AI Insights', icon: Brain },
  { path: '/student/academic-progress', label: 'My Academic Progress', icon: UsersRound },
  { path: '/student/assessments', label: 'My Assessments', icon: FileText },
  { path: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { path: '/student/library', label: 'Library', icon: Library },
  { path: '/student/resources', label: 'Learning Resources', icon: BookMarked },
  { path: '/student/consultations', label: 'Book a Consultation', icon: ClipboardCheck },
  { path: '/student/interventions', label: 'My Academic Support', icon: HeartHandshake },
  { path: '/student/simulator', label: 'What-If Simulator', icon: LineChart },
  { path: '/student/reports', label: 'My Reports', icon: FileBarChart },
  { path: '/student/notifications', label: 'Notifications', icon: Bell },
  { path: '/student/profile', label: 'My Profile', icon: User },
];

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={studentNavItems}
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
    </div>
  );
};

export default StudentLayout;
