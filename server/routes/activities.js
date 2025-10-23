import express from "express";
import { pool } from "../db/db.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { readThroughJSON, bumpUserVersion } from "../lib/cache.js";

const router = express.Router();

// Get all custom activities for user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM custom_activities 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("GET /activities error:", error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
});

// Create new custom activity
router.post("/", authMiddleware, async (req, res) => {
    const { name, description, color, icon, category, target_duration } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO custom_activities (user_id, name, description, color, icon, category, target_duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [req.user.id, name, description, color, icon, category, target_duration]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("POST /activities error:", error);
        res.status(500).json({ error: "Failed to create activity" });
    }
});

// Update custom activity
router.put("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, color, icon, category, target_duration, is_active } = req.body;

    try {
        const result = await pool.query(
            `UPDATE custom_activities 
       SET name = $1, description = $2, color = $3, icon = $4, category = $5, target_duration = $6, is_active = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
            [name, description, color, icon, category, target_duration, is_active, id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Activity not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("PUT /activities/:id error:", error);
        res.status(500).json({ error: "Failed to update activity" });
    }
});

// Delete custom activity
router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE custom_activities 
       SET is_active = false 
       WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Activity not found" });
        }

        res.json({ message: "Activity deleted successfully" });
    } catch (error) {
        console.error("DELETE /activities/:id error:", error);
        res.status(500).json({ error: "Failed to delete activity" });
    }
});

// Get activity history
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const data = await readThroughJSON({
            userId: req.user.id,
            domain: "series-30d",
            scope: "activities",
            versionField: "activities",
            ttlBaseSeconds: 90,
            computeFn: async () => {
                const result = await pool.query(
                    `SELECT 
             DATE(al.entry_timestamp) AS entry_date, 
             SUM(al.duration) AS total_duration,
             COUNT(*) as activity_count,
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'activity_id', al.activity_id,
                 'activity_name', ca.name,
                 'duration', al.duration
               )
             ) as activities
           FROM activity_logs al
           JOIN custom_activities ca ON al.activity_id = ca.id
           WHERE al.user_id = $1 AND al.entry_timestamp >= NOW() - INTERVAL '30 days'
           GROUP BY DATE(al.entry_timestamp)
           ORDER BY DATE(al.entry_timestamp)`,
                    [req.user.id]
                );
                return result.rows;
            },
        });
        res.json(data);
    } catch (error) {
        console.error("GET /activities/history error:", error);
        res.status(500).json({ error: "Failed to fetch activity history" });
    }
});

// Log activity time
router.post("/log", authMiddleware, async (req, res) => {
    const { activity_id, goal_id, duration, notes, entry_date } = req.body;

    try {
        // Insert activity log
        await pool.query(
            `INSERT INTO activity_logs (user_id, activity_id, goal_id, duration, notes, entry_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user.id, activity_id, goal_id, duration, notes, entry_date]
        );

        // Award XP and badges
        const XP_GAIN = 10;
        await pool.query(
            `UPDATE users SET xp = xp + $1 WHERE id = $2`,
            [XP_GAIN, req.user.id]
        );

        // Get updated XP
        const xpResult = await pool.query(`SELECT xp FROM users WHERE id = $1`, [req.user.id]);
        const totalXp = xpResult.rows[0].xp;

        // Check for badges (simplified for now)
        const unlockedBadges = [];

        // Bump cache versions
        await Promise.all([
            bumpUserVersion(req.user.id, "activities"),
            bumpUserVersion(req.user.id, "dash"),
        ]);

        res.status(201).json({
            message: "Activity logged successfully!",
            xpGained: XP_GAIN,
            totalXp,
            unlockedBadges,
        });
    } catch (error) {
        console.error("POST /activities/log error:", error);
        res.status(500).json({ error: "Failed to log activity" });
    }
});

export default router;
