import Button from '../../components/ui/button';
import { useState } from 'react';
import { executeCommand, executeChanges } from '../../lib/api';

function CommandBadge({ type }) {
  const typeStyles = {
    STATUS: 'bg-green-500/20 text-green-500',
    PRIORITY: 'bg-yellow-500/20 text-yellow-500',
    MULTIPLE: 'bg-blue-500/20 text-blue-500'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles[type] || ''}`}>
      {type.toLowerCase()}
    </span>
  );
}

function RiskBadge({ level }) {
  const riskStyles = {
    LOW: 'bg-gray-500/20 text-gray-500',
    MEDIUM: 'bg-yellow-500/20 text-yellow-500',
    HIGH: 'bg-red-500/20 text-red-500'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskStyles[level] || ''}`}>
      {level.toLowerCase()} risk
    </span>
  );
}

function ImpactBadge({ text, variant }) {
  const variantStyles = {
    info: 'bg-blue-500/20 text-blue-500',
    warning: 'bg-yellow-500/20 text-yellow-500',
    success: 'bg-green-500/20 text-green-500'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variantStyles[variant] || ''}`}>
      {text}
    </span>
  );
}

// Helper function to format field names for display
const formatFieldName = (field) => {
  const fieldMappings = {
    status: 'Status',
    priority: 'Priority',
    assignedAgentId: 'Assigned Agent',
    assigned_agent_id: 'Assigned Agent',
    title: 'Title',
    description: 'Description'
  };
  return fieldMappings[field] || field.charAt(0).toUpperCase() + field.slice(1);
};

// Helper function to format field values
const formatFieldValue = (value) => {
  if (value === null || value === undefined) return 'None';
  return value.toString();
};

function TicketChangeCard({ change }) {
  const title = change.ticket_details?.title || 'Untitled';

  return (
    <div className="bg-muted/10 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-foreground">Ticket #{change.ticket_id.slice(0, 8)}</div>
        <div className="text-xs text-muted-foreground truncate ml-4 max-w-[50%]">
          {title}
        </div>
      </div>
      <div className="space-y-1">
        {Object.entries(change.updates).map(([field, newValue]) => {
          const currentValue = change.current_state?.[field];
          return (
            <div key={field} className="flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">{formatFieldName(field)}:</span>
              <span className="text-foreground">{formatFieldValue(currentValue)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground">{formatFieldValue(newValue)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CommandsPage = () => {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const handleDecline = () => {
    setCommand('');
    setPreview(null);
    setMessage(null);
  };

  const handleAccept = async () => {
    if (!preview?.changes?.changes) return;

    try {
      setIsExecuting(true);
      const changes = preview.changes.changes.map(change => ({
        ticket_id: change.ticket_id,
        updates: change.updates
      }));
      
      console.log('Sending changes:', changes);
      const response = await executeChanges(changes);
      console.log('Changes executed successfully:', response);
      
      // Show success message
      setMessage({
        type: 'success',
        text: `Successfully updated ${response.result.updatedTickets.length} tickets`
      });

      // Clear the form
      setCommand('');
      setPreview(null);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to execute changes:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to apply changes'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteCommand = async () => {
    if (!command.trim()) return;

    try {
      setIsExecuting(true);
      const response = await executeCommand(command);
      
      // Create a map of ticket details by ID
      const ticketDetailsMap = new Map(
        response.result.tickets?.map(ticket => [ticket.id, ticket]) || []
      );
      
      // Enhance changes with full ticket details
      const enhancedChanges = response.result.suggestedChanges?.changes?.map(change => ({
        ...change,
        ticket_details: ticketDetailsMap.get(change.ticket_id) || {}
      }));

      setPreview({
        command: command,
        explanation: response.result.explanation,
        matchCount: response.result.suggestedChanges?.impact_assessment?.factors?.num_tickets || 0,
        changes: {
          ...response.result.suggestedChanges,
          changes: enhancedChanges
        }
      });
    } catch (error) {
      console.error('Failed to execute command:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Helper function to determine risk level
  const determineRiskLevel = (changes) => {
    if (!changes?.impact_assessment) return 'LOW';
    return changes.impact_assessment.level.toUpperCase();
  };

  // Helper function to format impact badges
  const getImpactBadges = (preview) => {
    const badges = [];
    
    // Add ticket count badge
    if (preview.matchCount !== undefined) {
      badges.push({
        text: `${preview.matchCount} Tickets Affected`,
        variant: 'info'
      });
    }

    // Add changes badges - only show fields with actual changes
    if (preview.changes?.changes) {
      const changes = preview.changes.changes;
      
      // Get unique updates across all changes
      const uniqueUpdates = new Map(); // Use Map to store field -> update value pairs
      changes.forEach(change => {
        if (change.updates) {
          Object.entries(change.updates).forEach(([field, value]) => {
            // Only add if we have both current and new values
            if (change.current_state && change.current_state[field] !== undefined) {
              uniqueUpdates.set(field, {
                from: change.current_state[field],
                to: value
              });
            }
          });
        }
      });

      // Create a badge for each type of update
      uniqueUpdates.forEach((update, field) => {
        badges.push({
          text: `${formatFieldName(field)}: ${update.from} → ${update.to}`,
          variant: 'warning'
        });
      });
    }

    return badges;
  };

  return (
    <div>
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Ticket Commands</h2>
        <div className="flex gap-4">
          <Button 
            variant="primary"
            onClick={handleExecuteCommand}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Execute Command'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-muted overflow-hidden">
        <div className="p-6">
          <div className="max-w-2xl space-y-4">
            <div>
              <label htmlFor="command" className="block text-sm font-medium text-muted-foreground mb-2">
                Enter a natural language command to manage tickets
              </label>
              <textarea
                id="command"
                rows={3}
                className="w-full px-4 py-2 bg-background border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Type your command here... (e.g., 'Change status to closed for all resolved tickets')"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Example commands:</p>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <CommandBadge type="STATUS" />
                  <span>Change all in-progress tickets to waiting status</span>
                </div>
                <div className="flex items-center gap-2">
                  <CommandBadge type="PRIORITY" />
                  <span>Set priority to critical for all open tickets from john@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <CommandBadge type="MULTIPLE" />
                  <span>Close all tickets that have been waiting for more than 7 days and set priority to low</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {preview && (
          <div className="border-t border-muted">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">Preview</h3>
                  <RiskBadge level={determineRiskLevel(preview.changes)} />
                </div>
                <div className="flex items-center gap-2">
                  <ImpactBadge 
                    text={`${preview.matchCount} Tickets Affected`}
                    variant="info"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-muted/10 rounded-lg p-4">
                  <div className="grid gap-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Command</div>
                      <div className="text-sm text-foreground line-clamp-1">{preview.command}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Explanation</div>
                      <div className="text-sm text-foreground line-clamp-2">{preview.explanation}</div>
                    </div>
                  </div>
                </div>

                {preview.changes?.changes && preview.changes.changes.length > 0 && (
                  <div className="grid gap-2">
                    <div className="text-xs font-medium text-muted-foreground">Changes</div>
                    <div className="grid gap-2">
                      {preview.changes.changes.map((change, index) => (
                        <TicketChangeCard key={index} change={change} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-500 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10"
                    disabled={isExecuting}
                    onClick={handleDecline}
                  >
                    Decline
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-green-500 hover:text-green-400 dark:hover:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-500/10"
                    disabled={isExecuting}
                    onClick={handleAccept}
                  >
                    {isExecuting ? 'Applying...' : 'Accept'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandsPage; 