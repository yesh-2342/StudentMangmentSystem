import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, FileText, Award } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const teacherNavItems = [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/teacher/courses', label: 'My Courses', icon: BookOpen },
  { path: '/teacher/students', label: 'Enrolled Students', icon: Users },
  { path: '/teacher/assignments', label: 'Assignments', icon: FileText },
  { path: '/teacher/grades', label: 'Gradebook', icon: Award },
];

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={teacherNavItems}
        title="Faculty Portal"
        roleLabel="Teacher"
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
