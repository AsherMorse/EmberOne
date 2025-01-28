import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import { ROLES } from './contexts/auth.context';
import { ProtectedRoute, AuthLoader } from './components/auth';
import { SessionCheck } from './components/auth/SessionCheck';
import LandingPage from './pages/shared/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerDashboardPage from './pages/customer/DashboardPage';
import CustomerTicketsPage from './pages/customer/TicketsPage';
import CreateTicketPage from './pages/customer/CreateTicketPage';
import CustomerEditTicketPage from './pages/customer/EditTicketPage';
import CustomerFeedbackPage from './pages/customer/FeedbackPage';
import CustomerViewCommentsPage from './pages/customer/ViewCommentsPage';
import AgentDashboardPage from './pages/agent/DashboardPage';
import AgentTicketsPage from './pages/agent/TicketsPage';
import AgentEditTicketPage from './pages/agent/EditTicketPage';
import AgentViewCommentsPage from './pages/agent/ViewCommentsPage';
import ViewFeedbackPage from './pages/agent/ViewFeedbackPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminTicketsPage from './pages/admin/TicketsPage';
import AdminCommandsPage from './pages/admin/CommandsPage';

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
      <Route path="/customer/tickets/:id/comments" element={
        <ProtectedRoute 
          component={CustomerViewCommentsPage}
          requiredRole={ROLES.CUSTOMER}
        />
      } />
      <Route path="/customer/tickets/:id/feedback" element={
        <ProtectedRoute 
          component={CustomerFeedbackPage}
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
      <Route path="/agent/tickets/:id/comments" element={
        <ProtectedRoute 
          component={AgentViewCommentsPage}
          requiredRole={ROLES.AGENT}
        />
      } />
      <Route path="/agent/tickets/:id/feedback" element={
        <ProtectedRoute 
          component={ViewFeedbackPage}
          requiredRole={ROLES.AGENT}
        />
      } />

      {/* Admin Routes */}
      <Route 
        path="/admin"
        element={
          <ProtectedRoute 
            component={AdminDashboardPage}
            requiredRole={ROLES.ADMIN}
          />
        }
      >
        <Route index element={<AdminTicketsPage />} />
        <Route path="tickets" element={<AdminTicketsPage />} />
        <Route path="commands" element={<AdminCommandsPage />} />
      </Route>

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
      <SessionCheck>
        <RouterProvider router={router} />
      </SessionCheck>
    </AuthLoader>
  );
}

export default App; 