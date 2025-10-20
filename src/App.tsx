import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LeaveProvider } from './contexts/LeaveContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Toaster } from './components/ui/sonner';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { ManageEmployees } from './pages/admin/ManageEmployees';
import { ManageLeaveTypes } from './pages/admin/ManageLeaveTypes';
import { LeaveRequests } from './pages/admin/LeaveRequests';
import { Reports as AdminReports } from './pages/admin/Reports';
import { Settings as AdminSettings } from './pages/admin/Settings';

// Manager pages
import { ManagerDashboard } from './pages/manager/Dashboard';
import { TeamLeaveRequests } from './pages/manager/TeamLeaveRequests';
import { MyLeaves } from './pages/manager/MyLeaves';
import { ManagerReports } from './pages/manager/Reports';
import { ManagerSettings } from './pages/manager/Settings';

// Employee pages
import { EmployeeDashboard } from './pages/employee/Dashboard';
import { ApplyLeave } from './pages/employee/ApplyLeave';
import { LeaveHistory } from './pages/employee/LeaveHistory';
import { Profile } from './pages/employee/Profile';

export default function App() {
  useEffect(() => {
    document.title = 'Leave Logic - Smart Leave Management System';
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LeaveProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <ManageEmployees />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leave-types"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <ManageLeaveTypes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leave-requests"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <LeaveRequests />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminReports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminSettings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Layout>
                      <ManagerDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/team-requests"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Layout>
                      <TeamLeaveRequests />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/my-leaves"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Layout>
                      <MyLeaves />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/reports"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Layout>
                      <ManagerReports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/settings"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Layout>
                      <ManagerSettings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout>
                      <EmployeeDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/apply-leave"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout>
                      <ApplyLeave />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/history"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout>
                      <LeaveHistory />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch-all route for unmatched paths */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
          </LeaveProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
