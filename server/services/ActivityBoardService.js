import { ActivityCardRepository } from '../repositories/ActivityCardRepository.js';
import { ActivityColumnRepository } from '../repositories/ActivityColumnRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { bumpUserVersion } from '../lib/cache.js';
import { BadgeService } from './BadgeService.js';
import { logger } from '../utils/logger.js';

export class ActivityBoardService {
    constructor() {
        this.cardRepository = new ActivityCardRepository();
        this.columnRepository = new ActivityColumnRepository();
        this.userRepository = new UserRepository();
        this.badgeService = new BadgeService();
        this.logger = logger.child('ActivityBoardService');
    }

    /**
     * Get board data for a specific date
     */
    async getBoardData(userId, date) {
        try {
            this.logger.debug('Fetching board data', { userId, date });

            const [cards, columns] = await Promise.all([
                this.cardRepository.findByUserAndDate(userId, date),
                this.columnRepository.findByUserAndDate(userId, date)
            ]);

            this.logger.info('Board data fetched successfully', {
                userId,
                date,
                cardsCount: cards.length,
                columnsCount: columns.length
            });

            return {
                cards,
                columns
            };
        } catch (error) {
            this.logger.error('Failed to fetch board data', { userId, date, error: error.message });
            throw new Error('Failed to fetch board data');
        }
    }

    /**
     * Create a new activity card
     */
    async createCard(userId, cardData) {
        try {
            const { name, description, label, date, column_id, xpValue } = cardData;

            console.log(`[ActivityBoardService] Creating card for user ${userId}, date received: ${date}`);

            if (!name || !date) {
                throw new Error('Name and date are required');
            }

            // Ensure the date is stored as a proper date string without timezone conversion
            const dateOnly = date.split('T')[0]; // Extract just the date part (YYYY-MM-DD)
            console.log(`[ActivityBoardService] Storing date as: ${dateOnly}`);

            const cardDataToCreate = {
                user_id: userId,
                name,
                description: description || '',
                label: label || 'other',
                date: dateOnly,
                column_id: column_id || null,
                xp_value: xpValue || 25
            };

            const result = await this.cardRepository.create(cardDataToCreate);

            console.log(`[ActivityBoardService] Card created with date: ${result.date}`);

            // Process the result to convert Date objects to strings
            const processedCard = this.cardRepository.processCards([result])[0];
            // Invalidate cache for board data
            await bumpUserVersion(userId, "board");

            return processedCard;
        } catch (error) {
            console.error('[ActivityBoardService] Error creating card:', error);
            throw new Error('Failed to create card');
        }
    }

