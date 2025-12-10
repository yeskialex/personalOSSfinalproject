import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export default function RequireLogin() {
  const { trainer } = useContext(AuthContext);
  const location = useLocation();

  // Logged in → allow access
  if (trainer) return <Outlet />;

  // Not logged in → allow access to auth pages ONLY
  const allowedAuthPaths = ["/login", "/signup"];

  if (allowedAuthPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  // Trying to access any other page → redirect to login
  return <Navigate to="/login" replace />;
}
