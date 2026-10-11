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
  Users,
  UsersRound,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const teacherNavItems = [
  { path: '/teacher/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/teacher/courses', label: 'My Classes & Subjects', icon: BookOpen },
  { path: '/teacher/students', label: 'Student Management', icon: Users },
  { path: '/teacher/ai-insights', label: 'Class AI Analytics', icon: Brain },
  { path: '/teacher/at-risk', label: 'At-Risk Student Monitoring', icon: UsersRound },
  { path: '/teacher/interventions', label: 'Intervention Management', icon: HeartHandshake },
  { path: '/teacher/assessments', label: 'Assessment Management', icon: FileText },
  { path: '/teacher/attendance', label: 'Class Attendance Management', icon: CalendarCheck },
  { path: '/teacher/consultations', label: 'Consultation Requests', icon: ClipboardCheck },
  { path: '/teacher/availability', label: 'My Availability & Office Hours', icon: CalendarCheck },
  { path: '/teacher/resources', label: 'Teaching Resources', icon: BookMarked },
  { path: '/teacher/library', label: 'Library', icon: Library },
  { path: '/teacher/reports', label: 'Class & Subject Reports', icon: FileBarChart },
  { path: '/teacher/simulator', label: 'Academic What-If Simulator', icon: LineChart },
  { path: '/teacher/notifications', label: 'Faculty Notifications', icon: Bell },
  { path: '/teacher/profile', label: 'Faculty Profile', icon: User },
];

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={teacherNavItems}
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
    </div>
  );
};

export default TeacherLayout;
