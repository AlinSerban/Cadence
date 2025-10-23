import { pool } from '../db/db.js';

export class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    /**
     * Execute a query with parameters
     */
    async query(text, params = []) {
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Query error:`, error);
            throw error;
        }
    }

    /**
     * Find a record by ID
     */
    async findById(id, userId = null) {
        try {
            let query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
            const params = [id];

            if (userId) {
                query += ` AND user_id = $2`;
                params.push(userId);
            }

            const result = await this.query(query, params);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding by ID:`, error);
            throw error;
        }
    }

    /**
     * Find records by user ID
     */
    async findByUserId(userId, options = {}) {
        try {
            const { orderBy = 'created_at', orderDirection = 'DESC', limit, offset } = options;

            let query = `SELECT * FROM ${this.tableName} WHERE user_id = $1`;
            const params = [userId];

            query += ` ORDER BY ${orderBy} ${orderDirection}`;

            if (limit) {
                query += ` LIMIT $${params.length + 1}`;
                params.push(limit);
            }

            if (offset) {
                query += ` OFFSET $${params.length + 1}`;
                params.push(offset);
            }

            const result = await this.query(query, params);
            return result.rows;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding by user ID:`, error);
            throw error;
        }
    }

    /**
     * Create a new record
     */
    async create(data) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = values.map((_, index) => `$${index + 1}`);

            const query = `
                INSERT INTO ${this.tableName} (${fields.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING *
            `;

            const result = await this.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error creating record:`, error);
            throw error;
        }
    }

    /**
     * Update a record by ID
     */
    async update(id, data, userId = null) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = fields.map((field, index) => `${field} = $${index + 1}`);

            let query = `UPDATE ${this.tableName} SET ${placeholders.join(', ')} WHERE id = $${values.length + 1}`;
            const params = [...values, id];

            if (userId) {
                query += ` AND user_id = $${params.length + 1}`;
                params.push(userId);
            }

            query += ` RETURNING *`;

            const result = await this.query(query, params);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error updating record:`, error);
            throw error;
        }
    }

    /**
     * Delete a record by ID
     */
    async delete(id, userId = null) {
        try {
            let query = `DELETE FROM ${this.tableName} WHERE id = $1`;
            const params = [id];

            if (userId) {
                query += ` AND user_id = $2`;
                params.push(userId);
            }

            query += ` RETURNING *`;

            const result = await this.query(query, params);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error deleting record:`, error);
            throw error;
        }
    }

    /**
     * Count records by user ID
     */
    async countByUserId(userId, conditions = {}) {
        try {
            let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = $1`;
            const params = [userId];

            Object.keys(conditions).forEach((key, index) => {
                query += ` AND ${key} = $${params.length + 1}`;
                params.push(conditions[key]);
            });

            const result = await this.query(query, params);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error counting records:`, error);
            throw error;
        }
    }

    /**
     * Find records with custom conditions
     */
    async findWhere(conditions, options = {}) {
        try {
            const { orderBy = 'created_at', orderDirection = 'DESC', limit, offset } = options;

            let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
            const params = [];

            Object.keys(conditions).forEach((key, index) => {
                query += ` AND ${key} = $${params.length + 1}`;
                params.push(conditions[key]);
            });

            query += ` ORDER BY ${orderBy} ${orderDirection}`;

            if (limit) {
                query += ` LIMIT $${params.length + 1}`;
                params.push(limit);
            }

            if (offset) {
                query += ` OFFSET $${params.length + 1}`;
                params.push(offset);
            }

            const result = await this.query(query, params);
            return result.rows;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error finding with conditions:`, error);
            throw error;
        }
    }

    /**
     * Execute a custom query
     */
    async customQuery(query, params = []) {
        try {
            const result = await this.query(query, params);
            return result.rows;
        } catch (error) {
            console.error(`[${this.tableName}Repository] Error executing custom query:`, error);
            throw error;
        }
    }
}
