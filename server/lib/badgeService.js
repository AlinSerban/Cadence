import { pool } from '../db/db.js';

/**
 * Check and award badges for a user when they complete an activity card
 * @param {number} userId - The user ID
 * @param {Object} cardData - The completed card data
 * @returns {Array} Array of newly unlocked badges
 */
export async function checkAndAwardBadges(userId, cardData) {
    const unlockedBadges = [];

    try {
        // Get user's current stats
        const userStats = await getUserStats(userId);

        // Check various badge conditions
        const badgeChecks = [
            checkFirstCardBadge(userId, userStats),
            checkMilestoneBadges(userId, userStats),
            checkLevelBadges(userId, userStats),
            checkStreakBadges(userId, userStats),
            checkActivityTypeBadges(userId, userStats, cardData),
            checkDailyBadges(userId, userStats, cardData),
            checkSpecialBadges(userId, userStats, cardData)
        ];

        // Execute all badge checks
        const results = await Promise.all(badgeChecks);

        // Flatten and collect all unlocked badges
        results.forEach(badges => {
            if (badges && badges.length > 0) {
                unlockedBadges.push(...badges);
            }
        });

        console.log(`[BadgeService] User ${userId} unlocked ${unlockedBadges.length} badges`);
        return unlockedBadges;

    } catch (error) {
        console.error('[BadgeService] Error checking badges:', error);
        return [];
    }
}

/**
 * Get user's current statistics
 */
async function getUserStats(userId) {
    const stats = {};

    // Get total completed cards
    const cardsResult = await pool.query(
        'SELECT COUNT(*) as total FROM activity_cards WHERE user_id = $1 AND status = $2',
        [userId, 'done']
    );
    stats.totalCompletedCards = parseInt(cardsResult.rows[0].total);

    // Get user's current level and XP
    const userResult = await pool.query(
        'SELECT xp FROM users WHERE id = $1',
        [userId]
    );
    stats.currentXp = userResult.rows[0]?.xp || 0;
    stats.currentLevel = Math.max(1, Math.floor(stats.currentXp / 50) + 1);

    // Get activity type counts
    const activityResult = await pool.query(
        `SELECT label, COUNT(*) as count 
         FROM activity_cards 
         WHERE user_id = $1 AND status = $2 
         GROUP BY label`,
        [userId, 'done']
    );
    stats.activityCounts = {};
    activityResult.rows.forEach(row => {
        stats.activityCounts[row.label] = parseInt(row.count);
    });

    // Get current streak
    stats.currentStreak = await getCurrentStreak(userId);

    return stats;
}

/**
 * Get user's current completion streak
 */
async function getCurrentStreak(userId) {
    const result = await pool.query(
        `WITH daily_completions AS (
            SELECT DISTINCT date, COUNT(*) as completed
            FROM activity_cards 
            WHERE user_id = $1 AND status = 'done'
            GROUP BY date
            ORDER BY date DESC
        )
        SELECT COUNT(*) as streak
        FROM daily_completions
        WHERE completed > 0`,
        [userId]
    );

    return parseInt(result.rows[0]?.streak || 0);
}

/**
 * Check first card badges
 */
async function checkFirstCardBadge(userId, stats) {
    if (stats.totalCompletedCards === 1) {
        return await awardBadge(userId, 'first_card');
    }
    return [];
}

/**
 * Check milestone badges (5, 10, 25, 50, 100, 250, 500 cards)
 */
async function checkMilestoneBadges(userId, stats) {
    const milestones = [5, 10, 25, 50, 100, 250, 500];
    const unlocked = [];

    for (const milestone of milestones) {
        if (stats.totalCompletedCards === milestone) {
            const badgeKey = milestone === 5 ? 'first_5_cards' :
                milestone === 10 ? 'first_10_cards' :
                    `cards_${milestone}`;
            const badges = await awardBadge(userId, badgeKey);
            unlocked.push(...badges);
        }
    }

    return unlocked;
}

/**
 * Check level badges (5, 10, 20, 50)
 */
async function checkLevelBadges(userId, stats) {
    const levels = [5, 10, 20, 50];
    const unlocked = [];

    for (const level of levels) {
        if (stats.currentLevel === level) {
            const badges = await awardBadge(userId, `level_${level}`);
            unlocked.push(...badges);
        }
    }

    return unlocked;
}

