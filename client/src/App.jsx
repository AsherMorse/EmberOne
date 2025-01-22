import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import { ROLES } from './contexts/auth.context';
import { ProtectedRoute, AuthLoader } from './components/auth';
import LandingPage from './pages/shared/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerDashboardPage from './pages/customer/DashboardPage';
import CustomerTicketsPage from './pages/customer/TicketsPage';
import CreateTicketPage from './pages/customer/CreateTicketPage';
import CustomerEditTicketPage from './pages/customer/EditTicketPage';
import AgentDashboardPage from './pages/agent/DashboardPage';
import AgentTicketsPage from './pages/agent/TicketsPage';
import AgentEditTicketPage from './pages/agent/EditTicketPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute 
          component={CustomerDashboardPage}
          requiredRole={ROLES.CUSTOMER}
        />
      } />
      <Route path="/customer/tickets" element={
        <ProtectedRoute 
          component={CustomerTicketsPage}
          requiredRole={ROLES.CUSTOMER}
        />
      } />
      <Route path="/customer/tickets/new" element={
        <ProtectedRoute 
          component={CreateTicketPage}
          requiredRole={ROLES.CUSTOMER}
        />
      } />
      <Route path="/customer/tickets/:id" element={
        <ProtectedRoute 
          component={CustomerEditTicketPage}
          requiredRole={ROLES.CUSTOMER}
        />
      } />

      {/* Agent Routes */}
      <Route path="/agent" element={
        <ProtectedRoute 
          component={AgentDashboardPage}
          requiredRole={ROLES.AGENT}
        />
      } />
      <Route path="/agent/tickets" element={
        <ProtectedRoute 
          component={AgentTicketsPage}
          requiredRole={ROLES.AGENT}
        />
      } />
      <Route path="/agent/tickets/:id" element={
        <ProtectedRoute 
          component={AgentEditTicketPage}
          requiredRole={ROLES.AGENT}
        />
      } />

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
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <AuthLoader>
      <RouterProvider router={router} />
    </AuthLoader>
  );
}

export default App; 