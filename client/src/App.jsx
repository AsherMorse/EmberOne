import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/shared/LandingPage';
import LoginPage from './pages/auth/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes - will add these later */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<div>Register Page Coming Soon</div>} />

        {/* Customer Routes - will add these later */}
        <Route path="/customer/*" element={<div>Customer Dashboard Coming Soon</div>} />

        {/* Agent Routes - will add these later */}
        <Route path="/agent/*" element={<div>Agent Dashboard Coming Soon</div>} />

        {/* Admin Routes - will add these later */}
        <Route path="/admin/*" element={<div>Admin Dashboard Coming Soon</div>} />

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
  );
}

export default App; 