/**
 * Check streak badges (3, 7, 14, 30 days)
 */
async function checkStreakBadges(userId, stats) {
    const streaks = [3, 7, 14, 30];
    const unlocked = [];

    for (const streak of streaks) {
        if (stats.currentStreak === streak) {
            const badges = await awardBadge(userId, `streak_${streak}`);
            unlocked.push(...badges);
        }
    }

    return unlocked;
}

/**
 * Check activity type badges (10 of each type)
 */
async function checkActivityTypeBadges(userId, stats, cardData) {
    const unlocked = [];
    const activityTypes = ['gym', 'study', 'work', 'personal'];

    for (const type of activityTypes) {
        if (stats.activityCounts[type] === 10) {
            const badgeKey = `${type}_10`;
            const badges = await awardBadge(userId, badgeKey);
            unlocked.push(...badges);
        }
    }

    return unlocked;
}

/**
 * Check daily achievement badges
 */
async function checkDailyBadges(userId, stats, cardData) {
    const unlocked = [];

    // Check for early bird (completed before 8 AM)
    if (cardData.completed_at) {
        const completedTime = new Date(cardData.completed_at);
        const hour = completedTime.getHours();

        if (hour < 8) {
            const badges = await awardBadge(userId, 'early_bird');
            unlocked.push(...badges);
        }

        if (hour >= 22) {
            const badges = await awardBadge(userId, 'night_owl');
            unlocked.push(...badges);
        }
    }

    // Check for perfect day (all cards completed in one day)
    const today = new Date().toISOString().split('T')[0];
    const todayCards = await pool.query(
        'SELECT COUNT(*) as total FROM activity_cards WHERE user_id = $1 AND date = $2',
        [userId, today]
    );
    const todayCompleted = await pool.query(
        'SELECT COUNT(*) as completed FROM activity_cards WHERE user_id = $1 AND date = $2 AND status = $3',
        [userId, today, 'done']
    );

    if (parseInt(todayCards.rows[0].total) > 0 &&
        parseInt(todayCompleted.rows[0].completed) === parseInt(todayCards.rows[0].total)) {
        const badges = await awardBadge(userId, 'perfect_day');
        unlocked.push(...badges);
    }

    return unlocked;
}

/**
 * Check special badges
 */
async function checkSpecialBadges(userId, stats, cardData) {
    const unlocked = [];

    // Check for speed demon (5 cards in one day)
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = await pool.query(
        'SELECT COUNT(*) as completed FROM activity_cards WHERE user_id = $1 AND date = $2 AND status = $3',
        [userId, today, 'done']
    );

    if (parseInt(todayCompleted.rows[0].completed) === 5) {
        const badges = await awardBadge(userId, 'speed_demon');
        unlocked.push(...badges);
    }

    // Check for variety seeker (completed cards in all 5 categories)
    const categories = Object.keys(stats.activityCounts);
    if (categories.length === 5) {
        const badges = await awardBadge(userId, 'variety_seeker');
        unlocked.push(...badges);
    }

    return unlocked;
}

/**
 * Award a badge to a user
 */
async function awardBadge(userId, badgeKey) {
    try {
        // Get badge info
        const badgeResult = await pool.query(
            'SELECT id, name, description, icon_url FROM badges WHERE key = $1',
            [badgeKey]
        );

        if (badgeResult.rows.length === 0) {
            console.log(`[BadgeService] Badge ${badgeKey} not found`);
            return [];
        }

        const badge = badgeResult.rows[0];

        // Check if user already has this badge
        const existingResult = await pool.query(
            'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
            [userId, badge.id]
        );

        if (existingResult.rows.length > 0) {
            // User already has this badge
            return [];
        }

        // Award the badge
        await pool.query(
            'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)',
            [userId, badge.id]
        );

        console.log(`[BadgeService] Awarded badge ${badgeKey} to user ${userId}`);

        return [{
            id: badge.id,
            key: badgeKey,
            name: badge.name,
            description: badge.description,
            icon_url: badge.icon_url
        }];

    } catch (error) {
        console.error(`[BadgeService] Error awarding badge ${badgeKey}:`, error);
        return [];
    }
}
