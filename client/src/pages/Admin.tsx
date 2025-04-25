import { useState } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";
import { useAuth } from "../hooks/useAuth";

const Admin = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <AdminDashboard onLogout={logout} />
      ) : (
        <AdminLogin onLogin={login} />
      )}
    </div>
  );
};

export default Admin;
