# Project Roadmap

## Current Status

- Phase: Foundation
- Version: 0.0.3

---

## Core Objectives

1. [x] Build authentication system with Supabase
   - [x] Email/password authentication
   - [x] User registration
   - [x] Protected routes
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
- [x] Authentication System
  - [x] Create login page with email/password
  - [x] Implement registration form
  - [x] Set up protected routes
  - [x] Add Supabase auth hooks
  - [x] Implement session persistence
  - [x] Add form validation
  - [x] Add error messages
- [x] Database Layer
  - [x] Create entries table with schema
    - id (uuid)
    - content (text)
    - created_at (timestamp)
    - user_id (uuid)
  - [x] Set up indexes (created_at DESC)
  - [x] Configure RLS policies
    - Read: all authenticated users
    - Write: only new entries
  - [x] Create API contracts
  - [x] Set up real-time subscriptions

### Phase 2: Features & Polish (Sprint 2 - 4 days)

Target: Week 2

- [-] Entry Management
  - [-] Create entry input component
  - [-] Implement entry submission
  - [-] Add loading states
  - [-] Set up real-time updates
  - [-] Create recent entries display
  - [-] Implement auto-refresh
  - [-] Style components
- [ ] Testing & Polish
  - [ ] Unit tests with Vitest (80% coverage)
    - [ ] Form validation
    - [ ] State management
    - [ ] Utility functions
    - [ ] Hooks and custom logic
  - [ ] Integration tests with Vitest
    - [ ] Auth endpoints
    - [ ] Entry operations
    - [ ] RLS policies
    - [ ] API contracts
  - [ ] Component tests with Cypress
    - [ ] Auth forms
    - [ ] Entry input
    - [ ] Entry list
    - [ ] Loading states
  - [ ] E2E tests with Cypress
    - [ ] User registration flow
    - [ ] Login/logout flow
    - [ ] Entry submission flow
    - [ ] Real-time update flow
  - [ ] UI refinements

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
