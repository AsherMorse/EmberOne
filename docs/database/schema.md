# EmberOne Database Schema

## Overview

EmberOne uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports a ticket-based support system with role-based access control and comprehensive audit logging.

## Tables

### profiles

**Purpose**: Stores user profile information and links to Supabase Auth.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `user_id` (Text, Unique): Links to Supabase auth.users
- `email` (Text): User's email address
- `full_name` (Text): User's full name
- `role` (Enum): User's role in the system (ADMIN, AGENT, or CUSTOMER)
- `created_at` (Timestamp): When the profile was created
- `updated_at` (Timestamp): When the profile was last updated

**Indexes**:
- Primary Key on `id`
- Unique Index on `user_id`

### tickets

**Purpose**: Stores support tickets with status tracking and assignment information.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `title` (Text): Ticket subject line
- `description` (Text): Detailed ticket description
- `status` (Enum): Current ticket status (OPEN, IN_PROGRESS, WAITING, CLOSED)
- `priority` (Enum): Ticket priority level (LOW, MEDIUM, HIGH, CRITICAL)
- `customer_id` (UUID): Reference to the customer who created the ticket
- `assigned_agent_id` (UUID, Optional): Reference to the agent assigned to the ticket
- `created_at` (Timestamp): When the ticket was created
- `updated_at` (Timestamp): When the ticket was last updated
- `closed_at` (Timestamp, Optional): When the ticket was closed
- `feedback_rating` (Integer, Optional): Customer satisfaction rating (1-5)
- `feedback_text` (Text, Optional): Customer's textual feedback

**Indexes**:
- Primary Key on `id`
- Index on `customer_id` for quick customer ticket lookups
- Index on `assigned_agent_id` for agent workload queries
- Index on `status` for filtering by ticket state
- Index on `priority` for priority-based sorting

### comments

**Purpose**: Stores ticket conversations and internal notes.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `ticket_id` (UUID): Reference to the parent ticket
- `author_id` (UUID): Reference to the comment author
- `content` (Text): The comment message
- `type` (Enum): Comment type (USER, SYSTEM, INTERNAL)
- `is_internal` (Boolean): Whether the comment is internal-only
- `metadata` (JSON): Additional data like attachments or edit history
- `created_at` (Timestamp): When the comment was created
- `updated_at` (Timestamp): When the comment was last updated

**Indexes**:
- Primary Key on `id`
- Index on `ticket_id` for conversation views
- Index on `author_id` for user activity queries
- Index on `created_at` for chronological sorting

### history

**Purpose**: Tracks changes to tickets for audit purposes.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `ticket_id` (UUID): Reference to the modified ticket
- `actor_id` (UUID): Reference to the user who made the change
- `action` (Text): Type of change (e.g., status_changed, priority_changed)
- `old_value` (JSON): Previous state
- `new_value` (JSON): New state
- `metadata` (JSON): Additional context about the change
- `created_at` (Timestamp): When the change occurred

**Indexes**:
- Primary Key on `id`
- Index on `ticket_id` for ticket timeline views
- Index on `actor_id` for user activity audits
- Index on `created_at` for chronological sorting

## Relationships

1. **Customer Tickets**
   - A customer (profile) can have multiple tickets
   - Each ticket must belong to one customer
   - Relationship: One-to-Many from profiles to tickets

2. **Agent Assignments**
   - An agent (profile) can be assigned to multiple tickets
   - A ticket can be assigned to one agent (optional)
   - Relationship: One-to-Many from profiles to tickets

3. **Ticket Comments**
   - A ticket can have multiple comments
   - Each comment belongs to one ticket
   - Comments are deleted when their ticket is deleted (CASCADE)
   - Relationship: One-to-Many from tickets to comments

4. **Comment Authors**
   - A user (profile) can author multiple comments
   - Each comment has one author
   - Author reference is set to NULL if user is deleted
   - Relationship: One-to-Many from profiles to comments

5. **Ticket History**
   - A ticket can have multiple history entries
   - Each history entry belongs to one ticket
   - History is preserved when ticket is deleted
   - Relationship: One-to-Many from tickets to history

## Data Types

### Enums

1. **Role Types**
   - `ADMIN`: System administrators with full access
   - `AGENT`: Support staff who handle tickets
   - `CUSTOMER`: End users who create tickets

2. **Ticket Status**
   - `OPEN`: New ticket awaiting agent assignment
   - `IN_PROGRESS`: Currently being worked on by an agent
   - `WAITING`: Awaiting customer response
   - `CLOSED`: Resolution achieved, no further action needed

3. **Priority Levels**
   - `LOW`: Non-urgent issues, can be handled in order
   - `MEDIUM`: Standard priority, normal response time
   - `HIGH`: Urgent issues requiring quick response
   - `CRITICAL`: Immediate attention required, highest priority

4. **Comment Types**
   - `USER`: Standard comments from users or agents
   - `SYSTEM`: Automated notifications and updates
   - `INTERNAL`: Private notes visible only to staff

### JSON Structures

1. **Comment Metadata**
   ```typescript
   interface CommentMetadata {
     attachments?: {
       id: string;
       name: string;
       type: string;
       size: number;
       url: string;
     }[];
     editHistory?: {
       timestamp: string;
       oldContent: string;
       editor: string;
     }[];
     systemData?: Record<string, unknown>;
   }
   ```

2. **History Values**
   ```typescript
   interface HistoryValue {
     status?: TicketStatus;
     priority?: TicketPriority;
     assignedAgentId?: string | null;
     title?: string;
     description?: string;
   }
   ```

3. **History Metadata**
   ```typescript
   interface HistoryMetadata {
     reason?: string;
     source: 'customer_portal' | 'agent_dashboard' | 'system';
     additionalContext?: Record<string, unknown>;
   }
   ``` 