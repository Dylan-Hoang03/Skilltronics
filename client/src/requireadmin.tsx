import { Navigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import type { JSX } from 'react';

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

  if (!decoded) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (Date.now() >= decoded.exp * 1000) {
    localStorage.clear();                      
    return <Navigate to="/" replace />;
  }

  if (!decoded.isAdmin) {
    return <Navigate to="/landingnotadmin" replace />;
  }

  return children;
}