    /**
     * Update an activity card
     */
    async updateCard(userId, cardId, updates) {
        try {
            console.log(`[ActivityBoardService] Updating card ${cardId} for user ${userId}`);

            // Get current card data
            const currentCard = await this.cardRepository.findById(cardId, userId);

            if (!currentCard) {
                throw new Error('Card not found');
            }

            const wasCompleted = currentCard.status === 'done';
            const willBeCompleted = updates.status === 'done';

            // Update the card
            const updatedCard = await this.cardRepository.update(cardId, updates, userId);

            if (!updatedCard) {
                throw new Error('Failed to update card');
            }

            // Handle XP changes
            let xpGained = 0;
            let unlockedBadges = [];

            if (!wasCompleted && willBeCompleted) {
                // Card is being marked as done - award XP and check for badges
                const xpToAward = updatedCard.xp_value || 25;
                console.log(`[ActivityBoardService] Awarding ${xpToAward} XP to user ${userId}`);

                const newXP = await this.userRepository.updateXP(userId, xpToAward);
                xpGained = xpToAward;

                // Check for badges when completing a card
                console.log(`[ActivityBoardService] Checking badges for user ${userId}`);
                try {
                    unlockedBadges = await this.badgeService.checkAndAwardBadges(userId, {
                        ...updatedCard,
                        completed_at: updatedCard.completed_at
                    });
                } catch (badgeError) {
                    console.error('[ActivityBoardService] Badge checking failed, continuing without badges:', badgeError);
                    unlockedBadges = [];
                }

            } else if (wasCompleted && !willBeCompleted) {
                // Card is being marked as in progress - remove XP
                const xpToRemove = updatedCard.xp_value || 25;
                console.log(`[ActivityBoardService] Removing ${xpToRemove} XP from user ${userId}`);

                const newXP = await this.userRepository.updateXP(userId, -xpToRemove);
                xpGained = -xpToRemove;
            }

            // Get updated user XP
            const totalXp = await this.userRepository.getXP(userId);

            console.log(`[ActivityBoardService] User ${userId} now has ${totalXp} XP (gained: ${xpGained})`);

            // Process the result to convert Date objects to strings
            const processedCard = this.cardRepository.processCards([updatedCard])[0];

            // Add XP and badge information
            processedCard.xpGained = xpGained;
            processedCard.totalXp = totalXp;
            processedCard.unlockedBadges = unlockedBadges;

            // Invalidate cache for board data and dashboard
            await Promise.all([
                bumpUserVersion(userId, "board"),
                bumpUserVersion(userId, "dash"),
                bumpUserVersion(userId, "badges") // For badge updates
            ]);

            return processedCard;
        } catch (error) {
            console.error('[ActivityBoardService] Error updating card:', error);
            console.error('[ActivityBoardService] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw new Error('Failed to update card');
        }
    }

    /**
     * Delete an activity card
     */
    async deleteCard(userId, cardId) {
        try {
            console.log(`[ActivityBoardService] Deleting card ${cardId} for user ${userId}`);

            const result = await this.cardRepository.delete(cardId, userId);

            if (!result) {
                throw new Error('Card not found');
            }

            // Invalidate cache for board data
            await bumpUserVersion(userId, "board");

            return { success: true };
        } catch (error) {
            console.error('[ActivityBoardService] Error deleting card:', error);
            throw new Error('Failed to delete card');
        }
    }

    /**
     * Create a new column
     */
    async createColumn(userId, columnData) {
        try {
            const { name, color, date } = columnData;

            console.log(`[ActivityBoardService] Creating column for user ${userId}, date: ${date}`);

            if (!name || !date) {
                throw new Error('Name and date are required');
            }

            const dateOnly = date.split('T')[0];

            const columnDataToCreate = {
                user_id: userId,
                name,
                color: color || '#3B82F6',
                date: dateOnly
            };

            const result = await this.columnRepository.createWithOrder(columnDataToCreate);

            // Process the result to convert Date objects to strings
            const processedColumn = this.columnRepository.processColumns([result])[0];

            // Invalidate cache for board data
            await bumpUserVersion(userId, "board");

            return processedColumn;
        } catch (error) {
            console.error('[ActivityBoardService] Error creating column:', error);
            throw new Error('Failed to create column');
        }
    }

    /**
     * Delete a column
     */
    async deleteColumn(userId, columnId) {
        try {
            console.log(`[ActivityBoardService] Deleting column ${columnId} for user ${userId}`);

            const result = await this.columnRepository.deleteAndMoveCards(columnId, userId);

            if (!result) {
                throw new Error('Column not found');
            }

            // Invalidate cache for board data
            await bumpUserVersion(userId, "board");

            return { success: true };
        } catch (error) {
            console.error('[ActivityBoardService] Error deleting column:', error);
            throw new Error('Failed to delete column');
        }
    }

    /**
     * Get board history for analytics
     */
    async getBoardHistory(userId, days = 7) {
        try {
            console.log(`[ActivityBoardService] Fetching board history for user ${userId}, days: ${days}`);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = new Date().toISOString().split('T')[0];

            const cards = await this.cardRepository.findByUserAndDateRange(userId, startDateStr, endDateStr);

            console.log(`[ActivityBoardService] Found ${cards.length} cards in history`);

            return {
                cards
            };
        } catch (error) {
            console.error('[ActivityBoardService] Error fetching board history:', error);
            throw new Error('Failed to fetch board history');
        }
    }
}
