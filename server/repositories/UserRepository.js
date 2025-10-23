import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
    constructor() {
        super('users');
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;
            const result = await this.query(query, [email]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('[UserRepository] Error finding by email:', error);
            throw error;
        }
    }

    /**
     * Find user by username
     */
    async findByUsername(username) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE username = $1`;
            const result = await this.query(query, [username]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('[UserRepository] Error finding by username:', error);
            throw error;
        }
    }

    /**
     * Update user XP
     */
    async updateXP(userId, xpChange) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET xp = GREATEST(xp + $1, 0)
                WHERE id = $2
                RETURNING xp
            `;

            const result = await this.query(query, [xpChange, userId]);
            return result.rows[0] ? parseInt(result.rows[0].xp) : 0;
        } catch (error) {
            console.error('[UserRepository] Error updating XP:', error);
            throw error;
        }
    }

    /**
     * Set user XP to specific value
     */
    async setXP(userId, xp) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET xp = $1
                WHERE id = $2
                RETURNING xp
            `;

            const result = await this.query(query, [xp, userId]);
            return result.rows[0] ? parseInt(result.rows[0].xp) : 0;
        } catch (error) {
            console.error('[UserRepository] Error setting XP:', error);
            throw error;
        }
    }

    /**
     * Get user XP
     */
    async getXP(userId) {
        try {
            const query = `SELECT xp FROM ${this.tableName} WHERE id = $1`;
            const result = await this.query(query, [userId]);
            return result.rows[0] ? parseInt(result.rows[0].xp) : 0;
        } catch (error) {
            console.error('[UserRepository] Error getting XP:', error);
            throw error;
        }
    }

    /**
     * Get user level
     */
    async getLevel(userId) {
        try {
            const xp = await this.getXP(userId);
            return Math.max(1, Math.floor(xp / 50) + 1);
        } catch (error) {
            console.error('[UserRepository] Error getting level:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, profileData) {
        try {
            const allowedFields = ['full_name', 'username', 'email'];
            const updateData = {};

            Object.keys(profileData).forEach(key => {
                if (allowedFields.includes(key) && profileData[key] !== undefined) {
                    updateData[key] = profileData[key];
                }
            });

            if (Object.keys(updateData).length === 0) {
                throw new Error('No valid fields to update');
            }

            return await this.update(userId, updateData);
        } catch (error) {
            console.error('[UserRepository] Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Update user password
     */
    async updatePassword(userId, hashedPassword) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET password = $1
                WHERE id = $2
                RETURNING id
            `;

            const result = await this.query(query, [hashedPassword, userId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('[UserRepository] Error updating password:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.full_name,
                    u.username,
                    u.email,
                    u.xp,
                    u.created_at,
                    COUNT(ac.id) as total_cards,
                    COUNT(CASE WHEN ac.status = 'done' THEN 1 END) as completed_cards,
                    COUNT(CASE WHEN ac.status = 'in_progress' THEN 1 END) as active_cards,
                    COALESCE(SUM(CASE WHEN ac.status = 'done' THEN ac.xp_value ELSE 0 END), 0) as total_xp_earned
                FROM ${this.tableName} u
                LEFT JOIN activity_cards ac ON u.id = ac.user_id
                WHERE u.id = $1
                GROUP BY u.id, u.full_name, u.username, u.email, u.xp, u.created_at
            `;

            const result = await this.query(query, [userId]);
            const user = result.rows[0];

            if (!user) {
                return null;
            }

            return {
                id: user.id,
                fullName: user.full_name,
                username: user.username,
                email: user.email,
                xp: parseInt(user.xp),
                level: Math.max(1, Math.floor(user.xp / 50) + 1),
                totalCards: parseInt(user.total_cards),
                completedCards: parseInt(user.completed_cards),
                activeCards: parseInt(user.active_cards),
                totalXPEarned: parseInt(user.total_xp_earned),
                createdAt: user.created_at.toISOString()
            };
        } catch (error) {
            console.error('[UserRepository] Error getting user stats:', error);
            throw error;
        }
    }

    /**
     * Get top users by XP
     */
    async getTopUsers(limit = 10) {
        try {
            const query = `
                SELECT 
                    id, full_name, username, xp, created_at
                FROM ${this.tableName} 
                ORDER BY xp DESC 
                LIMIT $1
            `;

            const result = await this.query(query, [limit]);

            return result.rows.map((user, index) => ({
                rank: index + 1,
                id: user.id,
                fullName: user.full_name,
                username: user.username,
                xp: parseInt(user.xp),
                level: Math.max(1, Math.floor(user.xp / 50) + 1),
                createdAt: user.created_at.toISOString()
            }));
        } catch (error) {
            console.error('[UserRepository] Error getting top users:', error);
            throw error;
        }
    }

    /**
     * Check if email exists
     */
    async emailExists(email, excludeUserId = null) {
        try {
            let query = `SELECT id FROM ${this.tableName} WHERE email = $1`;
            const params = [email];

            if (excludeUserId) {
                query += ` AND id != $2`;
                params.push(excludeUserId);
            }

            const result = await this.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            console.error('[UserRepository] Error checking email exists:', error);
            throw error;
        }
    }

    /**
     * Check if username exists
     */
    async usernameExists(username, excludeUserId = null) {
        try {
            let query = `SELECT id FROM ${this.tableName} WHERE username = $1`;
            const params = [username];

            if (excludeUserId) {
                query += ` AND id != $2`;
                params.push(excludeUserId);
            }

            const result = await this.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            console.error('[UserRepository] Error checking username exists:', error);
            throw error;
        }
    }

    /**
     * Get user level progress
     */
    async getLevelProgress(userId) {
        try {
            const xp = await this.getXP(userId);
            const level = Math.max(1, Math.floor(xp / 50) + 1);
            const currentLevelXP = (level - 1) * 50;
            const nextLevelXP = level * 50;
            const progressXP = xp - currentLevelXP;
            const levelXP = nextLevelXP - currentLevelXP;
            const progress = Math.min((progressXP / levelXP) * 100, 100);

            return {
                level,
                xp,
                progress,
                xpToNext: nextLevelXP,
                xpInCurrentLevel: progressXP
            };
        } catch (error) {
            console.error('[UserRepository] Error getting level progress:', error);
            throw error;
        }
    }
}
