import { Navigate } from "react-router-dom";
import type { JSX } from 'react';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
