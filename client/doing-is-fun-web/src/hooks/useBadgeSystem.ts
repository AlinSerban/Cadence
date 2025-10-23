import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Badge } from '../types/activityBoard';

export function useBadgeSystem() {
    const [recentlyUnlocked, setRecentlyUnlocked] = useState<Badge[]>([]);
    const badges = useSelector((state: RootState) => state.badge.unlocked || []);
    const isLoading = false; // BadgeState doesn't have isLoading

    const getBadgeById = useCallback((badgeId: string) => {
        return badges.find((badge: Badge) => badge.id.toString() === badgeId);
    }, [badges]);

    const getBadgesByCategory = useCallback((category: string) => {
        return badges.filter((badge: Badge) => (badge as any).category === category);
    }, [badges]);

    const getUnlockedBadges = useCallback(() => {
        return badges.filter((badge: Badge) => (badge as any).unlocked);
    }, [badges]);

    const getLockedBadges = useCallback(() => {
        return badges.filter((badge: Badge) => !(badge as any).unlocked);
    }, [badges]);

    const getBadgeProgress = useCallback((badgeId: string) => {
        const badge = getBadgeById(badgeId);
        if (!badge) return { progress: 0, total: 0, percentage: 0 };

        const progress = (badge as any).progress || 0;
        const total = (badge as any).requirement || 1;
        const percentage = Math.min((progress / total) * 100, 100);

        return { progress, total, percentage };
    }, [getBadgeById]);

    const getRarityCount = useCallback(() => {
        const rarityCount = {
            common: 0,
            rare: 0,
            epic: 0,
            legendary: 0
        };

        badges.forEach((badge: Badge) => {
            const rarity = (badge as any).rarity;
            if (rarity && rarityCount[rarity as keyof typeof rarityCount] !== undefined) {
                rarityCount[rarity as keyof typeof rarityCount]++;
            }
        });

        return rarityCount;
    }, [badges]);

    const getUnlockedRarityCount = useCallback(() => {
        const unlockedBadges = getUnlockedBadges();
        const rarityCount = {
            common: 0,
            rare: 0,
            epic: 0,
            legendary: 0
        };

        unlockedBadges.forEach((badge: Badge) => {
            const rarity = (badge as any).rarity;
            if (rarity && rarityCount[rarity as keyof typeof rarityCount] !== undefined) {
                rarityCount[rarity as keyof typeof rarityCount]++;
            }
        });

        return rarityCount;
    }, [getUnlockedBadges]);

    const getBadgeStats = useCallback(() => {
        const total = badges.length;
        const unlocked = getUnlockedBadges().length;
        const locked = getLockedBadges().length;
        const completionPercentage = total > 0 ? (unlocked / total) * 100 : 0;

        return {
            total,
            unlocked,
            locked,
            completionPercentage: Math.round(completionPercentage)
        };
    }, [badges, getUnlockedBadges, getLockedBadges]);

    const addRecentlyUnlocked = useCallback((newBadges: Badge[]) => {
        setRecentlyUnlocked(prev => [...prev, ...newBadges]);

        // Clear after 5 seconds
        setTimeout(() => {
            setRecentlyUnlocked(prev => prev.filter(badge =>
                !newBadges.some(newBadge => newBadge.id === badge.id)
            ));
        }, 5000);
    }, []);

    const clearRecentlyUnlocked = useCallback(() => {
        setRecentlyUnlocked([]);
    }, []);

    // Auto-clear recently unlocked badges after component unmount
    useEffect(() => {
        return () => {
            setRecentlyUnlocked([]);
        };
    }, []);

    return {
        // State
        badges,
        recentlyUnlocked,
        isLoading,

        // Getters
        getBadgeById,
        getBadgesByCategory,
        getUnlockedBadges,
        getLockedBadges,
        getBadgeProgress,
        getRarityCount,
        getUnlockedRarityCount,
        getBadgeStats,

        // Actions
        addRecentlyUnlocked,
        clearRecentlyUnlocked,
    };
}
