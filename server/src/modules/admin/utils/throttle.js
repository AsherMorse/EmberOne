/**
 * Event throttling utilities
 * Provides different throttling strategies for SSE events
 */

/**
 * Default throttle intervals for different event types (in ms)
 */
export const DEFAULT_THROTTLE_INTERVALS = {
    progress: 100,    // Progress updates
    status: 250,      // Status changes
    stats: 1000,      // Statistics updates
    ping: 30000,      // Connection checks
    default: 100      // Default for unspecified events
};

/**
 * Throttle manager for handling different event types
 */
export class ThrottleManager {
    constructor(customIntervals = {}) {
        this.intervals = { ...DEFAULT_THROTTLE_INTERVALS, ...customIntervals };
        this.lastEventTimes = new Map();
        this.eventQueues = new Map();
        this.queueTimeouts = new Map();
    }

    /**
     * Check if an event should be throttled
     * @param {string} eventType - Type of event
     * @param {string} clientId - Client identifier
     * @returns {boolean} True if event should be throttled
     */
    shouldThrottle(eventType, clientId) {
        const now = Date.now();
        const key = `${clientId}:${eventType}`;
        const lastTime = this.lastEventTimes.get(key) || 0;
        const interval = this.intervals[eventType] || this.intervals.default;

        return (now - lastTime) < interval;
    }

    /**
     * Update last event time
     * @param {string} eventType - Type of event
     * @param {string} clientId - Client identifier
     */
    updateLastEventTime(eventType, clientId) {
        const key = `${clientId}:${eventType}`;
        this.lastEventTimes.set(key, Date.now());
    }

    /**
     * Queue an event for delayed sending
     * @param {string} eventType - Type of event
     * @param {string} clientId - Client identifier
     * @param {Function} sendCallback - Callback to send the event
     * @param {Object} eventData - Event data to send
     */
    queueEvent(eventType, clientId, sendCallback, eventData) {
        const key = `${clientId}:${eventType}`;
        const interval = this.intervals[eventType] || this.intervals.default;

        // Clear existing queue timeout
        if (this.queueTimeouts.has(key)) {
            clearTimeout(this.queueTimeouts.get(key));
        }

        // Get or create event queue
        if (!this.eventQueues.has(key)) {
            this.eventQueues.set(key, []);
        }
        const queue = this.eventQueues.get(key);

        // Add event to queue
        queue.push(eventData);

        // Set timeout to process queue
        const timeout = setTimeout(() => {
            this.processEventQueue(eventType, clientId, sendCallback);
        }, interval);

        this.queueTimeouts.set(key, timeout);
    }

    /**
     * Process queued events
     * @private
     */
    processEventQueue(eventType, clientId, sendCallback) {
        const key = `${clientId}:${eventType}`;
        const queue = this.eventQueues.get(key) || [];

        if (queue.length === 0) return;

        // For progress events, only send the latest
        if (eventType === 'progress') {
            sendCallback(queue[queue.length - 1]);
        } 
        // For status events, combine if possible
        else if (eventType === 'status') {
            const combinedData = this.combineStatusEvents(queue);
            sendCallback(combinedData);
        }
        // For other events, send all in batch
        else {
            sendCallback({
                type: eventType,
                batch: true,
                events: queue
            });
        }

        // Clear queue
        this.eventQueues.set(key, []);
        this.queueTimeouts.delete(key);
        this.updateLastEventTime(eventType, clientId);
    }

    /**
     * Combine multiple status events into one
     * @private
     */
    combineStatusEvents(events) {
        // Implement status event combination logic
        // For now, just take the latest status
        return events[events.length - 1];
    }

    /**
     * Clean up client data
     * @param {string} clientId - Client to clean up
     */
    removeClient(clientId) {
        // Clean up all data for this client
        for (const eventType of Object.keys(this.intervals)) {
            const key = `${clientId}:${eventType}`;
            this.lastEventTimes.delete(key);
            this.eventQueues.delete(key);
            
            if (this.queueTimeouts.has(key)) {
                clearTimeout(this.queueTimeouts.get(key));
                this.queueTimeouts.delete(key);
            }
        }
    }

    /**
     * Get throttling statistics for a client
     * @param {string} clientId - Client identifier
     * @returns {Object} Throttling statistics
     */
    getStats(clientId) {
        const stats = {
            queueSizes: {},
            lastEventTimes: {},
            currentIntervals: { ...this.intervals }
        };

        for (const eventType of Object.keys(this.intervals)) {
            const key = `${clientId}:${eventType}`;
            stats.queueSizes[eventType] = (this.eventQueues.get(key) || []).length;
            stats.lastEventTimes[eventType] = this.lastEventTimes.get(key) || 0;
        }

        return stats;
    }
} 