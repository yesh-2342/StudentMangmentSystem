import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Award, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const studentNavItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/student/courses', label: 'My Courses', icon: BookOpen },
  { path: '/student/assignments', label: 'Assignments', icon: FileText },
  { path: '/student/grades', label: 'Grades & Transcript', icon: Award },
  { path: '/student/profile', label: 'My Profile', icon: User },
];

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={studentNavItems}
        title="Student Portal"
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
