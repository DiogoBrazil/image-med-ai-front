import { Routes, Route, Navigate } from 'react-router-dom';
import { Flex, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Public pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// Protected pages
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';

// Admin pages
import UsersPage from '../pages/admin/UsersPage';
import HealthUnitsPage from '../pages/admin/HealthUnitsPage';
import StatisticsPage from '../pages/admin/StatisticsPage';
import SubscriptionsPage from '../pages/admin/SubscriptionsPage';
import UserFormPage from '../pages/admin/UserFormPage';
import HealthUnitFormPage from '../pages/admin/HealthUnitFormPage';

// Professional pages
import PredictionsPage from '../pages/professional/PredictionsPage';
import NewAttendancePage from '../pages/professional/NewAttendancePage';
import AttendancesPage from '../pages/professional/AttendancesPage';
import AttendanceDetailsPage from '../pages/professional/AttendanceDetailsPage';

// Route guard for authenticated users
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authState, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Center>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Route guard for specific user roles
const RoleRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { authState, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Center>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!authState.user || !allowedRoles.includes(authState.user.profile)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Administrator & General Administrator routes */}
      <Route 
        path="/users" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <UsersPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/users/new" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <UserFormPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/users/:id/edit" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <UserFormPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/health-units" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <HealthUnitsPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/health-units/new" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <HealthUnitFormPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/health-units/:id/edit" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <HealthUnitFormPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/statistics" 
        element={
          <RoleRoute allowedRoles={['administrator', 'general_administrator']}>
            <MainLayout>
              <StatisticsPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      {/* General Administrator only routes */}
      <Route 
        path="/subscriptions" 
        element={
          <RoleRoute allowedRoles={['general_administrator']}>
            <MainLayout>
              <SubscriptionsPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      {/* Professional routes */}
      <Route 
        path="/predictions" 
        element={
          <RoleRoute allowedRoles={['professional']}>
            <MainLayout>
              <PredictionsPage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/attendances/new" 
        element={
          <RoleRoute allowedRoles={['professional']}>
            <MainLayout>
              <NewAttendancePage />
            </MainLayout>
          </RoleRoute>
        } 
      />
      
      <Route 
        path="/attendances" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <AttendancesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/attendances/:id" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <AttendanceDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;