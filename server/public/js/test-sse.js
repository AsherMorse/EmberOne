let eventSource;
let currentCommandId = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second

function connect() {
    if (eventSource) {
        eventSource.close();
    }

    try {
        // Force HTTP for development environment
        const protocol = 'http:';
        const host = window.location.host;
        const baseUrl = `${protocol}//${host}`;
        
        logEvent(`Connecting to SSE endpoint: ${baseUrl}/api/admin/command-updates`);
        eventSource = new EventSource(`${baseUrl}/api/admin/command-updates`);
        
        eventSource.onopen = () => {
            document.getElementById('connection-status').className = 'connection-status connected';
            document.getElementById('connection-status').textContent = 'Connected';
            logEvent('Connected to SSE');
            reconnectAttempts = 0;
        };

        eventSource.onerror = (error) => {
            const status = document.getElementById('connection-status');
            status.className = 'connection-status disconnected';

            // Check if the error is SSL-related
            if (window.location.protocol === 'https:') {
                status.textContent = 'SSL Error - Please use HTTP in development';
                logEvent('SSL Error: Please use HTTP in development environment');
                cleanup(); // Close the connection
                return;
            }

            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
                status.textContent = `Disconnected - Reconnecting in ${delay/1000}s (Attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`;
                logEvent(`Connection error. Retrying in ${delay/1000}s...`);
                
                setTimeout(() => {
                    reconnectAttempts++;
                    connect();
                }, delay);
            } else {
                status.textContent = 'Connection failed - Please refresh the page';
                logEvent('Connection failed after maximum retry attempts');
            }
        };

        // Listen for events
        eventSource.addEventListener('command_start', handleCommandStart);
        eventSource.addEventListener('command_progress', handleCommandProgress);
        eventSource.addEventListener('command_complete', handleCommandComplete);
        eventSource.addEventListener('command_error', handleCommandError);
        eventSource.addEventListener('ping', handlePing);
    } catch (error) {
        logEvent(`Error creating EventSource: ${error.message}`);
        document.getElementById('connection-status').textContent = 'Connection Error: ' + error.message;
    }
}

function handleCommandStart(event) {
    const data = JSON.parse(event.data);
    currentCommandId = data.commandId;
    document.getElementById('current-command').style.display = 'block';
    resetStages();
    logEvent('Command started: ' + JSON.stringify(data));
}

function handleCommandProgress(event) {
    const data = JSON.parse(event.data);
    if (data.commandId !== currentCommandId) return;

    // Update progress bar
    document.getElementById('overall-progress').style.width = data.progress + '%';

    // Update stages
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => {
        const stageNum = parseInt(stage.dataset.stage);
        if (stageNum < data.stage) {
            stage.className = 'stage complete';
        } else if (stageNum === data.stage) {
            stage.className = 'stage active';
        } else {
            stage.className = 'stage';
        }
    });

    logEvent('Progress update: ' + JSON.stringify(data));
}

function handleCommandComplete(event) {
    const data = JSON.parse(event.data);
    if (data.commandId !== currentCommandId) return;

    document.getElementById('overall-progress').style.width = '100%';
    document.querySelectorAll('.stage').forEach(stage => {
        stage.className = 'stage complete';
    });

    logEvent('Command completed: ' + JSON.stringify(data));
    currentCommandId = null;
}

function handleCommandError(event) {
    const data = JSON.parse(event.data);
    if (data.commandId !== currentCommandId) return;

    document.getElementById('current-command').style.display = 'none';
    logEvent('Command error: ' + JSON.stringify(data));
    currentCommandId = null;
}

function handlePing(event) {
    const data = JSON.parse(event.data);
    logEvent('Ping received: ' + JSON.stringify(data));
}

function resetStages() {
    document.getElementById('overall-progress').style.width = '0%';
    document.querySelectorAll('.stage').forEach(stage => {
        stage.className = 'stage';
    });
}

function logEvent(message) {
    const log = document.getElementById('event-log');
    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toISOString()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

async function startTestCommand() {
    try {
        // Force HTTP for development environment
        const protocol = 'http:';
        const host = window.location.host;
        const baseUrl = `${protocol}//${host}`;
        
        const response = await fetch(`${baseUrl}/api/admin/test-command`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        logEvent('Test command initiated: ' + JSON.stringify(data));
    } catch (error) {
        logEvent('Error starting test command: ' + error.message);
        document.getElementById('connection-status').textContent = 'Command Error: ' + error.message;
    }
}

// Cleanup function to properly close connection
function cleanup() {
    if (eventSource) {
        eventSource.close();
        logEvent('Connection closed');
    }
}

// Add cleanup on page unload
window.addEventListener('unload', cleanup);

// Connect when page loads
window.addEventListener('load', connect); 
