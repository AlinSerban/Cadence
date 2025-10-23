import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addXp, setXp, levelUp } from '../store/slices/xpSlice';
import { getXpProgress } from '../utils/leveling';

export function useXPManagement() {
    const dispatch = useDispatch();
    const { current: xp, level, justLeveled } = useSelector((state: RootState) => state.xp);
    const { level: calculatedLevel, progress, xpToNext } = getXpProgress(xp);

    const awardXP = useCallback((amount: number) => {
        const prevLevel = level;
        dispatch(addXp(amount));

        // Check if leveled up
        const newLevel = Math.max(1, Math.floor((xp + amount) / 50) + 1);
        if (newLevel > prevLevel) {
            dispatch(levelUp());
        }
    }, [dispatch, xp, level]);

    const setUserXP = useCallback((newXp: number) => {
        dispatch(setXp(newXp));
    }, [dispatch]);

    const getLevelInfo = useCallback(() => {
        return {
            currentLevel: calculatedLevel,
            progress,
            xpToNext,
            totalXP: xp,
            justLeveled
        };
    }, [calculatedLevel, progress, xpToNext, xp, justLeveled]);

    const getXPForLevel = useCallback((targetLevel: number) => {
        return (targetLevel - 1) * 50;
    }, []);

    const getLevelFromXP = useCallback((xpAmount: number) => {
        return Math.max(1, Math.floor(xpAmount / 50) + 1);
    }, []);

    const isLevelUp = useCallback((newXP: number) => {
        const newLevel = getLevelFromXP(newXP);
        return newLevel > level;
    }, [level, getLevelFromXP]);

    return {
        // State
        xp,
        level: calculatedLevel,
        progress,
        xpToNext,
        justLeveled,

        // Actions
        awardXP,
        setUserXP,

        // Utilities
        getLevelInfo,
        getXPForLevel,
        getLevelFromXP,
        isLevelUp,
    };
}
