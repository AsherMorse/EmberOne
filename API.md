# EmberOne API Documentation

## Overview
EmberOne provides a RESTful API for managing a customer support ticket system. The API enables:
- Customer and agent account management
- Ticket creation and management
- Role-based access control (RBAC)
- Session management

All API responses are in JSON format and use standard HTTP response codes.

## Authentication
The API uses JWT (JSON Web Token) based authentication. All authenticated endpoints require a Bearer token in the Authorization header.

### Endpoints

#### `POST /api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "CUSTOMER"  // Optional, defaults to CUSTOMER
}
```

**Response:**
```json
{
  "message": "Please check your email to confirm your account",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "emailConfirmed": true
  },
  "profile": {
    "id": "profile_id",
    "fullName": "user",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

#### `POST /api/auth/signin`
Sign in to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "session": {
    "accessToken": "jwt_token",
    "expiresAt": 1737574439
  },
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "emailConfirmed": true,
    "lastSignIn": "2025-01-22T18:33:59.496Z"
  },
  "profile": {
    "id": "profile_id",
    "fullName": "user",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

#### `POST /api/auth/signout`
Sign out the current user.

**Response:**
```json
{
  "message": "Signed out successfully"
}
```

#### `GET /api/auth/session`
Get current session information.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "emailConfirmed": true,
    "lastSignIn": "2025-01-22T18:33:59.496Z"
  }
}
```

#### `GET /api/auth/profile`
Get the current user's profile.

**Response:**
```json
{
  "profile": {
    "id": "profile_id",
    "userId": "user_id",
    "email": "user@example.com",
    "fullName": "user",
    "role": "CUSTOMER",
    "createdAt": "2025-01-22T18:17:58.634Z",
    "updatedAt": "2025-01-22T18:17:58.634Z"
  }
}
```

### Error Responses
Authentication endpoints may return the following errors:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Server-side errors

## Tickets
The ticket system supports role-based operations for both customers and agents. Customers can create and manage their tickets, while agents can view, update status, and assign tickets.

### Customer Operations

#### `GET /api/tickets`
List all tickets for the authenticated customer.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): 'asc' or 'desc'

**Response:**
```json
{
  "tickets": [
    {
      "id": "ticket_id",
      "title": "Ticket Title",
      "description": "Ticket Description",
      "status": "OPEN",
      "priority": "HIGH",
      "customerId": "customer_id",
      "assignedAgentId": null,
      "customer": {
        "fullName": "Customer Name",
        "email": "customer@example.com"
      },
      "createdAt": "2025-01-22T18:17:58.634Z",
      "updatedAt": "2025-01-22T18:17:58.634Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### `POST /api/tickets`
Create a new ticket.

**Request Body:**
```json
{
  "title": "Ticket Title",
  "description": "Ticket Description",
  "priority": "HIGH"  // CRITICAL, HIGH, MEDIUM, or LOW
}
```

**Response:**
```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "id": "ticket_id",
    "title": "Ticket Title",
    "description": "Ticket Description",
    "status": "OPEN",
    "priority": "HIGH",
    "customerId": "customer_id",
    "assignedAgentId": null,
    "createdAt": "2025-01-22T18:17:58.634Z",
    "updatedAt": "2025-01-22T18:17:58.634Z"
  }
}
```

#### `GET /api/tickets/:id`
Get a specific ticket by ID.

**Response:**
```json
{
  "id": "ticket_id",
  "title": "Ticket Title",
  "description": "Ticket Description",
  "status": "OPEN",
  "priority": "HIGH",
  "customerId": "customer_id",
  "assignedAgentId": null,
  "customer": {
    "fullName": "Customer Name",
    "email": "customer@example.com"
  },
  "createdAt": "2025-01-22T18:17:58.634Z",
  "updatedAt": "2025-01-22T18:17:58.634Z"
}
```

#### `PATCH /api/tickets/:id`
Update a ticket (customers can update title, description, and priority).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "priority": "MEDIUM"
}
```

**Response:**
```json
{
  "message": "Ticket updated successfully",
  "ticket": {
    "id": "ticket_id",
    "title": "Updated Title",
    "description": "Updated Description",
    "status": "OPEN",
    "priority": "MEDIUM",
    "customerId": "customer_id",
    "assignedAgentId": null,
    "updatedAt": "2025-01-22T18:33:59.496Z"
  }
}
```

### Agent Operations

#### `GET /api/tickets?onlyAssigned=true`
List tickets with optional filter for assigned tickets.

**Query Parameters:**
- `onlyAssigned` (optional): When true, shows only tickets assigned to the agent
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): 'asc' or 'desc'

**Response:** Same as customer GET /api/tickets

#### `PATCH /api/tickets/:id`
Update a ticket's status (agents can only update status).

**Request Body:**
```json
{
  "status": "IN_PROGRESS"  // OPEN, IN_PROGRESS, WAITING, or CLOSED
}
```

**Response:**
```json
{
  "message": "Ticket updated successfully",
  "ticket": {
    "id": "ticket_id",
    "status": "IN_PROGRESS",
    "assignedAgentId": "agent_id",
    "updatedAt": "2025-01-22T18:33:59.496Z"
  }
}
```

#### `POST /api/tickets/:id/assign`
Assign a ticket to an agent.

**Request Body:**
```json
{
  "agentId": "agent_id"
}
```

**Response:**
```json
{
  "message": "Ticket assigned successfully",
  "ticket": {
    "id": "ticket_id",
    "assignedAgentId": "agent_id",
    "updatedAt": "2025-01-22T18:33:59.496Z"
  }
}
```

### Error Responses
Ticket endpoints may return the following errors:
- `400 Bad Request`: Validation errors (invalid input)
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Ticket or agent not found
- `500 Internal Server Error`: Server-side errors

## Data Models

### User
Represents a user account in the system.

**Fields:**
- `id` (string, UUID): Unique identifier
- `email` (string): User's email address
- `role` (enum): User's role in the system
  - Values: `CUSTOMER`, `AGENT`, `ADMIN`
- `emailConfirmed` (boolean): Whether the email has been confirmed
- `lastSignIn` (string, ISO date): Timestamp of last successful sign in
- `createdAt` (string, ISO date): Account creation timestamp
- `updatedAt` (string, ISO date): Account last update timestamp

### Profile
Extends user information with additional details.

**Fields:**
- `id` (string, UUID): Unique identifier
- `userId` (string, UUID): Reference to associated user
- `email` (string): User's email address
- `fullName` (string): User's full name
- `role` (enum): User's role, matches associated user
  - Values: `CUSTOMER`, `AGENT`, `ADMIN`
- `createdAt` (string, ISO date): Profile creation timestamp
- `updatedAt` (string, ISO date): Profile last update timestamp

### Ticket
Represents a support ticket in the system.

**Fields:**
- `id` (string, UUID): Unique identifier
- `title` (string): Ticket title
- `description` (string): Detailed description of the issue
- `status` (enum): Current ticket status
  - Values: `OPEN`, `IN_PROGRESS`, `WAITING`, `CLOSED`
- `priority` (enum): Ticket priority level
  - Values: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `customerId` (string, UUID): Reference to customer profile
- `assignedAgentId` (string, UUID, nullable): Reference to assigned agent profile
- `customer` (object): Embedded customer information
  - `fullName` (string): Customer's full name
  - `email` (string): Customer's email
- `createdAt` (string, ISO date): Ticket creation timestamp
- `updatedAt` (string, ISO date): Ticket last update timestamp

**Access Control:**
- Customers can:
  - Create tickets
  - View their own tickets
  - Update title, description, and priority
- Agents can:
  - View all tickets (or filter to assigned tickets)
  - Update ticket status
  - Assign tickets to themselves or other agents
- Admins have full access to all operations

## Error Handling

All errors in the API follow a consistent format:

```json
{
  "message": "Human-readable error message",
  "code": 400
}
```

### Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource was successfully created
- `400 Bad Request`: Invalid input or validation failed
- `401 Unauthorized`: Invalid email or password, or missing/invalid authentication token
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

### Validation Errors

#### Authentication
- Email validation:
  - "Email is required"
  - "Invalid email format"
- Password validation:
  - "Password is required"
  - "Password must be at least 6 characters long"
- Role validation:
  - "Invalid role" (must be CUSTOMER, AGENT, or ADMIN)
- Profile validation:
  - "Full name must be at least 2 characters long"

#### Tickets
- Creation validation:
  - "Title is required"
  - "Description is required"
  - "Priority is required"
  - "Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL"
- Update validation (Customer):
  - "Title cannot be empty"
  - "Description cannot be empty"
  - "Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL"
  - "Customers cannot update status"
- Update validation (Agent):
  - "Status is required"
  - "Invalid status. Must be OPEN, IN_PROGRESS, WAITING, or CLOSED"
  - "Agents can only update status. Cannot update: title, description, priority"
- Assignment validation:
  - "Agent ID is required"
  - "Only agents can assign tickets"

### Error Examples

1. Invalid Sign In:
```json
{
  "message": "Invalid email or password",
  "code": 401
}
```

2. Invalid Ticket Update (Customer):
```json
{
  "message": "Customers cannot update: status",
  "code": 403
}
```

3. Invalid Ticket Update (Agent):
```json
{
  "message": "Agents can only update status. Cannot update: title, description, priority",
  "code": 403
}
```

4. Resource Not Found:
```json
{
  "message": "Ticket not found",
  "code": 404
}
```

### Best Practices for Error Handling

1. Always check the HTTP status code first
2. The `message` field provides a human-readable summary
3. For `400` errors, address all validation issues before retrying
4. For `401` errors, refresh the authentication token
5. For `403` errors, verify the user has the required role
6. For `409` errors, resolve the conflict before retrying
7. For `500` errors, contact support with the error details

## Rate Limiting
Information about rate limits and quotas.

## Best Practices
Guidelines for using the API effectively.

## Examples
Common usage examples and code snippets.