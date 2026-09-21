import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role: user.role could be 'STUDENT', 'TEACHER', 'ADMIN' or 'ROLE_STUDENT', etc.
  const userRole = user.role?.replace('ROLE_', '').toUpperCase();
  const isAllowed = allowedRoles.some((r) => r.toUpperCase() === userRole);

  if (!isAllowed) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
