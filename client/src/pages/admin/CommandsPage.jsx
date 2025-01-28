import Button from '../../components/ui/button';

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

const CommandsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Ticket Commands</h2>
        <div className="flex gap-4">
          <Button 
            variant="primary"
            disabled={true}
          >
            Execute Command
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

        <div className="border-t border-muted">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Preview</h3>
              <RiskBadge level="MEDIUM" />
            </div>
            <div className="space-y-4">
              <div className="bg-muted/10 rounded-lg p-4">
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Command</div>
                    <div className="text-sm text-foreground">Set all open tickets to high priority</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Explanation</div>
                    <div className="text-sm text-foreground">This will update the priority to HIGH for all tickets with OPEN status</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Impact</div>
                    <div className="text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <ImpactBadge text="3 Tickets Affected" variant="info" />
                        <ImpactBadge text="Priority: MEDIUM → HIGH" variant="warning" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandsPage; 