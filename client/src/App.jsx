import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROLES } from './contexts/auth.context';
import { ProtectedRoute, AuthLoader } from './components/auth';
import LandingPage from './pages/shared/LandingPage';
import LoginPage from './pages/auth/LoginPage';

function App() {
  return (
    <AuthLoader>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<div>Register Page Coming Soon</div>} />

          {/* Customer Routes */}
          <Route 
            path="/customer/*" 
            element={
              <ProtectedRoute 
                component={() => <div>Customer Dashboard Coming Soon</div>}
                requiredRole={ROLES.CUSTOMER}
              />
            } 
          />

          {/* Agent Routes */}
          <Route 
            path="/agent/*" 
            element={
              <ProtectedRoute 
                component={() => <div>Agent Dashboard Coming Soon</div>}
                requiredRole={ROLES.AGENT}
              />
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute 
                component={() => <div>Admin Dashboard Coming Soon</div>}
                requiredRole={ROLES.ADMIN}
              />
            } 
          />

          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-accent mb-4">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthLoader>
  );
}

export default App; 