# Entity-Relationship Diagram

## Overview

This diagram shows the relationships between tables in the EmberOne database, including their fields and relationship types.

```mermaid
erDiagram
    profiles {
        uuid id PK
        text user_id UK "Links to auth.users"
        text email
        text full_name
        enum role "ADMIN|AGENT|CUSTOMER"
        timestamp created_at
        timestamp updated_at
    }

    tickets {
        uuid id PK
        text title
        text description
        enum status "OPEN|IN_PROGRESS|WAITING|CLOSED"
        enum priority "LOW|MEDIUM|HIGH|CRITICAL"
        uuid customer_id FK
        uuid assigned_agent_id FK "Optional"
        timestamp created_at
        timestamp updated_at
        timestamp closed_at "Optional"
        integer feedback_rating "Optional"
        text feedback_text "Optional"
    }

    comments {
        uuid id PK
        uuid ticket_id FK
        uuid author_id FK
        text content
        enum type "USER|SYSTEM|INTERNAL"
        boolean is_internal
        jsonb metadata "Optional"
        timestamp created_at
        timestamp updated_at
    }

    history {
        uuid id PK
        uuid ticket_id FK
        uuid actor_id FK
        text action
        jsonb old_value "Optional"
        jsonb new_value "Optional"
        jsonb metadata "Optional"
        timestamp created_at
    }

    profiles ||--o{ tickets : "creates"
    profiles ||--o{ tickets : "assigned to"
    profiles ||--o{ comments : "authors"
    profiles ||--o{ history : "acts in"
    tickets ||--o{ comments : "has"
    tickets ||--o{ history : "tracked in"
```

## Relationship Details

### One-to-Many Relationships

1. **profiles → tickets (as customer)**
   - A profile can create multiple tickets
   - Each ticket must have one customer
   - Relationship enforced by `customer_id` in tickets table

2. **profiles → tickets (as agent)**
   - A profile (agent) can be assigned to multiple tickets
   - Each ticket can have at most one assigned agent
   - Optional relationship through `assigned_agent_id`

3. **profiles → comments**
   - A profile can author multiple comments
   - Each comment has one author
   - Comments preserved with NULL author if profile deleted

4. **profiles → history**
   - A profile can be the actor in multiple history entries
   - Each history entry has one actor
   - History preserved when profile deleted

5. **tickets → comments**
   - A ticket can have multiple comments
   - Each comment belongs to one ticket
   - Comments deleted when ticket deleted (CASCADE)

6. **tickets → history**
   - A ticket can have multiple history entries
   - Each history entry belongs to one ticket
   - History preserved when ticket deleted

## Field Details

### Primary Keys
- All tables use UUID primary keys
- Keys are auto-generated using gen_random_uuid()

### Foreign Keys
- All foreign keys reference UUIDs from related tables
- Appropriate delete actions configured (CASCADE/SET NULL)

### Timestamps
- `created_at`: Set automatically on record creation
- `updated_at`: Updated automatically on record modification
- `closed_at`: Only for tickets, marks completion

### JSON Fields
- Used for flexible data storage
- Structured according to TypeScript interfaces
- Allows for schema evolution without migrations

## Indexes

### profiles
- Primary Key on `id`
- Unique Index on `user_id`

### tickets
- Primary Key on `id`
- Index on `customer_id`
- Index on `assigned_agent_id`
- Index on `status`
- Index on `priority`

### comments
- Primary Key on `id`
- Index on `ticket_id`
- Index on `author_id`
- Index on `created_at`

### history
- Primary Key on `id`
- Index on `ticket_id`
- Index on `actor_id`
- Index on `created_at` 