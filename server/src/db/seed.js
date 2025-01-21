import 'dotenv/config';
import { db } from './index.js';
import { profiles, tickets, comments, history } from './schema/index.js';

// User IDs from profiles_rows-4.csv
const ADMIN_ID = 'b1f3f5e3-3fca-410a-a370-dd28b05c4714';
const AGENT_ID = '1a6689f4-8417-42f6-8281-e264daa0d873';
const CUSTOMER_ID = '4be362ba-8a92-4913-8ae3-7b6fee9fd9e3';

async function cleanDatabase() {
  console.log('Cleaning existing data...');
  // Delete in reverse order of dependencies
  await db.delete(history);
  await db.delete(comments);
  await db.delete(tickets);
  await db.delete(profiles);
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clean existing data first
    await cleanDatabase();

    // Create test profiles
    console.log('Creating test profiles...');
    const adminProfile = await db.insert(profiles).values([
      {
        id: ADMIN_ID,
        userId: '800491b9-ce58-4c00-8f25-0ab938f0570a',
        email: 'test.admin@emberone.com',
        fullName: 'Test Admin',
        role: 'ADMIN'
      }
    ]).returning();

    const agentProfile = await db.insert(profiles).values([
      {
        id: AGENT_ID,
        userId: '9e9bf3c0-48f3-4866-afe4-652845f1aa0e',
        email: 'test.agent@emberone.com',
        fullName: 'Test Agent',
        role: 'AGENT'
      }
    ]).returning();

    const customerProfile = await db.insert(profiles).values([
      {
        id: CUSTOMER_ID,
        userId: '95271b3a-ba12-407b-afee-430870bbae09',
        email: 'test.customer@example.com',
        fullName: 'Test Customer',
        role: 'CUSTOMER'
      }
    ]).returning();

    // Create test tickets
    console.log('Creating test tickets...');
    const testTickets = await db.insert(tickets).values([
      {
        title: 'Cannot access my account',
        description: 'I keep getting an error when trying to log in. Need urgent help!',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        customerId: CUSTOMER_ID,
        assignedAgentId: AGENT_ID,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z')
      },
      {
        title: 'Feature request: Dark mode',
        description: 'Would love to have a dark mode option for the dashboard.',
        status: 'OPEN',
        priority: 'LOW',
        customerId: CUSTOMER_ID,
        assignedAgentId: AGENT_ID,
        createdAt: new Date('2024-01-10T09:15:00Z'),
        updatedAt: new Date('2024-01-10T09:15:00Z')
      },
      {
        title: 'Payment processing failed',
        description: 'Transaction failed multiple times. Error code: XYZ123',
        status: 'CLOSED',
        priority: 'CRITICAL',
        customerId: CUSTOMER_ID,
        assignedAgentId: AGENT_ID,
        createdAt: new Date('2024-01-05T16:20:00Z'),
        updatedAt: new Date('2024-01-07T11:45:00Z'),
        closedAt: new Date('2024-01-07T11:45:00Z')
      },
      {
        title: 'Need help with API integration',
        description: 'Looking for documentation on how to integrate with your REST API',
        status: 'OPEN',
        priority: 'MEDIUM',
        customerId: CUSTOMER_ID,
        createdAt: new Date('2024-01-20T08:30:00Z'),
        updatedAt: new Date('2024-01-20T08:30:00Z')
      },
      {
        title: 'Bug report: Console errors',
        description: 'Getting JavaScript errors in console when loading dashboard',
        status: 'OPEN',
        priority: 'HIGH',
        customerId: CUSTOMER_ID,
        createdAt: new Date('2024-01-21T13:45:00Z'),
        updatedAt: new Date('2024-01-21T13:45:00Z')
      },
      {
        title: 'Additional information needed',
        description: 'Please provide more details about your system configuration',
        status: 'WAITING',
        priority: 'MEDIUM',
        customerId: CUSTOMER_ID,
        assignedAgentId: AGENT_ID,
        createdAt: new Date('2024-01-18T15:20:00Z'),
        updatedAt: new Date('2024-01-19T10:00:00Z')
      }
    ]).returning();

    // Create test comments
    console.log('Creating test comments...');
    const commentData = testTickets.flatMap(ticket => {
      const comments = [];
      if (ticket.status === 'OPEN') {
        comments.push({
          ticketId: ticket.id,
          authorId: ticket.customerId,
          content: 'Just created this ticket, awaiting response.',
          type: 'USER',
          isInternal: false,
          metadata: { source: 'customer_portal' }
        });
      } else if (ticket.status === 'IN_PROGRESS') {
        comments.push(
          {
            ticketId: ticket.id,
            authorId: ticket.customerId,
            content: 'Any updates on this issue?',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'customer_portal' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'I am investigating this issue. Will update shortly.',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          }
        );
      } else if (ticket.status === 'WAITING') {
        comments.push(
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'Could you please provide your system specifications?',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.customerId,
            content: 'What specific information do you need?',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'customer_portal' }
          }
        );
      } else if (ticket.status === 'CLOSED') {
        comments.push(
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'Issue has been resolved. Please confirm.',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.customerId,
            content: 'Yes, everything is working now. Thank you!',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'customer_portal' }
          }
        );
      }
      return comments;
    });

    await db.insert(comments).values(commentData);

    // Create test history
    console.log('Creating test history...');
    const historyData = testTickets.flatMap(ticket => {
      const entries = [];
      if (ticket.status !== 'OPEN') {
        entries.push({
          ticketId: ticket.id,
          actorId: ticket.assignedAgentId,
          action: 'status_changed',
          oldValue: { status: 'OPEN' },
          newValue: { status: ticket.status },
          metadata: { 
            reason: 'Status updated by agent',
            source: 'agent_dashboard'
          }
        });
      }
      if (ticket.priority === 'CRITICAL') {
        entries.push({
          ticketId: ticket.id,
          actorId: ADMIN_ID,
          action: 'priority_changed',
          oldValue: { priority: 'HIGH' },
          newValue: { priority: 'CRITICAL' },
          metadata: { 
            reason: 'Escalated due to business impact',
            source: 'admin_dashboard'
          }
        });
      }
      if (ticket.status === 'CLOSED') {
        entries.push({
          ticketId: ticket.id,
          actorId: ticket.customerId,
          action: 'satisfaction_rating',
          oldValue: { rating: null },
          newValue: { rating: 5 },
          metadata: { 
            feedback: 'Great service!',
            source: 'customer_portal'
          }
        });
      }
      return entries;
    });

    await db.insert(history).values(historyData);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Execute seeding if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase }; 