import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Register } from './views/Register'; // Import Register
import { Landing } from './views/Landing'; // Import Landing
import { UserDashboard } from './views/user/UserDashboard';
import { Transfers } from './views/user/Transfers';
import { Cards } from './views/user/Cards';
import { Loans } from './views/user/Loans';
import { Profile } from './views/user/Profile'; // Import Profile
import { AdminDashboard } from './views/admin/AdminDashboard';
import { UserManagement } from './views/admin/UserManagement';
import { LoanApprovals } from './views/admin/LoanApprovals';
import { SiteSettings } from './views/admin/SiteSettings';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/loans" element={<LoanApprovals />} />
          <Route path="/admin/settings" element={<SiteSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;