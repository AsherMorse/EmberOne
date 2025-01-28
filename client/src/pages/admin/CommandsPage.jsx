import Button from '../../components/ui/button';
import { useState } from 'react';
import { executeCommand, executeChanges } from '../../lib/api';
import CommandProgress from '../../components/CommandProgress';

function Message({ type, text }) {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' 
        ? 'bg-green-500/90 text-white' 
        : 'bg-red-500/90 text-white'
    }`}>
      {text}
    </div>
  );
}

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

function RiskBadge({ level, text }) {
  const riskStyles = {
    LOW: 'bg-gray-500/20 text-gray-500',
    MEDIUM: 'bg-yellow-500/20 text-yellow-500',
    HIGH: 'bg-red-500/20 text-red-500'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskStyles[level] || ''}`}>
      {text}
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
  const [isApplying, setIsApplying] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [commandId, setCommandId] = useState(null);

  const handleDecline = () => {
    setCommand('');
    setPreview(null);
    setMessage(null);
    setIsExecuting(false);
    setCommandId(null);
  };

  const handleAccept = async () => {
    if (!preview?.changes?.changes) {
      setMessage({
        type: 'error',
        text: 'No changes to apply'
      });
      return;
    }

    try {
      setIsApplying(true);
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

      // Clear the form and states
      setCommand('');
      setPreview(null);
      setIsExecuting(false);
      setIsApplying(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to execute changes:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to apply changes'
      });
      setIsApplying(false);
    }
  };

  const handleExecuteCommand = async () => {
    if (!command.trim()) return;

    try {
      setIsExecuting(true);
      setPreview(null); // Clear any existing preview
      
      const response = await executeCommand(command);
      setCommandId(response.commandId); // Store the commandId from response
      
      // Note: Don't set isExecuting to false here
      // It will be handled by the CommandProgress onComplete callback
      
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
      setMessage({
        type: 'error',
        text: error.message || 'Failed to execute command'
      });
      setIsExecuting(false);
      setCommandId(null);
    }
  };

  // Helper function to determine impact level
  const determineImpactLevel = (changes) => {
    if (!changes?.impact_assessment) return 'LOW';
    return changes.impact_assessment.level.toUpperCase();
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {message && (
          <Message type={message.type} text={message.text} />
        )}
        
        {isExecuting && commandId && !preview && (
          <CommandProgress commandId={commandId} />
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

              {/* Command Progress */}
              {isExecuting && (
                <div className="mt-4">
                  <CommandProgress
                    onComplete={(result) => {
                      setIsExecuting(false);
                      if (result) {
                        // Create a map of ticket details by ID
                        const ticketDetailsMap = new Map(
                          result.tickets?.map(ticket => [ticket.id, ticket]) || []
                        );
                        
                        // Enhance changes with full ticket details
                        const enhancedChanges = result.suggestedChanges?.changes?.map(change => ({
                          ...change,
                          ticket_details: ticketDetailsMap.get(change.ticket_id) || {}
                        }));

                        setPreview({
                          command: command,
                          explanation: result.explanation,
                          matchCount: result.suggestedChanges?.impact_assessment?.factors?.num_tickets || 0,
                          changes: {
                            ...result.suggestedChanges,
                            changes: enhancedChanges
                          }
                        });
                      }
                    }}
                  />
                </div>
              )}

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

          {/* Preview Section */}
          {preview && (
            <div className="border-t border-muted">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Preview</h3>
                    <RiskBadge level={determineImpactLevel(preview.changes)} text={`${determineImpactLevel(preview.changes)} Impact`} />
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

                  {/* Changes Preview */}
                  {preview.changes?.changes?.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Changes</div>
                      <div className="space-y-2">
                        {preview.changes.changes.map((change, index) => (
                          <TicketChangeCard key={index} change={change} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      variant="ghost"
                      onClick={handleDecline}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAccept}
                      disabled={isApplying}
                    >
                      {isApplying ? 'Applying Changes...' : 'Apply Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandsPage; 