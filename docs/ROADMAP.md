# Project Roadmap

## Current Status

- Phase: Planning
- Version: 0.1.0
- Updated: 2024-03-21

---

## Core Objectives

1. [ ] Build authentication system with Supabase
   - Email/password authentication
   - User registration
   - Protected routes
2. [ ] Create text entry and display system
   - Single text field input
   - Real-time 5 most recent entries display
   - Global visibility for authenticated users
3. [ ] Deploy production-ready MVP with AWS Amplify

---

## Development Phases

### Phase 1: Foundation (Sprint 1 - 4 days)

Target: Week 1

- [x] Project Setup
  - [x] Initialize Next.js with TypeScript
  - [x] Set up Supabase project
  - [x] Configure ESLint and Prettier
  - [x] Configure development environment
- [ ] Authentication System
  - [ ] Create login page with email/password
  - [ ] Implement registration form
  - [ ] Set up protected routes
  - [ ] Add Supabase auth hooks
  - [ ] Implement session persistence
  - [ ] Add form validation
  - [ ] Add error messages
- [ ] Database Layer
  - [ ] Create entries table with schema
    - id (uuid)
    - content (text)
    - created_at (timestamp)
    - user_id (uuid)
  - [ ] Set up indexes (created_at DESC)
  - [ ] Configure RLS policies
    - Read: all authenticated users
    - Write: own entries only
  - [ ] Create API contracts
  - [ ] Set up real-time subscriptions

### Phase 2: Features & Polish (Sprint 2 - 4 days)

Target: Week 2

- [ ] Entry Management
  - [ ] Create entry input component
  - [ ] Implement entry submission
  - [ ] Add loading states
  - [ ] Set up real-time updates
  - [ ] Create recent entries display
  - [ ] Implement auto-refresh
  - [ ] Style components
- [ ] Testing & Polish
  - [ ] Unit tests (80% coverage)
    - [ ] Form validation
    - [ ] State management
    - [ ] Utility functions
  - [ ] Integration tests
    - [ ] Auth endpoints
    - [ ] Entry operations
    - [ ] RLS policies
  - [ ] E2E tests
    - [ ] User registration
    - [ ] Login/logout
    - [ ] Entry submission
    - [ ] Real-time updates
  - [ ] UI refinements
  - [ ] Cross-browser testing

### Phase 3: Deployment

Target: End of Week 2

- [ ] AWS Amplify Setup
  - [ ] Connect GitHub repository
  - [ ] Configure build settings
  - [ ] Set up environment variables
  - [ ] Configure CI/CD pipeline
    - [ ] GitHub Actions for tests
    - [ ] Automated deployments
  - [ ] Set up environments
    - [ ] Production
    - [ ] Preview deployments
- [ ] Final Testing
  - [ ] Production environment testing
  - [ ] Performance verification
  - [ ] Security verification
  - [ ] Health checks

---

## Technical Debt

- [ ] Add comprehensive error handling
- [ ] Improve test coverage beyond critical paths
- [ ] Add logging and monitoring
- [ ] Optimize database queries
- [ ] Add error boundaries
- [ ] Improve loading states

---

## Future Ideas (Post-MVP)

- [ ] Add tRPC for complex API operations
- [ ] Implement "Remember me" functionality
- [ ] Add password reset capability
- [ ] Add character counter for text input
- [ ] Add edit/delete functionality
- [ ] Add user-specific views
- [ ] Add content moderation
- [ ] Add rate limiting
- [ ] Add entry metadata (timestamps, authors)
- [ ] Add social login options
- [ ] Add admin dashboard
- [ ] Add email verification

---

## Notes

- Using Next.js with TypeScript for frontend
- Supabase for authentication and database
  - Default security settings
  - Real-time subscriptions
  - Row Level Security (RLS)
- AWS Amplify for deployment
  - Automated CI/CD
  - Preview deployments
  - Zero-downtime updates
- Testing Strategy
  - Vitest for unit and integration tests
  - Cypress for E2E and component tests
- No monitoring requirements for MVP
- Focus on core functionality first
