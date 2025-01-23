-- Drop existing policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage roles" ON profiles;
DROP POLICY IF EXISTS "Customers can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Customers can create tickets" ON tickets;
DROP POLICY IF EXISTS "Customers can update their own tickets if not closed" ON tickets;
DROP POLICY IF EXISTS "Customers can provide feedback on closed tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can update assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can be assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Admins have full access to tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view comments on accessible tickets" ON comments;
DROP POLICY IF EXISTS "Users can create comments on accessible tickets" ON comments;
DROP POLICY IF EXISTS "Internal comments only visible to agents and admins" ON comments;
DROP POLICY IF EXISTS "Admins have full access to comments" ON comments;
DROP POLICY IF EXISTS "Users can view history of accessible tickets" ON history;
DROP POLICY IF EXISTS "System can create history entries" ON history;
DROP POLICY IF EXISTS "Admins have full access to history" ON history;

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()::text));

CREATE POLICY "Admins have full access to profiles"
  ON profiles
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage roles"
  ON profiles FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  );

-- Tickets policies
CREATE POLICY "Customers can view their own tickets"
  ON tickets FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = customer_id
    )
  );

CREATE POLICY "Customers can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = customer_id
    )
  );

CREATE POLICY "Customers can update their own tickets if not closed"
  ON tickets FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = customer_id
    )
    AND status != 'CLOSED'
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = customer_id
    )
    AND status != 'CLOSED'
  );

CREATE POLICY "Customers can provide feedback on closed tickets"
  ON tickets FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = customer_id
    )
    AND status = 'CLOSED'
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = customer_id
    )
    AND status = 'CLOSED'
    -- Only allow changes to feedback fields
    AND (
      (feedback_rating IS NOT NULL OR feedback_text IS NOT NULL)
      AND
      title = tickets.title
      AND description = tickets.description
      AND status = tickets.status
      AND priority = tickets.priority
      AND assigned_agent_id = tickets.assigned_agent_id
    )
  );

CREATE POLICY "Agents can view all tickets"
  ON tickets FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role IN ('AGENT', 'ADMIN')
    )
  );

CREATE POLICY "Agents can update assigned tickets"
  ON tickets FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = assigned_agent_id AND role = 'AGENT'
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE id = assigned_agent_id AND role = 'AGENT'
    )
  );

CREATE POLICY "Agents can be assigned tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid()::text 
      AND role IN ('AGENT', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid()::text 
      AND role IN ('AGENT', 'ADMIN')
    )
  );

CREATE POLICY "Admins have full access to tickets"
  ON tickets
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on accessible tickets"
  ON comments FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE
        auth.uid()::text IN (SELECT user_id FROM profiles WHERE id = customer_id)
        OR
        auth.uid()::text IN (SELECT user_id FROM profiles WHERE role IN ('AGENT', 'ADMIN'))
    )
  );

CREATE POLICY "Users can create comments on accessible tickets"
  ON comments FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets WHERE
        auth.uid()::text IN (SELECT user_id FROM profiles WHERE id = customer_id)
        OR
        auth.uid()::text IN (SELECT user_id FROM profiles WHERE role IN ('AGENT', 'ADMIN'))
    )
  );

CREATE POLICY "Internal comments only visible to agents and admins"
  ON comments FOR SELECT
  USING (
    type != 'INTERNAL'
    OR
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role IN ('AGENT', 'ADMIN')
    )
  );

CREATE POLICY "Admins have full access to comments"
  ON comments
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  );

-- History policies
CREATE POLICY "Users can view history of accessible tickets"
  ON history FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE
        auth.uid()::text IN (SELECT user_id FROM profiles WHERE id = customer_id)
        OR
        auth.uid()::text IN (SELECT user_id FROM profiles WHERE role IN ('AGENT', 'ADMIN'))
    )
  );

CREATE POLICY "System can create history entries"
  ON history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins have full access to history"
  ON history
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  );

-- Add revert statements as comments for easy rollback
/*
-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE history DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage roles" ON profiles;
DROP POLICY IF EXISTS "Customers can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Customers can create tickets" ON tickets;
DROP POLICY IF EXISTS "Customers can update their own tickets if not closed" ON tickets;
DROP POLICY IF EXISTS "Customers can provide feedback on closed tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can update assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Agents can be assigned tickets" ON tickets;
DROP POLICY IF EXISTS "Admins have full access to tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view comments on accessible tickets" ON comments;
DROP POLICY IF EXISTS "Users can create comments on accessible tickets" ON comments;
DROP POLICY IF EXISTS "Internal comments only visible to agents and admins" ON comments;
DROP POLICY IF EXISTS "Admins have full access to comments" ON comments;
DROP POLICY IF EXISTS "Users can view history of accessible tickets" ON history;
DROP POLICY IF EXISTS "System can create history entries" ON history;
DROP POLICY IF EXISTS "Admins have full access to history" ON history;
*/ 