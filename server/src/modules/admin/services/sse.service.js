import EventEmitter from 'events';
import { logger } from '../../../utils/logger.js';
import { ThrottleManager } from '../utils/throttle.js';

/**
 * Connection states for SSE clients
 */
const ConnectionState = {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
};

/**
 * Server-Sent Events Service
 * Manages SSE connections and event broadcasting for command timing updates
 */
class SSEService {
    constructor() {
        this.emitter = new EventEmitter();
        this.clients = new Map();
        this.connectionStates = new Map();
        this.lastPingTime = new Map();
        this.reconnectTimeout = 1000;
        this.maxReconnectTimeout = 30000;
        this.throttleInterval = 100; // Minimum time between events in ms
        this.lastEventTime = new Map();
        this.pingInterval = 30000; // 30 seconds
        this.maxMissedPings = 2;

        // Initialize throttle manager
        this.throttleManager = new ThrottleManager();

        // Start connection monitoring
        this.startConnectionMonitoring();
    }

    /**
     * Start periodic connection monitoring
     * @private
     */
    startConnectionMonitoring() {
        setInterval(() => {
            this.checkConnections();
            this.sendPings();
        }, this.pingInterval / 2);
    }

    /**
     * Check connection health and clean up stale connections
     * @private
     */
    checkConnections() {
        const now = Date.now();
        for (const [clientId, lastPing] of this.lastPingTime) {
            if (now - lastPing > this.pingInterval * this.maxMissedPings) {
                logger.warn(`Client ${clientId} connection timed out`, {
                    lastPing,
                    timeSinceLastPing: now - lastPing
                });
                this.handleConnectionError(clientId, new Error('Connection timeout'));
            }
        }
    }

    /**
     * Send ping events to maintain connection
     * @private
     */
    sendPings() {
        this.clients.forEach((_, clientId) => {
            this.sendEvent(clientId, 'ping', {
                timestamp: Date.now()
            });
        });
    }

    /**
     * Add a new SSE client connection
     * @param {string} clientId - Unique client identifier
     * @param {Response} res - Express response object
     */
    addClient(clientId, res) {
        logger.info(`SSE client connecting: ${clientId}`);
        
        this.setConnectionState(clientId, ConnectionState.CONNECTING);
        
        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no' // Disable Nginx buffering
        });
        
        this.clients.set(clientId, res);
        this.lastEventTime.set(clientId, Date.now());
        this.lastPingTime.set(clientId, Date.now());
        
        // Send initial connection success
        this.sendEvent(clientId, 'connected', { 
            status: 'ok',
            clientId,
            timestamp: Date.now()
        });
        
        this.setConnectionState(clientId, ConnectionState.CONNECTED);
        
        // Handle client disconnect
        res.on('close', () => {
            this.handleDisconnect(clientId);
        });

        res.on('error', (error) => {
            this.handleConnectionError(clientId, error);
        });
    }

    /**
     * Handle client disconnection
     * @param {string} clientId - Client identifier
     * @private
     */
    handleDisconnect(clientId) {
        logger.info(`SSE client disconnected: ${clientId}`);
        this.setConnectionState(clientId, ConnectionState.DISCONNECTED);
        this.removeClient(clientId);
    }

    /**
     * Handle connection error
     * @param {string} clientId - Client identifier
     * @param {Error} error - Error that occurred
     * @private
     */
    handleConnectionError(clientId, error) {
        logger.error(`SSE client error: ${clientId}`, error);
        this.setConnectionState(clientId, ConnectionState.ERROR);
        this.removeClient(clientId);
    }

    /**
     * Update client connection state
     * @param {string} clientId - Client identifier
     * @param {string} state - New connection state
     * @private
     */
    setConnectionState(clientId, state) {
        this.connectionStates.set(clientId, {
            state,
            timestamp: Date.now()
        });
        
        // Emit state change event
        this.emitter.emit('connectionStateChange', {
            clientId,
            state,
            timestamp: Date.now()
        });
    }

    /**
     * Remove a disconnected client
     * @param {string} clientId - Client identifier to remove
     */
    removeClient(clientId) {
        this.clients.delete(clientId);
        this.lastEventTime.delete(clientId);
        this.lastPingTime.delete(clientId);
        this.connectionStates.delete(clientId);
        this.throttleManager.removeClient(clientId);
    }

    /**
     * Send an event to a specific client with throttling
     * @param {string} clientId - Target client identifier
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    sendEvent(clientId, event, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // Don't throttle connection-related or command events
        if (['connected', 'disconnected', 'error', 'command_start', 'command_progress', 'command_complete', 'command_error'].includes(event)) {
            this.writeEvent(client, event, data);
            return;
        }

        // Handle ping events separately
        if (event === 'ping') {
            if (!this.throttleManager.shouldThrottle('ping', clientId)) {
                this.writeEvent(client, event, data);
                this.lastPingTime.set(clientId, Date.now());
                this.throttleManager.updateLastEventTime('ping', clientId);
            }
            return;
        }

        // Queue or send other events based on type
        this.throttleManager.queueEvent(
            event,
            clientId,
            (eventData) => this.writeEvent(client, event, eventData),
            data
        );
    }

    /**
     * Write event data to client stream
     * @private
     */
    writeEvent(client, event, data) {
        try {
            // Ensure proper event formatting and flushing
            client.write(`event: ${event}\n`);
            client.write(`data: ${JSON.stringify(data)}\n\n`);
            // Force flush the response
            if (typeof client.flush === 'function') {
                client.flush();
            }
        } catch (error) {
            logger.error(`Error writing event to client:`, error);
            // Let error handling happen through the 'error' event
        }
    }

    /**
     * Broadcast an event to all connected clients
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    broadcast(event, data) {
        this.clients.forEach((_, clientId) => {
            this.sendEvent(clientId, event, data);
        });
    }

    /**
     * Get enhanced statistics including throttling info
     * @returns {Object} Enhanced statistics
     */
    getStats() {
        const baseStats = {
            totalConnections: this.clients.size,
            connectionStates: {},
            averageEventLatency: 0
        };

        // Count connections by state
        for (const { state } of this.connectionStates.values()) {
            baseStats.connectionStates[state] = (baseStats.connectionStates[state] || 0) + 1;
        }

        // Add throttling stats for each client
        const throttlingStats = {};
        for (const clientId of this.clients.keys()) {
            throttlingStats[clientId] = this.throttleManager.getStats(clientId);
        }

        return {
            ...baseStats,
            throttling: throttlingStats
        };
    }

    /**
     * Check if a client is connected
     * @param {string} clientId - Client identifier to check
     * @returns {boolean} True if client is connected
     */
    isClientConnected(clientId) {
        const state = this.connectionStates.get(clientId);
        return state?.state === ConnectionState.CONNECTED;
    }

    /**
     * Get a client's connection state
     * @param {string} clientId - Client identifier
     * @returns {Object|null} Connection state information
     */
    getClientState(clientId) {
        return this.connectionStates.get(clientId) || null;
    }
}

// Export singleton instance
export const sseService = new SSEService(); 