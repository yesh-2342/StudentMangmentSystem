import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { useAuth } from '../hooks/useAuth';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AccessDenied from '../pages/auth/AccessDenied';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCourses from '../pages/student/StudentCourses';
import StudentCourseDetails from '../pages/student/StudentCourseDetails';
import StudentAssignments from '../pages/student/StudentAssignments';
import StudentAssignmentDetails from '../pages/student/StudentAssignmentDetails';
import StudentGrades from '../pages/student/StudentGrades';
import StudentProfile from '../pages/student/StudentProfile';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherCourses from '../pages/teacher/TeacherCourses';
import TeacherCourseDetails from '../pages/teacher/TeacherCourseDetails';
import TeacherStudents from '../pages/teacher/TeacherStudents';
import TeacherAssignments from '../pages/teacher/TeacherAssignments';
import TeacherGrades from '../pages/teacher/TeacherGrades';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Students from '../pages/admin/Students';
import Teachers from '../pages/admin/Teachers';
import Courses from '../pages/admin/Courses';
import AdminProfile from '../pages/admin/AdminProfile';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.replace('ROLE_', '').toUpperCase();
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student Portal */}
        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:courseId" element={<StudentCourseDetails />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="courses/:courseId/assignment/:assignmentId" element={<StudentAssignmentDetails />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* Faculty / Teacher Portal */}
        <Route element={<RoleRoute allowedRoles={['TEACHER']} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="courses/:courseId" element={<TeacherCourseDetails />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="grades" element={<TeacherGrades />} />
          </Route>
        </Route>

        {/* Admin Portal */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="courses" element={<Courses />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
