import 'dotenv/config';
import { db } from './index.js';
import { profiles, tickets, comments, history } from './schema/index.js';

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
    const adminProfiles = await db.insert(profiles).values([
      {
        userId: 'admin1-test-id',
        email: 'admin1@emberone.com',
        fullName: 'Sarah Johnson',
        role: 'ADMIN'
      },
      {
        userId: 'admin2-test-id',
        email: 'admin2@emberone.com',
        fullName: 'Michael Chen',
        role: 'ADMIN'
      },
      {
        userId: 'admin3-test-id',
        email: 'admin3@emberone.com',
        fullName: 'Robert Kim',
        role: 'ADMIN'
      }
    ]).returning();

    const agentProfiles = await db.insert(profiles).values([
      {
        userId: 'agent1-test-id',
        email: 'agent1@emberone.com',
        fullName: 'Emma Rodriguez',
        role: 'AGENT'
      },
      {
        userId: 'agent2-test-id',
        email: 'agent2@emberone.com',
        fullName: 'James Wilson',
        role: 'AGENT'
      },
      {
        userId: 'agent3-test-id',
        email: 'agent3@emberone.com',
        fullName: 'Lisa Park',
        role: 'AGENT'
      },
      {
        userId: 'agent4-test-id',
        email: 'agent4@emberone.com',
        fullName: 'Thomas Anderson',
        role: 'AGENT'
      },
      {
        userId: 'agent5-test-id',
        email: 'agent5@emberone.com',
        fullName: 'Priya Patel',
        role: 'AGENT'
      }
    ]).returning();

    const customerProfiles = await db.insert(profiles).values([
      {
        userId: 'customer1-test-id',
        email: 'customer1@example.com',
        fullName: 'Alex Thompson',
        role: 'CUSTOMER'
      },
      {
        userId: 'customer2-test-id',
        email: 'customer2@example.com',
        fullName: 'Maria Garcia',
        role: 'CUSTOMER'
      },
      {
        userId: 'customer3-test-id',
        email: 'customer3@example.com',
        fullName: 'David Brown',
        role: 'CUSTOMER'
      },
      {
        userId: 'customer4-test-id',
        email: 'customer4@example.com',
        fullName: 'Sophie Taylor',
        role: 'CUSTOMER'
      },
      {
        userId: 'customer5-test-id',
        email: 'customer5@example.com',
        fullName: 'John Smith',
        role: 'CUSTOMER'
      },
      {
        userId: 'customer6-test-id',
        email: 'customer6@example.com',
        fullName: 'Emily White',
        role: 'CUSTOMER'
      },
      {
        userId: 'customer7-test-id',
        email: 'customer7@example.com',
        fullName: 'Carlos Martinez',
        role: 'CUSTOMER'
      }
    ]).returning();

    // Create test tickets
    console.log('Creating test tickets...');
    const testTickets = await db.insert(tickets).values([
      {
        title: 'Unable to access dashboard',
        description: 'Getting 403 error when trying to access the main dashboard',
        status: 'OPEN',
        priority: 'HIGH',
        customerId: customerProfiles[0].id,
        assignedAgentId: agentProfiles[0].id
      },
      {
        title: 'Feature request: Dark mode',
        description: 'Would love to have a dark mode option for the platform',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        customerId: customerProfiles[1].id,
        assignedAgentId: agentProfiles[1].id
      },
      {
        title: 'Payment processing failed',
        description: 'Transaction ID: TX123456 failed during checkout',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        customerId: customerProfiles[2].id,
        assignedAgentId: agentProfiles[0].id
      },
      {
        title: 'Account verification pending',
        description: 'Submitted documents 3 days ago, still waiting for verification',
        status: 'WAITING',
        priority: 'MEDIUM',
        customerId: customerProfiles[3].id,
        assignedAgentId: agentProfiles[2].id
      },
      {
        title: 'Integration documentation unclear',
        description: 'API documentation for webhook integration is outdated',
        status: 'CLOSED',
        priority: 'MEDIUM',
        customerId: customerProfiles[0].id,
        assignedAgentId: agentProfiles[1].id
      },
      {
        title: 'Mobile app crashes on startup',
        description: 'iOS app version 2.1.0 crashes immediately after splash screen',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        customerId: customerProfiles[4].id,
        assignedAgentId: agentProfiles[3].id
      },
      {
        title: 'Bulk import feature request',
        description: 'Need ability to import customer data via CSV',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        customerId: customerProfiles[5].id,
        assignedAgentId: agentProfiles[2].id
      },
      {
        title: 'Email notifications not received',
        description: 'Not receiving any email notifications for ticket updates',
        status: 'OPEN',
        priority: 'HIGH',
        customerId: customerProfiles[6].id,
        assignedAgentId: agentProfiles[4].id
      },
      {
        title: 'Security vulnerability report',
        description: 'Found potential XSS vulnerability in comment system',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        customerId: customerProfiles[2].id,
        assignedAgentId: agentProfiles[0].id
      },
      {
        title: 'API rate limiting too restrictive',
        description: 'Current rate limits are blocking our integration testing',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        customerId: customerProfiles[3].id,
        assignedAgentId: agentProfiles[1].id
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
            content: 'Any updates on this request?',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'customer_portal' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'Working on implementing this feature. Will update soon.',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'Design team needs to review the mockups first.',
            type: 'INTERNAL',
            isInternal: true,
            metadata: { source: 'agent_dashboard' }
          }
        );
      } else if (ticket.priority === 'CRITICAL') {
        comments.push(
          {
            ticketId: ticket.id,
            authorId: ticket.customerId,
            content: 'This is blocking our business operations!',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'customer_portal' }
          },
          {
            ticketId: ticket.id,
            authorId: adminProfiles[0].id,
            content: 'Escalated to engineering team.',
            type: 'INTERNAL',
            isInternal: true,
            metadata: { source: 'admin_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'Engineering team is investigating the issue.',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: adminProfiles[1].id,
            content: 'All hands on deck - this needs immediate attention.',
            type: 'INTERNAL',
            isInternal: true,
            metadata: { source: 'admin_dashboard' }
          }
        );
      } else if (ticket.status === 'WAITING') {
        comments.push(
          {
            ticketId: ticket.id,
            authorId: ticket.assignedAgentId,
            content: 'Waiting for additional information from the customer.',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.customerId,
            content: 'What additional information do you need?',
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
            content: 'Documentation has been updated. Please check the new version.',
            type: 'USER',
            isInternal: false,
            metadata: { source: 'agent_dashboard' }
          },
          {
            ticketId: ticket.id,
            authorId: ticket.customerId,
            content: 'Perfect, this resolves my issue. Thank you!',
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
          newValue: { status: 'IN_PROGRESS' },
          metadata: { 
            reason: 'Agent assigned',
            source: 'agent_dashboard'
          }
        });
      }
      if (ticket.priority === 'CRITICAL') {
        entries.push(
          {
            ticketId: ticket.id,
            actorId: adminProfiles[0].id,
            action: 'priority_changed',
            oldValue: { priority: 'HIGH' },
            newValue: { priority: 'CRITICAL' },
            metadata: { 
              reason: 'Business critical issue',
              source: 'admin_dashboard'
            }
          },
          {
            ticketId: ticket.id,
            actorId: adminProfiles[0].id,
            action: 'status_changed',
            oldValue: { status: 'IN_PROGRESS' },
            newValue: { status: 'CRITICAL' },
            metadata: { 
              reason: 'Escalated to critical',
              source: 'admin_dashboard'
            }
          },
          {
            ticketId: ticket.id,
            actorId: adminProfiles[1].id,
            action: 'team_assigned',
            oldValue: { team: null },
            newValue: { team: 'engineering' },
            metadata: { 
              reason: 'Requires immediate engineering attention',
              source: 'admin_dashboard'
            }
          }
        );
      }
      if (ticket.status === 'WAITING') {
        entries.push({
          ticketId: ticket.id,
          actorId: ticket.assignedAgentId,
          action: 'status_changed',
          oldValue: { status: 'IN_PROGRESS' },
          newValue: { status: 'WAITING' },
          metadata: { 
            reason: 'Waiting for customer response',
            source: 'agent_dashboard'
          }
        });
      }
      if (ticket.status === 'CLOSED') {
        entries.push(
          {
            ticketId: ticket.id,
            actorId: ticket.assignedAgentId,
            action: 'status_changed',
            oldValue: { status: 'IN_PROGRESS' },
            newValue: { status: 'CLOSED' },
            metadata: { 
              reason: 'Resolution confirmed',
              source: 'agent_dashboard'
            }
          },
          {
            ticketId: ticket.id,
            actorId: ticket.customerId,
            action: 'satisfaction_rating',
            oldValue: { rating: null },
            newValue: { rating: 5 },
            metadata: { 
              feedback: 'Great service!',
              source: 'customer_portal'
            }
          }
        );
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

seedDatabase(); 