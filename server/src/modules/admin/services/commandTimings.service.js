import { db } from '../../../db/index.js';
import { commandTimings } from '../../../db/schema/index.js';
import { desc, asc, sql, avg, count } from 'drizzle-orm';

/**
 * Service for managing command timing data
 */
class CommandTimingsService {
    /**
     * Get historical command timing data with filtering and sorting
     * @param {Object} options Query options
     * @param {number} options.limit Maximum number of records to return
     * @param {number} options.offset Number of records to skip
     * @param {string} options.sortBy Field to sort by
     * @param {string} options.sortOrder Sort direction ('asc' or 'desc')
     * @param {Object} options.filters Filtering criteria
     * @returns {Promise<Object>} Timing data and metadata
     */
    async getTimings({ limit = 20, offset = 0, sortBy = 'executed_at', sortOrder = 'desc', filters = {} }) {
        // Build where clause based on filters
        const whereClause = [];
        const params = [];

        if (filters.startDate) {
            whereClause.push(`executed_at >= $${params.length + 1}`);
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            whereClause.push(`executed_at <= $${params.length + 1}`);
            params.push(filters.endDate);
        }

        if (filters.minTickets) {
            whereClause.push(`matched_tickets_count >= $${params.length + 1}`);
            params.push(filters.minTickets);
        }

        if (filters.maxTickets) {
            whereClause.push(`matched_tickets_count <= $${params.length + 1}`);
            params.push(filters.maxTickets);
        }

        // Get total count for pagination
        const countResult = await db.select({
            total: count()
        })
        .from(commandTimings)
        .where(whereClause.length ? sql`${sql.join(whereClause, ' AND ')}` : undefined);

        // Get timing data
        const timings = await db.select()
            .from(commandTimings)
            .where(whereClause.length ? sql`${sql.join(whereClause, ' AND ')}` : undefined)
            .orderBy(sortOrder === 'desc' ? desc(commandTimings[sortBy]) : asc(commandTimings[sortBy]))
            .limit(limit)
            .offset(offset);

        // Get aggregated statistics
        const stats = await db.select({
            avg_stage_1: avg(commandTimings.stage_1_duration),
            avg_stage_2: avg(commandTimings.stage_2_duration),
            avg_stage_3: avg(commandTimings.stage_3_duration),
            avg_stage_4: avg(commandTimings.stage_4_duration),
            avg_stage_5: avg(commandTimings.stage_5_duration),
            avg_stage_6: avg(commandTimings.stage_6_duration),
            avg_tickets_matched: avg(commandTimings.matched_tickets_count),
            avg_tickets_affected: avg(commandTimings.num_tickets_affected),
            total_commands: count()
        })
        .from(commandTimings)
        .where(whereClause.length ? sql`${sql.join(whereClause, ' AND ')}` : undefined);

        return {
            timings,
            metadata: {
                total: countResult[0].total,
                limit,
                offset,
                stats: stats[0]
            }
        };
    }

    /**
     * Get performance trends over time
     * @param {string} interval Time interval for grouping ('day', 'week', 'month')
     * @param {Date} startDate Start of the period
     * @param {Date} endDate End of the period
     * @returns {Promise<Array>} Trend data
     */
    async getPerformanceTrends({ interval = 'day', startDate, endDate = new Date() }) {
        const intervalSql = interval === 'week' 
            ? sql`date_trunc('week', executed_at)`
            : interval === 'month'
                ? sql`date_trunc('month', executed_at)`
                : sql`date_trunc('day', executed_at)`;

        return db.select({
            period: intervalSql,
            avg_total_duration: sql`avg(
                stage_1_duration + stage_2_duration + stage_3_duration + 
                stage_4_duration + stage_5_duration + stage_6_duration
            )`,
            avg_tickets_matched: avg(commandTimings.matched_tickets_count),
            avg_tickets_affected: avg(commandTimings.num_tickets_affected),
            command_count: count()
        })
        .from(commandTimings)
        .where(
            sql`executed_at >= ${startDate} AND executed_at <= ${endDate}`
        )
        .groupBy(intervalSql)
        .orderBy(intervalSql);
    }
}

// Export singleton instance
export const commandTimingsService = new CommandTimingsService(); 
