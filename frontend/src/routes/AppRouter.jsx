import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PrivateRoute } from './PrivateRoute';
import { PageLayout } from '../components/layout/PageLayout';

// Auth pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// User pages
import { Dashboard } from '../pages/user/Dashboard';
import { NouvReservation } from '../pages/user/NouvReservation';
import { MesReservations } from '../pages/user/MesReservations';
import { MonProfil } from '../pages/user/MonProfil';

// Admin pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { GestionSalles } from '../pages/admin/GestionSalles';
import { GestionReservations } from '../pages/admin/GestionReservations';
import { GestionUtilisateurs } from '../pages/admin/GestionUtilisateurs';

function RoleRedirect() {
  const { role } = useAuth();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<PrivateRoute><PageLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nouvelle-reservation" element={<NouvReservation />} />
        <Route path="/mes-reservations" element={<MesReservations />} />
        <Route path="/mon-profil" element={<MonProfil />} />
      </Route>

      <Route element={<PrivateRoute requiredRole="admin"><PageLayout /></PrivateRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/salles" element={<GestionSalles />} />
        <Route path="/admin/reservations" element={<GestionReservations />} />
        <Route path="/admin/utilisateurs" element={<GestionUtilisateurs />} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
