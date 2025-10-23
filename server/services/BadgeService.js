import { pool } from '../db/db.js';
import { bumpUserVersion } from '../lib/cache.js';

export class BadgeService {
    /**
     * Get all badges for a user
     */
    async getUserBadges(userId) {
        try {
            console.log(`[BadgeService] Fetching badges for user ${userId}`);

            const query = `
                SELECT 
                    b.id, b.name, b.description, b.icon_url, b.category, b.requirement_value,
                    b.created_at,
                    ub.unlocked, ub.unlocked_at, ub.progress
                FROM badges b
                LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
                ORDER BY b.category, b.requirement_value ASC
            `;

            const result = await pool.query(query, [userId]);

            const badges = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                icon: row.icon_url,
                category: row.category,
                requirement: row.requirement_value,
                unlocked: row.unlocked || false,
                unlockedAt: row.unlocked_at ? row.unlocked_at.toISOString() : null,
                progress: row.progress || 0,
                createdAt: row.created_at.toISOString()
            }));

            console.log(`[BadgeService] Found ${badges.length} badges for user ${userId}`);

            return badges;
        } catch (error) {
            console.error('[BadgeService] Error fetching user badges:', error);
            throw new Error('Failed to fetch user badges');
        }
    }

    /**
     * Check and award badges based on user activity
     */
    async checkAndAwardBadges(userId, activityData) {
        try {
            console.log(`[BadgeService] Checking badges for user ${userId}`);

            const unlockedBadges = [];

            // Get all badges that could be unlocked
            const badgesQuery = `
                SELECT b.*, ub.unlocked
                FROM badges b
                LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
                WHERE ub.unlocked IS NULL OR ub.unlocked = false
            `;

            const badgesResult = await pool.query(badgesQuery, [userId]);
            const badges = badgesResult.rows;

            console.log(`[BadgeService] Found ${badges.length} potential badges to check`);

            for (const badge of badges) {
                const shouldUnlock = await this.checkSimpleBadgeRequirement(userId, badge);

                if (shouldUnlock) {
                    console.log(`[BadgeService] Unlocking badge: ${badge.name}`);
                    const unlockedBadge = await this.unlockBadge(userId, badge.id);
                    if (unlockedBadge) {
                        unlockedBadges.push(unlockedBadge);
                    }
                }
            }

            if (unlockedBadges.length > 0) {
                console.log(`[BadgeService] Unlocked ${unlockedBadges.length} badges for user ${userId}`);
                // Invalidate cache for badges
                await bumpUserVersion(userId, "badges");
            }

            return unlockedBadges;
        } catch (error) {
            console.error('[BadgeService] Error checking badges:', error);
            console.error('[BadgeService] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return [];
        }
    }

    /**
     * Check simple badge requirements based on badge key
     */
    async checkSimpleBadgeRequirement(userId, badge) {
        try {
            console.log(`[BadgeService] Checking badge: ${badge.key} (${badge.name})`);

            switch (badge.key) {
                case 'first_activity':
                    return await this.checkFirstActivity(userId);

                case 'streak_3':
                    return await this.checkStreak3(userId);

                case 'streak_7':
                    return await this.checkStreak7(userId);

                case 'xp_500':
                    return await this.checkXP500(userId);

                case 'xp_1000':
                    return await this.checkXP1000(userId);

                case 'activities_10':
                    return await this.checkActivities10(userId);

                case 'activities_50':
                    return await this.checkActivities50(userId);

                case 'activities_100':
                    return await this.checkActivities100(userId);

                case 'level_5':
                    return await this.checkLevel5(userId);

                case 'level_10':
                    return await this.checkLevel10(userId);

                case 'perfect_day':
                    return await this.checkPerfectDay(userId);

                case 'early_bird':
                    return await this.checkEarlyBird(userId, activityData);

                default:
                    console.log(`[BadgeService] Unknown badge key: ${badge.key}`);
                    return false;
            }
        } catch (error) {
            console.error('[BadgeService] Error checking badge requirement:', error);
            return false;
        }
    }

    /**
     * Check first activity badge
     */
    async checkFirstActivity(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM activity_cards WHERE user_id = $1 AND status = $2',
            [userId, 'done']
        );
        return parseInt(result.rows[0].count) >= 1;
    }

    /**
     * Check streak 3 badge
     */
    async checkStreak3(userId) {
        // For now, return false as streak calculation is complex
        return false;
    }

    /**
     * Check streak 7 badge
     */
    async checkStreak7(userId) {
        // For now, return false as streak calculation is complex
        return false;
    }

    /**
     * Check XP 500 badge
     */
    async checkXP500(userId) {
        const result = await pool.query(
            'SELECT xp FROM users WHERE id = $1',
            [userId]
        );
        if (!result.rowCount) return false;
        return result.rows[0].xp >= 500;
    }

    /**
     * Check XP 1000 badge
     */
    async checkXP1000(userId) {
        const result = await pool.query(
            'SELECT xp FROM users WHERE id = $1',
            [userId]
        );
        if (!result.rowCount) return false;
        return result.rows[0].xp >= 1000;
    }

    /**
     * Check activities 10 badge
     */
    async checkActivities10(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM activity_cards WHERE user_id = $1 AND status = $2',
            [userId, 'done']
        );
        return parseInt(result.rows[0].count) >= 10;
    }

    /**
     * Check activities 50 badge
     */
    async checkActivities50(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM activity_cards WHERE user_id = $1 AND status = $2',
            [userId, 'done']
        );
        return parseInt(result.rows[0].count) >= 50;
    }

    /**
     * Check activities 100 badge
     */
    async checkActivities100(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM activity_cards WHERE user_id = $1 AND status = $2',
            [userId, 'done']
        );
        return parseInt(result.rows[0].count) >= 100;
    }

    /**
     * Check level 5 badge
     */
    async checkLevel5(userId) {
        const result = await pool.query(
            'SELECT xp FROM users WHERE id = $1',
            [userId]
        );
        if (!result.rowCount) return false;
        const currentLevel = Math.floor(result.rows[0].xp / 50) + 1;
        return currentLevel >= 5;
    }

    /**
     * Check level 10 badge
     */
    async checkLevel10(userId) {
        const result = await pool.query(
            'SELECT xp FROM users WHERE id = $1',
            [userId]
        );
        if (!result.rowCount) return false;
        const currentLevel = Math.floor(result.rows[0].xp / 50) + 1;
        return currentLevel >= 10;
    }

    /**
     * Check perfect day badge
     */
    async checkPerfectDay(userId) {
        // For now, return false as this requires complex daily completion logic
        return false;
    }

    /**
     * Check early bird badge
     */
    async checkEarlyBird(userId, activityData) {
        if (!activityData.completed_at) return false;

        const completedTime = new Date(activityData.completed_at);
        const hour = completedTime.getHours();
        return hour < 8;
    }

    /**
     * Check streak requirement
     */
    async checkStreakRequirement(userId, requiredDays) {
        // This would need to be implemented based on your streak calculation logic
        // For now, return false as a placeholder
        return false;
    }

    /**
     * Check total XP requirement
     */
    async checkTotalXPRequirement(userId, requiredXP) {
        const result = await pool.query(
            'SELECT xp FROM users WHERE id = $1',
            [userId]
        );

        if (!result.rowCount) return false;

        return result.rows[0].xp >= requiredXP;
    }

    /**
     * Check level requirement
     */
    async checkLevelRequirement(userId, requiredLevel) {
        const result = await pool.query(
            'SELECT xp FROM users WHERE id = $1',
            [userId]
        );

        if (!result.rowCount) return false;

        const currentLevel = Math.floor(result.rows[0].xp / 50) + 1;
        return currentLevel >= requiredLevel;
    }

    /**
     * Check category cards requirement
     */
    async checkCategoryCardsRequirement(userId, requirement, activityData) {
        const { category, count } = requirement;

        const result = await pool.query(
            'SELECT COUNT(*) as count FROM activity_cards WHERE user_id = $1 AND label = $2 AND status = $3',
            [userId, category, 'done']
        );

        return parseInt(result.rows[0].count) >= count;
    }

    /**
     * Unlock a badge for a user
     */
    async unlockBadge(userId, badgeId) {
        try {
            console.log(`[BadgeService] Unlocking badge ${badgeId} for user ${userId}`);

            // First, get the badge details
            const badgeResult = await pool.query(
                'SELECT * FROM badges WHERE id = $1',
                [badgeId]
            );

            if (!badgeResult.rowCount) {
                throw new Error('Badge not found');
            }

            const badge = badgeResult.rows[0];

            // Insert or update user_badges
            const insertQuery = `
                INSERT INTO user_badges (user_id, badge_id, unlocked, unlocked_at, progress)
                VALUES ($1, $2, true, NOW(), $3)
                ON CONFLICT (user_id, badge_id)
                DO UPDATE SET 
                    unlocked = true,
                    unlocked_at = NOW(),
                    progress = $3
                RETURNING *
            `;

            const result = await pool.query(insertQuery, [userId, badgeId, badge.requirement_value]);

            return {
                id: badge.id,
                key: badge.key,
                name: badge.name,
                description: badge.description,
                icon_url: badge.icon_url,
                category: badge.category,
                unlockedAt: result.rows[0].unlocked_at.toISOString()
            };
        } catch (error) {
            console.error('[BadgeService] Error unlocking badge:', error);
            return null;
        }
    }

    /**
     * Update badge progress
     */
    async updateBadgeProgress(userId, badgeId, activityData) {
        try {
            // This would update the progress field in user_badges
            // Implementation depends on the specific badge type
            // For now, this is a placeholder
        } catch (error) {
            console.error('[BadgeService] Error updating badge progress:', error);
        }
    }

    /**
     * Get badge statistics for a user
     */
    async getBadgeStats(userId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_badges,
                    COUNT(CASE WHEN ub.unlocked = true THEN 1 END) as unlocked_badges,
                    COUNT(CASE WHEN ub.unlocked = false OR ub.unlocked IS NULL THEN 1 END) as locked_badges,
                    COUNT(CASE WHEN b.rarity = 'common' AND ub.unlocked = true THEN 1 END) as common_unlocked,
                    COUNT(CASE WHEN b.rarity = 'rare' AND ub.unlocked = true THEN 1 END) as rare_unlocked,
                    COUNT(CASE WHEN b.rarity = 'epic' AND ub.unlocked = true THEN 1 END) as epic_unlocked,
                    COUNT(CASE WHEN b.rarity = 'legendary' AND ub.unlocked = true THEN 1 END) as legendary_unlocked
                FROM badges b
                LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
            `;

            const result = await pool.query(query, [userId]);
            const stats = result.rows[0];

            return {
                total: parseInt(stats.total_badges),
                unlocked: parseInt(stats.unlocked_badges),
                locked: parseInt(stats.locked_badges),
                completionPercentage: stats.total_badges > 0 ?
                    Math.round((stats.unlocked_badges / stats.total_badges) * 100) : 0,
                rarityBreakdown: {
                    common: parseInt(stats.common_unlocked),
                    rare: parseInt(stats.rare_unlocked),
                    epic: parseInt(stats.epic_unlocked),
                    legendary: parseInt(stats.legendary_unlocked)
                }
            };
        } catch (error) {
            console.error('[BadgeService] Error getting badge stats:', error);
            throw new Error('Failed to get badge stats');
        }
    }

    /**
     * Get recently unlocked badges
     */
    async getRecentlyUnlockedBadges(userId, limit = 5) {
        try {
            const query = `
                SELECT b.*, ub.unlocked_at
                FROM badges b
                JOIN user_badges ub ON b.id = ub.badge_id
                WHERE ub.user_id = $1 AND ub.unlocked = true
                ORDER BY ub.unlocked_at DESC
                LIMIT $2
            `;

            const result = await pool.query(query, [userId, limit]);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                icon: row.icon,
                category: row.category,
                rarity: row.rarity,
                unlockedAt: row.unlocked_at.toISOString()
            }));
        } catch (error) {
            console.error('[BadgeService] Error getting recently unlocked badges:', error);
            throw new Error('Failed to get recently unlocked badges');
        }
    }
}
