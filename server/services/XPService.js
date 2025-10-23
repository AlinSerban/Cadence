import { pool } from '../db/db.js';
import { bumpUserVersion } from '../lib/cache.js';

export class XPService {
    /**
     * Award XP to a user
     */
    async awardXP(userId, amount, reason = 'activity_completion') {
        try {
            console.log(`[XPService] Awarding ${amount} XP to user ${userId} for: ${reason}`);

            const result = await pool.query(
                'UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp',
                [amount, userId]
            );

            if (!result.rowCount) {
                throw new Error('User not found');
            }

            const newXP = result.rows[0].xp;
            const newLevel = this.calculateLevel(newXP);

            // Check if user leveled up
            const previousLevel = await this.getUserLevel(userId);
            const leveledUp = newLevel > previousLevel;

            console.log(`[XPService] User ${userId} now has ${newXP} XP (level ${newLevel})`);

            // Invalidate cache
            await bumpUserVersion(userId, "dash");

            return {
                newXP,
                newLevel,
                leveledUp,
                xpGained: amount
            };
        } catch (error) {
            console.error('[XPService] Error awarding XP:', error);
            throw new Error('Failed to award XP');
        }
    }

    /**
     * Remove XP from a user (for undoing actions)
     */
    async removeXP(userId, amount, reason = 'activity_undo') {
        try {
            console.log(`[XPService] Removing ${amount} XP from user ${userId} for: ${reason}`);

            const result = await pool.query(
                'UPDATE users SET xp = GREATEST(xp - $1, 0) WHERE id = $2 RETURNING xp',
                [amount, userId]
            );

            if (!result.rowCount) {
                throw new Error('User not found');
            }

            const newXP = result.rows[0].xp;
            const newLevel = this.calculateLevel(newXP);

            console.log(`[XPService] User ${userId} now has ${newXP} XP (level ${newLevel})`);

            // Invalidate cache
            await bumpUserVersion(userId, "dash");

            return {
                newXP,
                newLevel,
                xpLost: amount
            };
        } catch (error) {
            console.error('[XPService] Error removing XP:', error);
            throw new Error('Failed to remove XP');
        }
    }

    /**
     * Get user's current XP and level
     */
    async getUserXP(userId) {
        try {
            const result = await pool.query(
                'SELECT xp FROM users WHERE id = $1',
                [userId]
            );

            if (!result.rowCount) {
                throw new Error('User not found');
            }

            const xp = result.rows[0].xp;
            const level = this.calculateLevel(xp);
            const progress = this.calculateProgress(xp, level);
            const xpToNext = this.calculateXPToNext(level);

            return {
                xp,
                level,
                progress,
                xpToNext
            };
        } catch (error) {
            console.error('[XPService] Error getting user XP:', error);
            throw new Error('Failed to get user XP');
        }
    }

    /**
     * Get user's current level
     */
    async getUserLevel(userId) {
        try {
            const result = await pool.query(
                'SELECT xp FROM users WHERE id = $1',
                [userId]
            );

            if (!result.rowCount) {
                throw new Error('User not found');
            }

            return this.calculateLevel(result.rows[0].xp);
        } catch (error) {
            console.error('[XPService] Error getting user level:', error);
            throw new Error('Failed to get user level');
        }
    }

    /**
     * Calculate level from XP (50 XP per level)
     */
    calculateLevel(xp) {
        return Math.max(1, Math.floor(xp / 50) + 1);
    }

    /**
     * Calculate progress percentage to next level
     */
    calculateProgress(xp, level) {
        const currentLevelXP = (level - 1) * 50;
        const nextLevelXP = level * 50;
        const progressXP = xp - currentLevelXP;
        const levelXP = nextLevelXP - currentLevelXP;

        return Math.min((progressXP / levelXP) * 100, 100);
    }

    /**
     * Calculate XP needed to reach next level
     */
    calculateXPToNext(level) {
        const nextLevelXP = level * 50;
        return nextLevelXP;
    }

    /**
     * Get XP required for a specific level
     */
    getXPForLevel(level) {
        return (level - 1) * 50;
    }

    /**
     * Get level statistics for multiple users (for leaderboards)
     */
    async getLevelStats(userIds) {
        try {
            if (!userIds || userIds.length === 0) {
                return [];
            }

            const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
            const query = `
                SELECT id, xp, 
                       FLOOR(xp / 50) + 1 as level,
                       (xp % 50) as xp_in_current_level,
                       (50 - (xp % 50)) as xp_to_next_level
                FROM users 
                WHERE id IN (${placeholders})
                ORDER BY xp DESC
            `;

            const result = await pool.query(query, userIds);

            return result.rows.map(row => ({
                userId: row.id,
                xp: row.xp,
                level: row.level,
                xpInCurrentLevel: row.xp_in_current_level,
                xpToNextLevel: row.xp_to_next_level
            }));
        } catch (error) {
            console.error('[XPService] Error getting level stats:', error);
            throw new Error('Failed to get level stats');
        }
    }

    /**
     * Get top users by XP (for leaderboards)
     */
    async getTopUsers(limit = 10) {
        try {
            const query = `
                SELECT id, full_name, username, xp,
                       FLOOR(xp / 50) + 1 as level
                FROM users 
                ORDER BY xp DESC 
                LIMIT $1
            `;

            const result = await pool.query(query, [limit]);

            return result.rows.map((row, index) => ({
                rank: index + 1,
                userId: row.id,
                fullName: row.full_name,
                username: row.username,
                xp: row.xp,
                level: row.level
            }));
        } catch (error) {
            console.error('[XPService] Error getting top users:', error);
            throw new Error('Failed to get top users');
        }
    }

    /**
     * Reset user XP (admin function)
     */
    async resetUserXP(userId, newXP = 0) {
        try {
            console.log(`[XPService] Resetting XP for user ${userId} to ${newXP}`);

            const result = await pool.query(
                'UPDATE users SET xp = $1 WHERE id = $2 RETURNING xp',
                [newXP, userId]
            );

            if (!result.rowCount) {
                throw new Error('User not found');
            }

            const level = this.calculateLevel(newXP);

            // Invalidate cache
            await bumpUserVersion(userId, "dash");

            return {
                xp: newXP,
                level
            };
        } catch (error) {
            console.error('[XPService] Error resetting user XP:', error);
            throw new Error('Failed to reset user XP');
        }
    }
}
