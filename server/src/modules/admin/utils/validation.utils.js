/**
 * Validation utilities for admin commands
 */

/**
 * Validate ticket command request
 */
export const validateTicketCommand = (req, res, next) => {
    const { type, filters, updates } = req.body;
    const errors = [];

    // Validate command structure
    if (!type || !filters || !updates) {
        errors.push('Command must include type, filters, and updates');
    }

    // Validate command type
    const validTypes = ['UPDATE_STATUS', 'UPDATE_PRIORITY', 'ASSIGN_AGENT'];
    if (type && !validTypes.includes(type)) {
        errors.push(`Invalid command type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate filters structure
    if (filters && typeof filters !== 'object') {
        errors.push('Filters must be an object');
    } else if (filters) {
        const validFilters = ['status', 'priority', 'assignedAgentId'];
        const invalidFilters = Object.keys(filters).filter(key => !validFilters.includes(key));
        if (invalidFilters.length > 0) {
            errors.push(`Invalid filters: ${invalidFilters.join(', ')}`);
        }
    }

    // Validate updates based on command type
    if (type && updates) {
        switch (type) {
            case 'UPDATE_STATUS':
                if (!updates.status) {
                    errors.push('Status update is required');
                } else if (!['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED'].includes(updates.status)) {
                    errors.push('Invalid status. Must be OPEN, IN_PROGRESS, WAITING, or CLOSED');
                }
                break;

            case 'UPDATE_PRIORITY':
                if (!updates.priority) {
                    errors.push('Priority update is required');
                } else if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(updates.priority)) {
                    errors.push('Invalid priority. Must be CRITICAL, HIGH, MEDIUM, or LOW');
                }
                break;

            case 'ASSIGN_AGENT':
                if (!updates.assignedAgentId) {
                    errors.push('Agent ID is required for assignment');
                }
                break;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            code: 400,
            errors
        });
    }

    next();
}; 