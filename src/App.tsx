import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import apiClient from './api/axios';
import { Login } from './components/Login';
import { Drawer } from './components/Drawer';
import { Dashboard } from './components/Dashboard';
import { UserList } from './components/UserList';
import { Reports } from './components/Reports';


const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Drawer />
      <div className="lg:ml-64 min-h-screen">
        <Outlet /> 
      </div>
    </div>
  );
};

// A component to protect routes
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const token = useAuthStore.getState().token;

  
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
