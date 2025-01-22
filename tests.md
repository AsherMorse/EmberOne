# API Test Flow

## 1. Customer Flow

### 1.1 Customer Account Creation & Auth
# Create customer account
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'

# Sign in as customer
export CUSTOMER_TOKEN=$(curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }' | jq -r '.token')

# Verify customer session
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Get customer profile
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

### 1.2 Customer Ticket Operations
# Create new ticket
export TICKET_ID=$(curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test ticket",
    "priority": "HIGH"
  }' | jq -r '.id')

# List customer tickets
curl http://localhost:3000/api/tickets \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Get specific ticket
curl http://localhost:3000/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Update ticket as customer (should succeed)
curl -X PATCH http://localhost:3000/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "priority": "MEDIUM"
  }'

# Try to update status as customer (should fail)
curl -X PATCH http://localhost:3000/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

## 2. Agent Flow

### 2.1 Agent Account Creation & Auth
# Create agent account
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123",
    "role": "AGENT"
  }'

# Sign in as agent
export AGENT_TOKEN=$(curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }' | jq -r '.token')

# Get agent profile (save ID for later)
export AGENT_PROFILE_ID=$(curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $AGENT_TOKEN" | jq -r '.id')

### 2.2 Agent Ticket Operations
# List all tickets as agent (should see all tickets)
curl http://localhost:3000/api/tickets \
  -H "Authorization: Bearer $AGENT_TOKEN"

# Update ticket status as agent
curl -X PATCH http://localhost:3000/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# Assign ticket to self
curl -X POST http://localhost:3000/api/tickets/$TICKET_ID/assign \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentId\": \"$AGENT_PROFILE_ID\"
  }"

# Update ticket to resolved
curl -X PATCH http://localhost:3000/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED"
  }'

## 3. Cleanup

### 3.1 Sign Out Both Users
# Sign out customer
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Sign out agent  
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Authorization: Bearer $AGENT_TOKEN"

### 3.2 Verify Sessions Invalid
# Try customer session (should fail)
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Try agent session (should fail)  
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $AGENT_TOKEN"
