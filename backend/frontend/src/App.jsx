import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import NavBar from './components/navbar';
import Home from './components/Home';
import FindDoctor from './pages/BookingAppointment';
import Services from './pages/Services';
import Login from './pages/Login';
import AddDoctor from './pages/AddDoctor';
import AdminDashboard from './pages/Admin'; 
import VerifyDoctor from './pages/VerifyDoctor';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import AllDoctors from './pages/AllDoctor';
import AppointmentForm from './pages/AppointmentForm';


const ProtectedRoute = ({ children, allowedRole, user }) => {
  const storedUser = localStorage.getItem('user');
  let currentUser = user;

  if (!currentUser && storedUser && storedUser !== "undefined") {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      currentUser = null;
    }
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser && loggedInUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(loggedInUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Auth initialization failed", error);
        localStorage.removeItem('user'); 
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar user={user} onLogout={handleLogout} />
      
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/booking" element={<FindDoctor />} />
          <Route path='/appointment/:docId' element={<AppointmentForm />} />
          <Route path="/verify-doctor/:token" element={<VerifyDoctor />} />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRole="ADMIN" user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/add-doctor" 
            element={
              <ProtectedRoute allowedRole="ADMIN" user={user}>
                <AddDoctor />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/all-doctors" 
            element={
              <ProtectedRoute allowedRole="ADMIN" user={user}>
                <AllDoctors />
              </ProtectedRoute>
            } 
          />

          {/* 🩺 Doctor Protected Routes (Unified) */}
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute allowedRole="DOCTOR" user={user}>
                <DoctorDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/update-profile" 
            element={
              <ProtectedRoute allowedRole="DOCTOR" user={user}>
                <DoctorProfile user={user} />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

