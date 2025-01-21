import { Link } from 'react-router-dom';
import { Header } from '../../components/layout';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-accent">EmberOne</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            A modern ticket management solution designed for seamless customer support and team collaboration
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-muted">
            <h3 className="text-xl font-semibold text-foreground mb-3">Easy Ticketing</h3>
            <p className="text-muted-foreground">Create and manage support tickets with an intuitive interface designed for efficiency.</p>
          </div>
          <div className="p-6 rounded-lg border border-muted">
            <h3 className="text-xl font-semibold text-foreground mb-3">Team Collaboration</h3>
            <p className="text-muted-foreground">Work together seamlessly with built-in tools for communication and task management.</p>
          </div>
          <div className="p-6 rounded-lg border border-muted">
            <h3 className="text-xl font-semibold text-foreground mb-3">Analytics</h3>
            <p className="text-muted-foreground">Track performance and gain insights with comprehensive reporting tools.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 