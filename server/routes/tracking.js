import express from "express";
import { pool } from "../db/db.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { readThroughJSON, bumpUserVersion } from "../lib/cache.js";

const router = express.Router();

async function awardXp(userId) {
  const XP_GAIN = 10;
  await pool.query(
    `UPDATE users
       SET xp = xp + $1
       WHERE id = $2`,
    [XP_GAIN, userId]
  );
  return XP_GAIN;
}

async function awardFirst5LogsBadge(userId) {
  const countRes = await pool.query(
    `SELECT (
       (SELECT COUNT(*) FROM workouts WHERE user_id=$1)
       + (SELECT COUNT(*) FROM nutrition WHERE user_id=$1)
       + (SELECT COUNT(*) FROM activities WHERE user_id=$1)
     ) as total_logs`,
    [userId]
  );
  const totalLogs = Number(countRes.rows[0].total_logs);
  const unlocked = [];

  if (totalLogs >= 5) {
    const badgeRes = await pool.query(
      `SELECT id, name, description, icon_url FROM badges WHERE key = 'first_5_logs'`
    );
    const badge = badgeRes.rows[0];
    if (badge) {
      const insertRes = await pool.query(
        `INSERT INTO user_badges (user_id, badge_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING badge_id`,
        [userId, badge.id]
      );
      if (insertRes.rowCount > 0) {
        unlocked.push({
          id: badge.id,
          key: "first_5_logs",
          name: badge.name,
          description: badge.description,
          icon_url: badge.icon_url,
        });
      }
    }
  }

  return unlocked;
}

async function awardXpAndBadges(userId) {
  const xpGained = await awardXp(userId);
  const totalXpRes = await pool.query(`SELECT xp FROM users WHERE id = $1`, [
    userId,
  ]);
  const totalXp = totalXpRes.rows[0].xp;
  const unlockedBadges = await awardFirst5LogsBadge(userId);
  return { xpGained, totalXp, unlockedBadges };
}

async function computeDashboardSummaryToday(userId) {
  // Run queries in parallel for speed
  const [activitiesRes, goalsRes, xpRes, streakRes] = await Promise.all([
    pool.query(
      `SELECT 
         COALESCE(SUM(al.duration), 0) AS total_duration,
         COUNT(*) AS activity_count
       FROM activity_logs al
       WHERE al.user_id = $1 AND al.entry_date = CURRENT_DATE`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(*) AS completed_goals
       FROM activity_goals ag
       WHERE ag.user_id = $1 AND ag.is_completed = true`,
      [userId]
    ),
    pool.query(`SELECT xp FROM users WHERE id = $1`, [userId]),
    pool.query(
      `SELECT COUNT(*) AS streak
       FROM (
         SELECT DISTINCT entry_date
         FROM activity_logs
         WHERE user_id = $1 AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY entry_date DESC
         LIMIT 30
       ) recent_activities`,
      [userId]
    ),
  ]);

  const activitiesMinutes = Number(activitiesRes.rows[0].total_duration);
  const activitiesCount = Number(activitiesRes.rows[0].activity_count);
  const goalsCompleted = Number(goalsRes.rows[0].completed_goals);
  const streak = Number(streakRes.rows[0].streak);
  const totalXp = Number(xpRes.rows[0].xp);

  return {
    xp: totalXp,
    today: {
      activitiesMinutes,
      activitiesCount,
      goalsCompleted,
      streak,
    },
  };
}

// GET - Activities summary
router.get("/activities/summary", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(al.duration), 0) as total 
       FROM activity_logs al
       WHERE al.user_id = $1 AND al.entry_date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    const mostFrequentResult = await pool.query(
      `SELECT ca.name, COUNT(*) as count 
       FROM activity_logs al
       JOIN custom_activities ca ON al.activity_id = ca.id
       WHERE al.user_id = $1 
       GROUP BY ca.name 
       ORDER BY COUNT(*) DESC 
       LIMIT 1`,
      [userId]
    );

    res.json({
      totalMinutes: totalResult.rows[0].total,
      mostFrequentActivity: mostFrequentResult.rows[0]?.name || "N/A",
    });
  } catch (err) {
    console.error("GET /activities/summary error:", err);
    res.status(500).json({ error: "Failed to fetch activities summary" });
  }
});

router.get("/activities/history", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const data = await readThroughJSON({
      userId,
      domain: "series-30d",
      scope: "activities",
      versionField: "activities",
      ttlBaseSeconds: 90,
      computeFn: async () => {
        const result = await pool.query(
          `SELECT DATE(al.entry_timestamp) AS entry_date, SUM(al.duration) AS total_duration
           FROM activity_logs al
           WHERE al.user_id = $1 AND al.entry_timestamp >= NOW() - INTERVAL '30 days'
           GROUP BY DATE(al.entry_timestamp)
           ORDER BY DATE(al.entry_timestamp)`,
          [userId]
        );
        return result.rows;
      },
    });
    res.json(data);
  } catch (err) {
    console.error("GET /activities/history error:", err);
    res.status(500).json({ error: "Failed to fetch activity history" });
  }
});

router.get("/summary/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId)
      return res.status(401).json({ ok: false, error: "Unauthorized" });

    const data = await readThroughJSON({
      userId,
      domain: "dash-summary",
      scope: "today",
      versionField: "dash",
      ttlBaseSeconds: 20,
      computeFn: () => computeDashboardSummaryToday(userId, req),
    });
    res.json(data);
  } catch (err) {
    console.error("GET /summary/today error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// POST - Legacy activity logging (for backward compatibility)
router.post("/activities", authMiddleware, async (req, res) => {
  const { activity_type, duration, entry_date } = req.body;

  try {
    // For legacy support, create a temporary activity if it doesn't exist
    let activityResult = await pool.query(
      `SELECT id FROM custom_activities WHERE name = $1 AND user_id = $2`,
      [activity_type, req.user.id]
    );

    let activityId;
    if (activityResult.rowCount === 0) {
      // Create a temporary activity
      const newActivity = await pool.query(
        `INSERT INTO custom_activities (user_id, name, description, color, icon, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [req.user.id, activity_type, `Temporary activity: ${activity_type}`, '#6B7280', '📝', 'other']
      );
      activityId = newActivity.rows[0].id;
    } else {
      activityId = activityResult.rows[0].id;
    }

    // Insert activity log
    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_id, duration, entry_date)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, activityId, duration, entry_date]
    );

    const { xpGained, totalXp, unlockedBadges } = await awardXpAndBadges(req.user.id);

    // Bump cache versions
    await Promise.all([
      bumpUserVersion(req.user.id, "activities"),
      bumpUserVersion(req.user.id, "dash"),
    ]);

    res.status(201).json({
      message: "Logged successfully!",
      xpGained,
      totalXp,
      unlockedBadges,
    });
  } catch (error) {
    console.error("POST /activities error:", error);
    res.status(500).json({ error: "Failed to log activity." });
  }
});

export default router;
