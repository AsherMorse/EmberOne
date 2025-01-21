import 'dotenv/config';
import { db } from './index.js';
import { profiles, tickets, comments, history } from './schema/index.js';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create test profiles
    console.log('Creating test profiles...');
    const adminProfile = await db.insert(profiles).values({
      userId: 'admin-test-id',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'ADMIN'
    }).returning();

    const agentProfile = await db.insert(profiles).values({
      userId: 'agent-test-id',
      email: 'agent@test.com',
      fullName: 'Agent User',
      role: 'AGENT'
    }).returning();

    const customerProfile = await db.insert(profiles).values({
      userId: 'customer-test-id',
      email: 'customer@test.com',
      fullName: 'Customer User',
      role: 'CUSTOMER'
    }).returning();

    // Create test tickets
    console.log('Creating test tickets...');
    const ticket = await db.insert(tickets).values({
      title: 'Test Ticket',
      description: 'This is a test ticket',
      status: 'OPEN',
      priority: 'MEDIUM',
      customerId: customerProfile[0].id,
      assignedAgentId: agentProfile[0].id
    }).returning();

    // Create test comments
    console.log('Creating test comments...');
    await db.insert(comments).values([
      {
        ticketId: ticket[0].id,
        authorId: customerProfile[0].id,
        content: 'Customer comment',
        type: 'USER',
        isInternal: false,
        metadata: { source: 'customer_portal' }
      },
      {
        ticketId: ticket[0].id,
        authorId: agentProfile[0].id,
        content: 'Agent internal note',
        type: 'INTERNAL',
        isInternal: true,
        metadata: { source: 'agent_dashboard' }
      }
    ]);

    // Create test history
    console.log('Creating test history...');
    await db.insert(history).values({
      ticketId: ticket[0].id,
      actorId: agentProfile[0].id,
      action: 'status_changed',
      oldValue: { status: 'OPEN' },
      newValue: { status: 'IN_PROGRESS' },
      metadata: { 
        reason: 'Agent assigned',
        source: 'agent_dashboard'
      }
    });

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 