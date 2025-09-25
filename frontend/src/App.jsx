import './App.css'
import { lazy, Suspense, useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './AuthContext.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

const Login = lazy(() => import('../components/LoginPage.jsx'));
const HomePage = lazy(() => import('../components/HomePage.jsx'));
const MyOrdersPage = lazy(() => import('../components/MyOrdersPage.jsx'));
const LandingPage = lazy(() => import('../components/LandingPage.jsx'));
const AdminPage = lazy(() => import('../components/AdminPage.jsx'));

function AppRoutes() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/home' 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path='/myorders' 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route path='/admin'
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense>
        <AppRoutes />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
