import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { Landing } from './views/Landing';
import { UserDashboard } from './views/user/UserDashboard';
import { Transfers } from './views/user/Transfers';
import { Cards } from './views/user/Cards';
import { Loans } from './views/user/Loans';
import { Services } from './views/user/Services';
import { Profile } from './views/user/Profile';
import { TransactionHistory } from './views/user/TransactionHistory';
import { Notifications } from './views/user/Notifications';
import { MyDocuments } from './views/user/MyDocuments';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { UserManagement } from './views/admin/UserManagement';
import { LoanApprovals } from './views/admin/LoanApprovals';
import { TransactionApprovals } from './views/admin/TransactionApprovals';
import { SendNotifications } from './views/admin/SendNotifications';
import { DocumentRequests } from './views/admin/DocumentRequests';
import { SiteSettings } from './views/admin/SiteSettings';
import { InstitutionChangeRequests } from './views/admin/InstitutionChangeRequests';

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
          <Route path="/services" element={<Services />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/documents" element={<MyDocuments />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/loans" element={<LoanApprovals />} />
          <Route path="/admin/transactions" element={<TransactionApprovals />} />
          <Route path="/admin/notifications" element={<SendNotifications />} />
          <Route path="/admin/documents" element={<DocumentRequests />} />
          <Route path="/admin/institution-requests" element={<InstitutionChangeRequests />} />
          <Route path="/admin/settings" element={<SiteSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;