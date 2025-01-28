let eventSource;
let currentCommandId = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second
let estimatedDurations = null;

/**
 * Update the connection status display
 * @param {string} status - The status message to display
 * @param {string} [className] - Optional CSS class for styling
 */
function updateStatus(status, className = '') {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = status;
    statusElement.className = `connection-status ${className}`;
    logEvent(`Connection status: ${status}`);
}

/**
 * Fetch average stage durations from historical data
 */
async function fetchAverageDurations() {
    try {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const host = window.location.host;
        const response = await fetch(`${protocol}//${host}/api/admin/command-timings/averages`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch averages:', errorText);
            throw new Error('Failed to fetch average durations');
        }
        estimatedDurations = await response.json();
        console.log('Loaded average durations:', estimatedDurations);
        logEvent('Loaded average stage durations');
    } catch (error) {
        console.error('Error fetching average durations:', error);
        logEvent('Using default durations due to fetch error');
        // Use default durations if fetch fails
        estimatedDurations = {
            stage_1: 500,  // Understanding command
            stage_2: 1000, // Converting to query
            stage_3: 1500, // Finding tickets
            stage_4: 1000, // Analyzing tickets
            stage_5: 1500, // Preparing changes
            stage_6: 500   // Ready for review
        };
    }
}

/**
 * Connect to SSE endpoint
 */
async function connect() {
    // Fetch average durations before connecting
    if (!estimatedDurations) {
        await fetchAverageDurations();
    }

    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host;
    const url = `${protocol}//${host}/api/admin/command-updates`;
    
    if (eventSource) {
        eventSource.close();
    }

    eventSource = new EventSource(url);
    updateStatus('Connecting...');

    eventSource.onopen = () => {
        updateStatus('Connected');
        reconnectAttempts = 0;
    };

    eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        updateStatus('Disconnected');

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            reconnectAttempts++;
            updateStatus(`Reconnecting in ${delay/1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(connect, delay);
        } else {
            updateStatus('Failed to connect after multiple attempts');
        }
    };

    setupEventHandlers();
}

function setupEventHandlers() {
    eventSource.addEventListener('command_start', handleCommandStart);
    eventSource.addEventListener('command_progress', handleCommandProgress);
    eventSource.addEventListener('command_complete', handleCommandComplete);
    eventSource.addEventListener('command_error', handleCommandError);
    eventSource.addEventListener('ping', handlePing);
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
    updateProgress(data);
}

function updateProgress(data) {
    const progressContainer = document.getElementById('progress');
    const currentStage = data.currentStage;
    
    if (currentStage) {
        const stageNumber = currentStage.number;
        const estimatedDuration = estimatedDurations[`stage_${stageNumber}`];
        const elapsed = currentStage.elapsed;
        const percentage = Math.min(Math.round((elapsed / estimatedDuration) * 100), 99);
        
        document.getElementById('current-stage').textContent = 
            `Stage ${stageNumber}: ${currentStage.description} (${percentage}%)`;
        document.getElementById('progress-bar').style.width = `${percentage}%`;
    }

    // Update completed stages
    const stagesDiv = document.getElementById('stages');
    stagesDiv.innerHTML = '';
    data.stages.forEach(stage => {
        const stageEl = document.createElement('div');
        stageEl.className = 'stage completed';
        stageEl.textContent = `Stage ${stage.number}: ${stage.description} - ${stage.duration}ms`;
        stagesDiv.appendChild(stageEl);
    });
}

function handleCommandComplete(event) {
    const data = JSON.parse(event.data);
    if (data.commandId !== currentCommandId) return;

    document.getElementById('progress-bar').style.width = '100%';
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
    document.getElementById('progress-bar').style.width = '0%';
    document.getElementById('stages').innerHTML = '';
    document.getElementById('current-stage').textContent = '';
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
