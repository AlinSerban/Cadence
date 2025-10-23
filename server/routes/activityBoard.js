import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { ActivityBoardService } from '../services/ActivityBoardService.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();
const activityBoardService = new ActivityBoardService();

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`[ActivityBoard] ${req.method} ${req.path}`);
    next();
});

// Test endpoint to check if we have any activity cards at all
router.get('/test', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(`[ActivityBoard] Testing database connection for user ${userId}`);

    // Use the service to get recent cards
    const recentCards = await activityBoardService.cardRepository.findByUserId(userId, { limit: 5 });
    const totalCards = await activityBoardService.cardRepository.countByUserId(userId);

    console.log(`[ActivityBoard] User ${userId} has ${totalCards} total cards`);
    console.log(`[ActivityBoard] Recent cards:`, recentCards);

    // Detailed logging of the last 5 cards
    console.log(`\n🔍 DETAILED DATABASE CHECK - Last 5 Cards:`);
    recentCards.forEach((card, index) => {
        console.log(`\n${index + 1}. Card ID: ${card.id}`);
        console.log(`   Name: ${card.name}`);
        console.log(`   Status: ${card.status}`);
        console.log(`   Date: ${card.date}`);
        console.log(`   XP Value: ${card.xp_value}`);
        console.log(`   Created: ${card.created_at}`);
        console.log(`   Completed: ${card.completed_at || 'Not completed'}`);
    });

    res.json({
        totalCards,
        recentCards
    });
}));

// Get historical board data for analytics
router.get('/history/:days', authMiddleware, asyncHandler(async (req, res) => {
    const { days } = req.params;
    const userId = req.user.id;
    const dayCount = parseInt(days) || 30;

    if (dayCount < 1 || dayCount > 365) {
        throw new AppError('Invalid days parameter. Must be between 1 and 365', 400);
    }

    console.log(`[ActivityBoard] Fetching historical data for user ${userId}, ${dayCount} days`);

    const data = await activityBoardService.getBoardHistory(userId, dayCount);
    res.json(data);
}));

// Get all cards and columns for a specific date
router.get('/:date', authMiddleware, asyncHandler(async (req, res) => {
    const { date } = req.params;
    const userId = req.user.id;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    const data = await activityBoardService.getBoardData(userId, date);
    console.log('teeest', data)
    res.json(data);
}));

// Create a new activity card
router.post('/cards', authMiddleware, asyncHandler(async (req, res) => {
    const cardData = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!cardData.name || !cardData.date) {
        throw new AppError('Name and date are required', 400);
    }
    const result = await activityBoardService.createCard(userId, cardData);
    res.status(201).json(result);
}));

// Update an activity card
router.put('/cards/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    // Validate card ID format
    if (!id || isNaN(parseInt(id))) {
        throw new AppError('Invalid card ID', 400);
    }

    const result = await activityBoardService.updateCard(userId, id, updates);
    res.json(result);
}));

// Delete an activity card
router.delete('/cards/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate card ID format
    if (!id || isNaN(parseInt(id))) {
        throw new AppError('Invalid card ID', 400);
    }

    const result = await activityBoardService.deleteCard(userId, id);
    res.json(result);
}));

// Create a new column
router.post('/columns', authMiddleware, asyncHandler(async (req, res) => {
    const columnData = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!columnData.name || !columnData.date) {
        throw new AppError('Name and date are required', 400);
    }

    const result = await activityBoardService.createColumn(userId, columnData);
    res.status(201).json(result);
}));

// Update a column
router.put('/columns/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.id;

    // Validate column ID format
    if (!id || isNaN(parseInt(id))) {
        throw new AppError('Invalid column ID', 400);
    }

    // Validate required fields
    if (!name && !color) {
        throw new AppError('At least one field (name or color) must be provided', 400);
    }

    const updates = {};
    if (name) updates.name = name;
    if (color) updates.color = color;

    const result = await activityBoardService.columnRepository.update(id, updates, userId);

    if (!result) {
        throw new AppError('Column not found', 404);
    }

    res.json(result);
}));

// Delete a column
router.delete('/columns/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate column ID format
    if (!id || isNaN(parseInt(id))) {
        throw new AppError('Invalid column ID', 400);
    }

    const result = await activityBoardService.deleteColumn(userId, id);
    res.json(result);
}));

export default router;
