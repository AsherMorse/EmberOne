# Row Level Security Policies

## Overview

EmberOne uses PostgreSQL's Row Level Security (RLS) to enforce access control at the database level. These policies ensure data privacy and security by controlling which rows each user can view or modify based on their role and relationship to the data.

## Global Rules

- System-level operations bypass RLS
- Authenticated users can only access data they're authorized to see
- All tables have RLS enabled (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`)

## Policies by Table

### profiles

**View Policies**:
- `Public profiles are viewable by everyone`
  - Everyone can view basic profile information
  - Enables user discovery and assignment features
  - Sensitive fields are filtered in the application layer

**Modify Policies**:
- `Users can update their own profile`
  - Users can only modify their own profile data
  - Cannot modify their own role
  - Enforced by matching auth.uid() with user_id
- `Admins can manage roles`
  - Only admins can change user roles
  - Full access to all profile operations
  - Required for user management

### tickets

**View Policies**:
- `Customers can view their own tickets`
  - Customers see only tickets they created
  - Matches customer_id with user's profile ID
- `Agents can view all tickets`
  - Agents have full ticket visibility
  - Enables support staff to handle any ticket
- `Admins have full access`
  - Complete control over all tickets
  - Can override any restrictions

**Create Policies**:
- `Customers can create tickets`
  - Any authenticated customer can create tickets
  - System automatically sets customer_id to user's profile ID

**Modify Policies**:
- `Customers can update their own tickets if not closed`
  - Only if status != 'CLOSED'
  - Only the ticket creator can modify
- `Customers can provide feedback on closed tickets`
  - Only if status = 'CLOSED'
  - Can only update feedback_rating and feedback_text
  - Only the ticket creator can provide feedback
- `Agents can update assigned tickets`
  - Agents can modify tickets assigned to them
  - Limited to tickets where they are the assigned agent
- `Agents can be assigned tickets`
  - Agents can be assigned to any ticket
  - Enables ticket distribution and workload management
- `Admins have full modification rights`
  - Can update any ticket regardless of status
  - Can reassign tickets to any agent

### comments

**View Policies**:
- `Users can view comments on accessible tickets`
  - If user can view the ticket, they can see its comments
  - Except internal comments (type = 'INTERNAL')
- `Internal comments only visible to agents and admins`
  - Filters internal comments from customer view
  - Requires AGENT or ADMIN role
- `Admins have full visibility`
  - Can view all comments on all tickets
  - No restrictions on internal comments

**Create Policies**:
- `Users can create comments on accessible tickets`
  - Must have access to the parent ticket
  - System sets author_id automatically
- `Agents can create internal comments`
  - Requires AGENT or ADMIN role
  - For internal notes and private discussions
- `Admins have full creation rights`
  - Can create any type of comment
  - No restrictions on comment creation

### history

**View Policies**:
- `Users can view history of accessible tickets`
  - If user can view the ticket, they can see its history
  - Provides transparency of ticket changes
- `Admins have full history access`
  - Can view history for all tickets
  - Complete audit trail visibility

**Create Policies**:
- `System can create history entries`
  - History entries are system-generated
  - Created automatically on ticket changes
- `Admins can create manual history entries`
  - Full access to history creation
  - Useful for manual audit trail updates

## Implementation Details

### Authentication Context

The following context is available in all RLS policies:
- `auth.uid()`: The authenticated user's ID from Supabase Auth
- `auth.role()`: The user's role from the JWT token
- `current_user`: The database user executing the query
- `current_timestamp`: The current time for temporal checks

### Common Policy Patterns

1. **Self-Record Access**
   - User can only access their own records
   - Matches the authenticated user ID with the record's user ID
   - Example: Users editing their own profile

2. **Role-Based Access**
   - Access granted based on user's role
   - Typically checks for ADMIN or AGENT roles
   - Example: Agents viewing all tickets

3. **Ownership Checks**
   - Verifies if the user owns or is associated with a record
   - Links through profile ID to check relationships
   - Example: Customer viewing their tickets

4. **Status-Based Restrictions**
   - Combines status checks with ownership
   - Prevents actions on records in certain states
   - Example: No updates to closed tickets

### Security Considerations

1. **Default Deny**
   - All tables start with RLS enabled and no policies
   - Access must be explicitly granted
   - Safer than relying on revoking permissions

2. **Policy Layering**
   - Policies combine with OR logic
   - Each policy handles one access pattern
   - Makes policies easier to maintain and audit

3. **Performance Impact**
   - RLS adds overhead to queries
   - Use efficient indexes on commonly filtered columns
   - Monitor query performance with RLS enabled

4. **Testing Requirements**
   - Test policies with different user roles
   - Verify both positive and negative cases
   - Include edge cases in test suite

## Common Access Patterns

### Customer Access Patterns

1. **Viewing Own Tickets**
   - Customer can only see tickets they created
   - System matches the ticket's customer_id with user's profile
   - Includes all ticket details and non-internal comments

2. **Creating Tickets**
   - Any authenticated customer can create tickets
   - System automatically sets the customer_id
   - Initial status is always set to OPEN

3. **Updating Open Tickets**
   - Can only update their own tickets
   - Updates blocked if ticket status is CLOSED
   - Cannot modify certain fields (e.g., assigned agent)

### Agent Access Patterns

1. **Ticket Management**
   - Can view all tickets in the system
   - Can update tickets assigned to them
   - Full access to internal comments

2. **Comment Management**
   - Can create internal and regular comments
   - Can view all comments including internal ones
   - Can update their own comments

### Admin Access Patterns

1. **Full Access**
   - Can view and modify all records
   - Can manage user roles and permissions
   - Can see all system data and history

2. **System Operations**
   - Can perform maintenance tasks
   - Can override normal access restrictions
   - Responsible for user management

### Maintenance Tasks

1. **Policy Updates**
   - Test new policies in development first
   - Apply changes during low-traffic periods
   - Keep policy names consistent and descriptive

2. **Monitoring**
   - Track policy performance impact
   - Monitor failed access attempts
   - Review policy effectiveness regularly

3. **Troubleshooting**
   - Use admin override for debugging
   - Review active policies
   - Verify role assignments in auth system 