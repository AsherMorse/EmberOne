import { useState } from 'react';
import { CustomerLayout } from '../../components/layout';
import { Button, Input, Select } from '../../components/ui';

export default function CreateTicketPage() {
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    priority: 'low'
  });

  const handleChange = (field) => (event) => {
    setTicket(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Submit ticket
  };

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create New Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Please provide details about your issue and we'll get back to you as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Title"
              placeholder="Brief summary of your issue"
              value={ticket.title}
              onChange={handleChange('title')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[200px]"
              placeholder="Please provide as much detail as possible about your issue..."
              value={ticket.description}
              onChange={handleChange('description')}
              required
            />
          </div>

          <div>
            <Select
              label="Priority"
              value={ticket.priority}
              onChange={handleChange('priority')}
              required
            >
              <option value="low">Low - Non-urgent issue</option>
              <option value="medium">Medium - Standard priority</option>
              <option value="high">High - Urgent issue</option>
              <option value="critical">Critical - Immediate attention needed</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">Create Ticket</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
} 