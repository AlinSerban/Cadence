import { BaseRepository } from './BaseRepository.js';

export class ActivityCardRepository extends BaseRepository {
    constructor() {
        super('activity_cards');
    }

    /**
     * Find cards by user ID and date
     */
    async findByUserAndDate(userId, date) {
        try {
            const query = `
                SELECT 
                    id, name, description, label, status, date, column_id, xp_value, 
                    created_at, completed_at, updated_at
                FROM ${this.tableName} 
                WHERE user_id = $1 AND date = $2::date
                ORDER BY created_at ASC
            `;

            const result = await this.query(query, [userId, date]);
            return this.processCards(result.rows);
        } catch (error) {
            console.error('[ActivityCardRepository] Error finding by user and date:', error);
            throw error;
        }
    }

    /**
     * Find cards by user ID and date range
     */
    async findByUserAndDateRange(userId, startDate, endDate) {
        try {
            const query = `
                SELECT 
                    id, name, description, label, status, date, column_id, xp_value, 
                    created_at, completed_at, updated_at
                FROM ${this.tableName} 
                WHERE user_id = $1 AND date >= $2::date AND date <= $3::date
                ORDER BY date DESC, created_at ASC
            `;

            const result = await this.query(query, [userId, startDate, endDate]);
            return this.processCards(result.rows);
        } catch (error) {
            console.error('[ActivityCardRepository] Error finding by user and date range:', error);
            throw error;
        }
    }

    /**
     * Find completed cards by user ID
     */
    async findCompletedByUser(userId, limit = null) {
        try {
            let query = `
                SELECT 
                    id, name, description, label, status, date, column_id, xp_value, 
                    created_at, completed_at, updated_at
                FROM ${this.tableName} 
                WHERE user_id = $1 AND status = 'done'
                ORDER BY completed_at DESC
            `;

            const params = [userId];

            if (limit) {
                query += ` LIMIT $2`;
                params.push(limit);
            }

            const result = await this.query(query, params);
            return this.processCards(result.rows);
        } catch (error) {
            console.error('[ActivityCardRepository] Error finding completed cards:', error);
            throw error;
        }
    }

    /**
     * Find cards by column ID
     */
    async findByColumnId(columnId, userId) {
        try {
            const query = `
                SELECT 
                    id, name, description, label, status, date, column_id, xp_value, 
                    created_at, completed_at, updated_at
                FROM ${this.tableName} 
                WHERE column_id = $1 AND user_id = $2
                ORDER BY created_at ASC
            `;

            const result = await this.query(query, [columnId, userId]);
            return this.processCards(result.rows);
        } catch (error) {
            console.error('[ActivityCardRepository] Error finding by column ID:', error);
            throw error;
        }
    }

    /**
     * Count completed cards by user ID
     */
    async countCompletedByUser(userId) {
        try {
            return await this.countByUserId(userId, { status: 'done' });
        } catch (error) {
            console.error('[ActivityCardRepository] Error counting completed cards:', error);
            throw error;
        }
    }

    /**
     * Count cards by label and user ID
     */
    async countByLabelAndUser(userId, label) {
        try {
            return await this.countByUserId(userId, { label, status: 'done' });
        } catch (error) {
            console.error('[ActivityCardRepository] Error counting by label:', error);
            throw error;
        }
    }

    /**
     * Get total XP earned by user
     */
    async getTotalXPByUser(userId) {
        try {
            const query = `
                SELECT COALESCE(SUM(xp_value), 0) as total_xp
                FROM ${this.tableName} 
                WHERE user_id = $1 AND status = 'done'
            `;

            const result = await this.query(query, [userId]);
            return parseInt(result.rows[0].total_xp);
        } catch (error) {
            console.error('[ActivityCardRepository] Error getting total XP:', error);
            throw error;
        }
    }

    /**
     * Get XP earned by user in date range
     */
    async getXPByUserAndDateRange(userId, startDate, endDate) {
        try {
            const query = `
                SELECT COALESCE(SUM(xp_value), 0) as total_xp
                FROM ${this.tableName} 
                WHERE user_id = $1 AND status = 'done' AND date >= $2::date AND date <= $3::date
            `;

            const result = await this.query(query, [userId, startDate, endDate]);
            return parseInt(result.rows[0].total_xp);
        } catch (error) {
            console.error('[ActivityCardRepository] Error getting XP by date range:', error);
            throw error;
        }
    }

    /**
     * Get cards completed today by user
     */
    async getCompletedTodayByUser(userId) {
        try {
            const query = `
                SELECT 
                    id, name, description, label, status, date, column_id, xp_value, 
                    created_at, completed_at, updated_at
                FROM ${this.tableName} 
                WHERE user_id = $1 AND status = 'done' AND date = CURRENT_DATE
                ORDER BY completed_at DESC
            `;

            const result = await this.query(query, [userId]);
            return this.processCards(result.rows);
        } catch (error) {
            console.error('[ActivityCardRepository] Error getting completed today:', error);
            throw error;
        }
    }

    /**
     * Move cards from one column to another
     */
    async moveCardsToColumn(columnId, newColumnId, userId) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET column_id = $1, updated_at = NOW()
                WHERE column_id = $2 AND user_id = $3
                RETURNING *
            `;

            const result = await this.query(query, [newColumnId, columnId, userId]);
            return this.processCards(result.rows);
        } catch (error) {
            console.error('[ActivityCardRepository] Error moving cards to column:', error);
            throw error;
        }
    }

    /**
     * Get analytics data for user
     */
    async getAnalyticsData(userId, days = 30) {
        try {
            const query = `
                SELECT 
                    DATE(date) as activity_date,
                    COUNT(*) as total_cards,
                    COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_cards,
                    COALESCE(SUM(CASE WHEN status = 'done' THEN xp_value ELSE 0 END), 0) as xp_earned,
                    COUNT(CASE WHEN label = 'gym' AND status = 'done' THEN 1 END) as gym_cards,
                    COUNT(CASE WHEN label = 'study' AND status = 'done' THEN 1 END) as study_cards,
                    COUNT(CASE WHEN label = 'work' AND status = 'done' THEN 1 END) as work_cards,
                    COUNT(CASE WHEN label = 'personal' AND status = 'done' THEN 1 END) as personal_cards,
                    COUNT(CASE WHEN label = 'other' AND status = 'done' THEN 1 END) as other_cards
                FROM ${this.tableName} 
                WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
                GROUP BY DATE(date)
                ORDER BY activity_date DESC
            `;

            const result = await this.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('[ActivityCardRepository] Error getting analytics data:', error);
            throw error;
        }
    }

    /**
     * Process cards to convert Date objects to strings
     */
    processCards(cards) {
        return cards.map(card => ({
            ...card,
            date: card.date ? (typeof card.date === 'string' ? card.date : `${card.date.getFullYear()}-${String(card.date.getMonth() + 1).padStart(2, '0')}-${String(card.date.getDate()).padStart(2, '0')}`) : null,
            completed_at: card.completed_at ? card.completed_at.toISOString() : null,
            created_at: card.created_at.toISOString(),
            updated_at: card.updated_at.toISOString()
        }));
    }
}
