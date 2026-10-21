import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { useAuth } from '../hooks/useAuth';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth Pages
import LoginSelect from '../pages/auth/LoginSelect';
import RoleLoginForm from '../pages/auth/RoleLoginForm';
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
import TeacherProfile from '../pages/teacher/TeacherProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Students from '../pages/admin/Students';
import Teachers from '../pages/admin/Teachers';
import Courses from '../pages/admin/Courses';
import AdminProfile from '../pages/admin/AdminProfile';
import ParentVoiceAlerts from '../pages/admin/ParentVoiceAlerts';

// Common Module Page
import AcademicModulePage from '../pages/common/AcademicModulePage';
import AcademicAssistantPage from '../pages/common/AcademicAssistantPage';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.replace('ROLE_', '').toUpperCase();
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

const DynamicRoleLogin = () => {
  const { role } = useParams();
  if (['student', 'teacher', 'admin'].includes(role?.toLowerCase())) {
    return <RoleLoginForm roleType={role.toLowerCase()} />;
  }
  return <LoginSelect />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginSelect />} />
      <Route path="/login/student" element={<RoleLoginForm roleType="student" />} />
      <Route path="/login/teacher" element={<RoleLoginForm roleType="teacher" />} />
      <Route path="/login/admin" element={<RoleLoginForm roleType="admin" />} />
      <Route path="/login/:role" element={<DynamicRoleLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student Portal */}
        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="ai-insights" element={<AcademicModulePage module="ai" />} />
            <Route path="academic-progress" element={<AcademicModulePage module="risk" />} />
            <Route path="at-risk" element={<AcademicModulePage module="risk" />} />
            <Route path="interventions" element={<AcademicModulePage module="interventions" />} />
            <Route path="academic-support" element={<AcademicModulePage module="interventions" />} />
            <Route path="availability" element={<AcademicModulePage module="availability" />} />
            <Route path="consultations" element={<AcademicModulePage module="consultations" />} />
            <Route path="library" element={<AcademicModulePage module="library" />} />
            <Route path="resources" element={<AcademicModulePage module="resources" />} />
            <Route path="assessments" element={<AcademicModulePage module="assessments" />} />
            <Route path="attendance" element={<AcademicModulePage module="attendance" />} />
            <Route path="recovery" element={<AcademicModulePage module="recovery" />} />
            <Route path="todos" element={<AcademicModulePage module="todos" />} />
            <Route path="study-plan" element={<AcademicModulePage module="study-plan" />} />
            <Route path="doubts" element={<AcademicModulePage module="doubts" />} />
            <Route path="reports" element={<AcademicModulePage module="reports" />} />
            <Route path="simulator" element={<AcademicModulePage module="simulator" />} />
            <Route path="notifications" element={<AcademicModulePage module="notifications" />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:courseId" element={<StudentCourseDetails />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="courses/:courseId/assignment/:assignmentId" element={<StudentAssignmentDetails />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="assistant" element={<AcademicAssistantPage />} />
            <Route path="academic-assistant" element={<AcademicAssistantPage />} />
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
            <Route path="class-health" element={<AcademicModulePage module="class-health" />} />
            <Route path="bulk-marks" element={<AcademicModulePage module="bulk-marks" />} />
            <Route path="submissions" element={<AcademicModulePage module="submissions" />} />
            <Route path="doubts" element={<AcademicModulePage module="doubts" />} />
            <Route path="ai-insights" element={<AcademicModulePage module="ai" />} />
            <Route path="at-risk" element={<AcademicModulePage module="risk" />} />
            <Route path="interventions" element={<AcademicModulePage module="interventions" />} />
            <Route path="assessments" element={<AcademicModulePage module="assessments" />} />
            <Route path="attendance" element={<AcademicModulePage module="attendance" />} />
            <Route path="recovery" element={<AcademicModulePage module="recovery" />} />
            <Route path="consultations" element={<AcademicModulePage module="consultations" />} />
            <Route path="availability" element={<AcademicModulePage module="availability" />} />
            <Route path="resources" element={<AcademicModulePage module="resources" />} />
            <Route path="library" element={<AcademicModulePage module="library" />} />
            <Route path="reports" element={<AcademicModulePage module="reports" />} />
            <Route path="simulator" element={<AcademicModulePage module="simulator" />} />
            <Route path="notifications" element={<AcademicModulePage module="notifications" />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="grades" element={<TeacherGrades />} />
            <Route path="assistant" element={<AcademicAssistantPage />} />
            <Route path="academic-assistant" element={<AcademicAssistantPage />} />
            <Route path="parent-alerts" element={<ParentVoiceAlerts />} />
            <Route path="parent-calling" element={<Navigate to="/teacher/assistant" replace />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>
        </Route>

        {/* Admin Portal */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Students />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="courses" element={<Courses />} />
            <Route path="class-health" element={<AcademicModulePage module="class-health" />} />
            <Route path="bulk-marks" element={<AcademicModulePage module="bulk-marks" />} />
            <Route path="submissions" element={<AcademicModulePage module="submissions" />} />
            <Route path="doubts" element={<AcademicModulePage module="doubts" />} />
            <Route path="todos" element={<AcademicModulePage module="todos" />} />
            <Route path="recovery" element={<AcademicModulePage module="recovery" />} />
            <Route path="study-plan" element={<AcademicModulePage module="study-plan" />} />
            <Route path="academic-data" element={<AcademicModulePage module="academic-data" />} />
            <Route path="ai-insights" element={<AcademicModulePage module="ai" />} />
            <Route path="at-risk" element={<AcademicModulePage module="risk" />} />
            <Route path="interventions" element={<AcademicModulePage module="interventions" />} />
            <Route path="attendance" element={<AcademicModulePage module="attendance" />} />
            <Route path="assessments" element={<AcademicModulePage module="assessments" />} />
            <Route path="library" element={<AcademicModulePage module="library" />} />
            <Route path="resources" element={<AcademicModulePage module="resources" />} />
            <Route path="availability" element={<AcademicModulePage module="availability" />} />
            <Route path="consultations" element={<AcademicModulePage module="consultations" />} />
            <Route path="reports" element={<AcademicModulePage module="reports" />} />
            <Route path="simulator" element={<AcademicModulePage module="simulator" />} />
            <Route path="notifications" element={<AcademicModulePage module="notifications" />} />
            <Route path="assistant" element={<AcademicAssistantPage />} />
            <Route path="academic-assistant" element={<AcademicAssistantPage />} />
            <Route path="parent-alerts" element={<ParentVoiceAlerts />} />
            <Route path="parent-calling" element={<Navigate to="/admin/assistant" replace />} />
            <Route path="settings" element={<AcademicModulePage module="settings" />} />
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
