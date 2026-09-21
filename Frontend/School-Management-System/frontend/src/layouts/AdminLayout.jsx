import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Shield } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/students', label: 'Students', icon: GraduationCap },
  { path: '/admin/teachers', label: 'Faculty & Teachers', icon: Users },
  { path: '/admin/courses', label: 'Course Catalog', icon: BookOpen },
  { path: '/admin/profile', label: 'System Profile', icon: Shield },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={adminNavItems}
        title="Admin Console"
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
