import express from 'express';
import { pool } from '../db/db.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { readThroughJSON, bumpUserVersion } from '../lib/cache.js';

const router = express.Router();

// Get user's unlocked badges
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Use Redis caching for user badges
        const data = await readThroughJSON({
            userId,
            domain: "badges",
            scope: "user",
            versionField: "badges",
            ttlBaseSeconds: 600, // 10 minutes cache
            computeFn: async () => {
                const result = await pool.query(
                    `SELECT b.id, b.key, b.name, b.description, b.icon_url, b.category, ub.unlocked_at
                     FROM badges b
                     INNER JOIN user_badges ub ON b.id = ub.badge_id
                     WHERE ub.user_id = $1
                     ORDER BY ub.unlocked_at DESC`,
                    [userId]
                );

                return {
                    badges: result.rows
                };
            }
        });

        res.json(data);

    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

// Get all available badges (for progress tracking)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Use Redis caching for all badges (static data with user-specific unlock status)
        const data = await readThroughJSON({
            userId,
            domain: "badges",
            scope: "all",
            versionField: "badges",
            ttlBaseSeconds: 1800, // 30 minutes cache (static data changes rarely)
            computeFn: async () => {
                // Get all badges with user's unlock status
                const result = await pool.query(
                    `SELECT b.id, b.key, b.name, b.description, b.icon_url, b.category, b.requirement_value,
                            ub.unlocked_at,
                            COALESCE(ub.unlocked, false) as is_unlocked
                     FROM badges b
                     LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
                     ORDER BY b.category, b.requirement_value`,
                    [userId]
                );

                return {
                    badges: result.rows
                };
            }
        });

        res.json(data);

    } catch (error) {
        console.error('Error fetching all badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

export default router;
