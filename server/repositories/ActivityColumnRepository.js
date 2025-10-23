import { BaseRepository } from './BaseRepository.js';

export class ActivityColumnRepository extends BaseRepository {
    constructor() {
        super('activity_columns');
    }

    /**
     * Find columns by user ID and date
     */
    async findByUserAndDate(userId, date) {
        try {
            const query = `
                SELECT 
                    id, name, color, date, order_index, created_at, updated_at
                FROM ${this.tableName} 
                WHERE user_id = $1 AND date = $2::date
                ORDER BY order_index ASC, created_at ASC
            `;

            const result = await this.query(query, [userId, date]);
            return this.processColumns(result.rows);
        } catch (error) {
            console.error('[ActivityColumnRepository] Error finding by user and date:', error);
            throw error;
        }
    }

    /**
     * Create a new column with auto-incrementing order index
     */
    async createWithOrder(data) {
        try {
            const { user_id, name, color, date } = data;

            // Get the next order index
            const orderQuery = `
                SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
                FROM ${this.tableName}
                WHERE user_id = $1 AND date = $2::date
            `;

            const orderResult = await this.query(orderQuery, [user_id, date]);
            const nextOrder = orderResult.rows[0].next_order;

            // Create the column with the calculated order
            const columnData = {
                ...data,
                order_index: nextOrder
            };

            return await this.create(columnData);
        } catch (error) {
            console.error('[ActivityColumnRepository] Error creating with order:', error);
            throw error;
        }
    }

    /**
     * Update column order
     */
    async updateOrder(columnId, newOrder, userId) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET order_index = $1, updated_at = NOW()
                WHERE id = $2 AND user_id = $3
                RETURNING *
            `;

            const result = await this.query(query, [newOrder, columnId, userId]);
            return result.rows[0] ? this.processColumns([result.rows[0]])[0] : null;
        } catch (error) {
            console.error('[ActivityColumnRepository] Error updating order:', error);
            throw error;
        }
    }

    /**
     * Reorder columns for a specific date
     */
    async reorderColumns(userId, date, columnOrders) {
        try {
            // Start a transaction-like operation
            const results = [];

            for (const { id, order_index } of columnOrders) {
                const result = await this.updateOrder(id, order_index, userId);
                if (result) {
                    results.push(result);
                }
            }

            return results;
        } catch (error) {
            console.error('[ActivityColumnRepository] Error reordering columns:', error);
            throw error;
        }
    }

    /**
     * Get column statistics
     */
    async getColumnStats(userId, date) {
        try {
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    c.color,
                    c.order_index,
                    COUNT(ac.id) as card_count,
                    COUNT(CASE WHEN ac.status = 'done' THEN 1 END) as completed_count,
                    COALESCE(SUM(CASE WHEN ac.status = 'done' THEN ac.xp_value ELSE 0 END), 0) as xp_earned
                FROM ${this.tableName} c
                LEFT JOIN activity_cards ac ON c.id = ac.column_id AND ac.user_id = c.user_id
                WHERE c.user_id = $1 AND c.date = $2::date
                GROUP BY c.id, c.name, c.color, c.order_index
                ORDER BY c.order_index ASC
            `;

            const result = await this.query(query, [userId, date]);
            return result.rows;
        } catch (error) {
            console.error('[ActivityColumnRepository] Error getting column stats:', error);
            throw error;
        }
    }

    /**
     * Find columns with card counts
     */
    async findWithCardCounts(userId, date) {
        try {
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    c.color,
                    c.date,
                    c.order_index,
                    c.created_at,
                    c.updated_at,
                    COUNT(ac.id) as card_count,
                    COUNT(CASE WHEN ac.status = 'in_progress' THEN 1 END) as active_cards,
                    COUNT(CASE WHEN ac.status = 'done' THEN 1 END) as completed_cards
                FROM ${this.tableName} c
                LEFT JOIN activity_cards ac ON c.id = ac.column_id AND ac.user_id = c.user_id
                WHERE c.user_id = $1 AND c.date = $2::date
                GROUP BY c.id, c.name, c.color, c.date, c.order_index, c.created_at, c.updated_at
                ORDER BY c.order_index ASC, c.created_at ASC
            `;

            const result = await this.query(query, [userId, date]);
            return this.processColumns(result.rows);
        } catch (error) {
            console.error('[ActivityColumnRepository] Error finding with card counts:', error);
            throw error;
        }
    }

    /**
     * Delete column and move cards to main board
     */
    async deleteAndMoveCards(columnId, userId) {
        try {
            // First, move all cards from this column to main board (set column_id to null)
            const moveCardsQuery = `
                UPDATE activity_cards 
                SET column_id = NULL, updated_at = NOW()
                WHERE column_id = $1 AND user_id = $2
            `;

            await this.query(moveCardsQuery, [columnId, userId]);

            // Then delete the column
            return await this.delete(columnId, userId);
        } catch (error) {
            console.error('[ActivityColumnRepository] Error deleting and moving cards:', error);
            throw error;
        }
    }

    /**
     * Get columns by date range
     */
    async findByUserAndDateRange(userId, startDate, endDate) {
        try {
            const query = `
                SELECT 
                    id, name, color, date, order_index, created_at, updated_at
                FROM ${this.tableName} 
                WHERE user_id = $1 AND date >= $2::date AND date <= $3::date
                ORDER BY date DESC, order_index ASC
            `;

            const result = await this.query(query, [userId, startDate, endDate]);
            return this.processColumns(result.rows);
        } catch (error) {
            console.error('[ActivityColumnRepository] Error finding by date range:', error);
            throw error;
        }
    }

    /**
     * Process columns to convert Date objects to strings
     */
    processColumns(columns) {
        return columns.map(column => ({
            ...column,
            date: column.date ? column.date.toISOString().split('T')[0] : null,
            created_at: column.created_at.toISOString(),
            updated_at: column.updated_at.toISOString()
        }));
    }
}
