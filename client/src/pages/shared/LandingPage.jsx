import { Link } from 'react-router-dom';
import { Header } from '../../components/layout';
import { Button } from '../../components/ui';
import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      
      // When we reach near the end, jump back to start
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'auto' });
      }
      
      // When we reach the start (scrolling backwards), jump to end
      if (scrollLeft <= 10) {
        scrollContainer.scrollTo({ left: scrollWidth - clientWidth - 10, behavior: 'auto' });
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-accent">EmberOne</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Kindling Connections, One Ticket at a Time. Modern customer support that puts your needs first.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" as={Link} to="/register">Get Started</Button>
            <Button size="lg" variant="outline" as={Link} to="/login">Sign In</Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EmberOne?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background border border-muted">
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Ticketing</h3>
              <p className="text-muted-foreground">Create and manage support tickets with an intuitive interface. Track progress, set priorities, and resolve issues efficiently.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-muted">
              <h3 className="text-xl font-semibold text-foreground mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">Work together seamlessly with built-in tools for communication. Share notes, assign tasks, and coordinate responses effectively.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-muted">
              <h3 className="text-xl font-semibold text-foreground mb-3">Performance Insights</h3>
              <p className="text-muted-foreground">Track key metrics, analyze trends, and optimize your support operations with comprehensive reporting tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center mx-auto mb-4">1</div>
            <h3 className="font-semibold mb-2">Create Account</h3>
            <p className="text-sm text-muted-foreground">Sign up as a customer or support agent</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center mx-auto mb-4">2</div>
            <h3 className="font-semibold mb-2">Submit Ticket</h3>
            <p className="text-sm text-muted-foreground">Describe your issue or request</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center mx-auto mb-4">3</div>
            <h3 className="font-semibold mb-2">Get Support</h3>
            <p className="text-sm text-muted-foreground">Receive prompt assistance from our team</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center mx-auto mb-4">4</div>
            <h3 className="font-semibold mb-2">Resolve & Review</h3>
            <p className="text-sm text-muted-foreground">Close tickets and provide feedback</p>
          </div>
        </div>
      </section>

      {/* CTA Section with Testimonials */}
      <section className="bg-accent text-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-xl opacity-90">Join thousands of satisfied customers using EmberOne</p>
          </div>

          {/* Testimonials */}
          <div className="relative max-w-5xl mx-auto mb-6 overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 pb-4 -mb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Original set */}
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">TC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Tom Chen</h4>
                    <p className="text-xs text-muted-foreground">Support Manager</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"EmberOne has transformed how we handle customer support. The interface is intuitive, and the team collaboration features are outstanding."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">SP</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Parker</h4>
                    <p className="text-xs text-muted-foreground">Customer Success Lead</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"The analytics and reporting tools have helped us identify areas for improvement and optimize our support workflow. Highly recommended!"</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">MR</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Mike Rodriguez</h4>
                    <p className="text-xs text-muted-foreground">Technical Support</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"The ticket management system is a game-changer. It's easy to track progress and communicate with customers effectively."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">AK</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Alex Kim</h4>
                    <p className="text-xs text-muted-foreground">Product Manager</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"The platform's flexibility and ease of use have made it an essential tool for our team. Customer satisfaction has improved significantly."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">LM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Lisa Martinez</h4>
                    <p className="text-xs text-muted-foreground">Support Team Lead</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"EmberOne's collaborative features have revolutionized our support workflow. The team is more efficient than ever."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">RJ</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Ryan Johnson</h4>
                    <p className="text-xs text-muted-foreground">IT Director</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"Implementation was smooth, and the results were immediate. Our support metrics have improved across the board."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">EP</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Emma Patel</h4>
                    <p className="text-xs text-muted-foreground">Customer Experience</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"The feedback system has helped us better understand our customers' needs. A must-have for any support team."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">AI</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">AI Assistant</h4>
                    <p className="text-xs text-muted-foreground">Definitely Human</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"As a totally real human customer, I can confirm that EmberOne has not been taken over by AI. Beep boop- I mean, great product!"</p>
              </div>

              {/* Duplicate set for infinite scroll effect */}
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">TC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Tom Chen</h4>
                    <p className="text-xs text-muted-foreground">Support Manager</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"EmberOne has transformed how we handle customer support. The interface is intuitive, and the team collaboration features are outstanding."</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">SP</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Parker</h4>
                    <p className="text-xs text-muted-foreground">Customer Success Lead</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"The analytics and reporting tools have helped us identify areas for improvement and optimize our support workflow. Highly recommended!"</p>
              </div>
              <div className="bg-background rounded-lg p-4 shadow-lg shrink-0 w-[300px] snap-center">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent text-xl font-semibold">MR</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Mike Rodriguez</h4>
                    <p className="text-xs text-muted-foreground">Technical Support</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">"The ticket management system is a game-changer. It's easy to track progress and communicate with customers effectively."</p>
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-accent to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-accent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">EmberOne</h3>
              <p className="text-sm text-muted-foreground">Modern customer support platform designed to streamline your support operations.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-accent">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-accent">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/customer" className="hover:text-accent">Customer Portal</Link></li>
                <li><Link to="/agent" className="hover:text-accent">Agent Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-muted text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} EmberOne. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 