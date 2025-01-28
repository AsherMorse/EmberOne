import { useEffect, useState } from 'react';

/**
 * Component to display real-time command progress
 */
export default function CommandProgress({ onComplete }) {
  const [eventSource, setEventSource] = useState(null);
  const [currentCommandId, setCurrentCommandId] = useState(null);
  const [progress, setProgress] = useState({
    status: 'processing',
    currentStage: null,
    stages: []
  });

  useEffect(() => {
    // Connect to SSE endpoint
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host;
    const url = `${protocol}//${host}/api/admin/command-updates`;
    
    const source = new EventSource(url);
    setEventSource(source);

    // Set up event handlers
    source.onopen = () => {
      console.log('SSE connection opened');
    };

    source.onerror = (error) => {
      console.error('SSE Error:', error);
      source.close();
    };

    // Handle command events
    source.addEventListener('command_start', (event) => {
      console.log('Command start event received:', event.data);
      const data = JSON.parse(event.data);
      setCurrentCommandId(data.commandId);
      setProgress(prev => ({
        ...prev,
        status: 'processing',
        command: data.command,
        startTime: data.startTime
      }));
    });

    source.addEventListener('command_progress', (event) => {
      console.log('Command progress event received:', event.data);
      const data = JSON.parse(event.data);
      
      // Don't check commandId for progress events since we might miss the start event
      setProgress(prev => ({
        ...prev,
        status: 'processing',
        currentStage: data.currentStage,
        stages: data.stages || [],
        command: data.command,
        startTime: data.startTime,
        elapsed: data.elapsed,
        matchedTicketsCount: data.matchedTicketsCount
      }));
    });

    source.addEventListener('command_complete', (event) => {
      console.log('Command complete event received:', event.data);
      const data = JSON.parse(event.data);
      if (data.commandId !== currentCommandId) return;

      setProgress(prev => ({
        ...prev,
        status: 'complete',
        stages: data.stages || []
      }));

      if (onComplete) {
        onComplete(data.result);
      }
    });

    source.addEventListener('command_error', (event) => {
      console.log('Command error event received:', event.data);
      const data = JSON.parse(event.data);
      if (data.commandId !== currentCommandId) return;

      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: data.error
      }));
    });

    // Cleanup on unmount
    return () => {
      source.close();
    };
  }, [currentCommandId, onComplete]);

  // Format the status for display
  const getDisplayStatus = () => {
    switch (progress.status) {
      case 'processing':
        return 'Processing';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="mt-4 p-4 bg-muted/10 rounded-lg">
      <div className="space-y-4">
        {/* Status */}
        <div className="text-sm font-medium text-muted-foreground">
          Status: {getDisplayStatus()}
        </div>

        {/* Command Info */}
        {progress.command && (
          <div className="text-sm text-muted-foreground">
            Processing: {progress.command}
          </div>
        )}

        {/* Current Stage */}
        {progress.currentStage && (
          <div>
            <div className="text-sm font-medium mb-2">
              {progress.currentStage.description}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${progress.currentStage.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Stages */}
        {progress.stages.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Completed Stages</div>
            {progress.stages.map((stage) => (
              <div
                key={stage.number}
                className="text-sm text-muted-foreground flex justify-between items-center"
              >
                <span>{stage.description}</span>
                <span>{stage.duration}ms</span>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {progress.status === 'error' && (
          <div className="text-sm text-red-500">
            Error: {progress.error}
          </div>
        )}
      </div>
    </div>
  );
} 
