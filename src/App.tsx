import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { LevelProvider } from './contexts/LevelContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Layout } from './components/Layout/Layout';
import { AuthForm } from './components/Auth/AuthForm';
import { LoadingSpinner } from './components/Auth/LoadingSpinner';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Workouts } from './pages/Workouts';
import { Journal } from './pages/Journal';
import { Chat } from './pages/Chat';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <SettingsProvider>
      <TaskProvider>
        <LevelProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </LevelProvider>
      </TaskProvider>
    </SettingsProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;