# Auth Module

This module handles all authentication and user management functionality for EmberOne.

## Endpoints

### Sign Up
- **POST** `/api/auth/signup`
- Creates a new user account
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "CUSTOMER" // Optional, defaults to "CUSTOMER"
}
```
- Response:
```json
{
  "success": true,
  "data": {
    "message": "Please check your email to confirm your account",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      ...
    },
    "profile": {
      "id": "profile-uuid",
      "userId": "user-uuid",
      "email": "user@example.com",
      "fullName": "user",
      "role": "CUSTOMER",
      "createdAt": "2024-01-21T...",
      "updatedAt": "2024-01-21T..."
    }
  }
}
```

### Sign In
- **POST** `/api/auth/signin`
- Authenticates a user and returns a session
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Response:
```json
{
  "success": true,
  "data": {
    "session": {
      "access_token": "jwt-token",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "refresh-token",
      ...
    },
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      ...
    }
  }
}
```

### Get Session
- **GET** `/api/auth/session`
- Returns current session information
- Requires: Authorization header with bearer token
- Response:
```json
{
  "success": true,
  "data": {
    "session": {
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "role": "CUSTOMER",
        ...
      }
    }
  }
}
```

### Get Profile
- **GET** `/api/auth/profile`
- Returns the user's profile information
- Requires: Authorization header with bearer token
- Response:
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile-uuid",
      "userId": "user-uuid",
      "email": "user@example.com",
      "fullName": "user",
      "role": "CUSTOMER",
      "createdAt": "2024-01-21T...",
      "updatedAt": "2024-01-21T..."
    }
  }
}
```

### Sign Out
- **POST** `/api/auth/signout`
- Signs out the user from all devices
- Requires: Authorization header with bearer token
- Response:
```json
{
  "success": true,
  "data": {
    "message": "Signed out from all devices"
  }
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": 400, // HTTP status code
    "details": {} // Optional additional error details
  }
}
```

Common error codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access

The system supports three roles:
- `CUSTOMER`: Default role for new users
- `AGENT`: Support staff role
- `ADMIN`: Administrative role with full access

Each role has different permissions and access levels to various system features. 