// src/components/RequireAdmin.tsx
import { Navigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import type { JSX } from 'react';

// tiny helper – returns payload or null
function getDecodedToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode<{ exp: number; isAdmin: boolean }>(token);
  } catch {
    return null;
  }
}

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const decoded = getDecodedToken();

  // 1. no token or bad token → back to login
  if (!decoded) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. token expired → back to login
  if (Date.now() >= decoded.exp * 1000) {
    localStorage.clear();                       // optional cleanup
    return <Navigate to="/" replace />;
  }

  // 3. not an admin → show the non-admin landing page instead
  if (!decoded.isAdmin) {
    return <Navigate to="/landingnotadmin" replace />;
  }

  // 4. OK → render the protected element
  return children;
}
