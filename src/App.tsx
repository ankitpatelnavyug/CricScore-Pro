import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Matches from './pages/Matches';
import LiveScore from './pages/LiveScore';
import Tournaments from './pages/Tournaments';
import Profile from './pages/Profile';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthReady } = useAuth();
  
  if (!isAuthReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
              <Route path="/players" element={<PrivateRoute><Players /></PrivateRoute>} />
              <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
              <Route path="/live/:matchId" element={<LiveScore />} />
              <Route path="/tournaments" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
