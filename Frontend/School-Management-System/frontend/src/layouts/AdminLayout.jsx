import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Bell,
  BookMarked,
  BookOpen,
  Brain,
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
  UsersRound,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'User & Role Management', icon: UserCheck },
  { path: '/admin/students', label: 'Student Management', icon: GraduationCap },
  { path: '/admin/teachers', label: 'Faculty Management', icon: Users },
  { path: '/admin/courses', label: 'Course & Subject Management', icon: BookOpen },
  { path: '/admin/academic-data', label: 'Academic Data Management', icon: Database },
  { path: '/admin/ai-insights', label: 'Institutional AI Insights', icon: Brain },
  { path: '/admin/at-risk', label: 'At-Risk Student Oversight', icon: UsersRound },
  { path: '/admin/interventions', label: 'Intervention Oversight', icon: HeartHandshake },
  { path: '/admin/attendance', label: 'Attendance Oversight', icon: CalendarCheck },
  { path: '/admin/assessments', label: 'Assessment Oversight', icon: FileText },
  { path: '/admin/library', label: 'Library & Resource Management', icon: Library },
  { path: '/admin/consultations', label: 'Consultation Oversight', icon: ClipboardCheck },
  { path: '/admin/reports', label: 'Institutional Reports', icon: FileBarChart },
  { path: '/admin/notifications', label: 'Notifications & Announcements', icon: Bell },
  { path: '/admin/settings', label: 'System Settings', icon: Settings },
  { path: '/admin/profile', label: 'Admin Profile', icon: Shield },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={adminNavItems}
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
    </div>
  );
};

export default AdminLayout;
