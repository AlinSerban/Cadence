import express from "express";
import { pool } from "../db/db.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { readThroughJSON, bumpUserVersion } from "../lib/cache.js";

const router = express.Router();

// Get all goals for user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT g.*, ca.name as activity_name, ca.icon, ca.color
       FROM activity_goals g
       JOIN custom_activities ca ON g.activity_id = ca.id
       WHERE g.user_id = $1
       ORDER BY g.created_at DESC`,
            [req.user.id]
        );

        // Use Redis caching for goals data
        const data = await readThroughJSON({
            userId: req.user.id,
            domain: "goals",
            scope: "all",
            versionField: "goals",
            ttlBaseSeconds: 300, // 5 minutes cache
            computeFn: async () => {
                const goals = result.rows.map(row => ({
                    id: row.id,
                    user_id: row.user_id,
                    activity_id: row.activity_id,
                    goal_type: row.goal_type,
                    target_frequency: row.target_frequency,
                    target_duration: row.target_duration,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    is_completed: row.is_completed,
                    completed_count: row.completed_count,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    activity: {
                        id: row.activity_id,
                        name: row.activity_name,
                        icon: row.icon,
                        color: row.color
                    }
                }));

                return goals;
            }
        });

        res.json(data);
    } catch (error) {
        console.error("GET /goals error:", error);
        res.status(500).json({ error: "Failed to fetch goals" });
    }
});

// Create new goal
router.post("/", authMiddleware, async (req, res) => {
    const { activity_id, goal_type, target_frequency, target_duration, start_date, end_date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO activity_goals (user_id, activity_id, goal_type, target_frequency, target_duration, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [req.user.id, activity_id, goal_type, target_frequency, target_duration, start_date, end_date]
        );

        // Invalidate cache for goals data
        await bumpUserVersion(req.user.id, "goals");

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("POST /goals error:", error);
        res.status(500).json({ error: "Failed to create goal" });
    }
});

// Update goal
router.put("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { target_frequency, target_duration, end_date, is_completed } = req.body;

    try {
        const result = await pool.query(
            `UPDATE activity_goals 
       SET target_frequency = $1, target_duration = $2, end_date = $3, is_completed = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
            [target_frequency, target_duration, end_date, is_completed, id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Goal not found" });
        }

        // Invalidate cache for goals data
        await bumpUserVersion(req.user.id, "goals");

        res.json(result.rows[0]);
    } catch (error) {
        console.error("PUT /goals/:id error:", error);
        res.status(500).json({ error: "Failed to update goal" });
    }
});

// Delete goal
router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM activity_goals 
       WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Goal not found" });
        }

        // Invalidate cache for goals data
        await bumpUserVersion(req.user.id, "goals");

        res.json({ message: "Goal deleted successfully" });
    } catch (error) {
        console.error("DELETE /goals/:id error:", error);
        res.status(500).json({ error: "Failed to delete goal" });
    }
});

// Get goal progress
router.get("/progress", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
         g.id as goal_id,
         g.completed_count,
         g.target_frequency,
         ROUND((g.completed_count::float / g.target_frequency) * 100) as progress_percentage,
         GREATEST(0, EXTRACT(DAYS FROM (g.end_date - CURRENT_DATE))) as days_remaining,
         CASE 
           WHEN g.completed_count >= g.target_frequency THEN true
           WHEN (g.completed_count::float / g.target_frequency) >= 0.8 THEN true
           ELSE false
         END as is_on_track,
         g.is_completed,
         MAX(al.entry_date) as last_completion_date
       FROM activity_goals g
       LEFT JOIN activity_logs al ON g.id = al.goal_id
       WHERE g.user_id = $1
       GROUP BY g.id, g.completed_count, g.target_frequency, g.end_date, g.is_completed
       ORDER BY g.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("GET /goals/progress error:", error);
        res.status(500).json({ error: "Failed to fetch goal progress" });
    }
});

export default router;
