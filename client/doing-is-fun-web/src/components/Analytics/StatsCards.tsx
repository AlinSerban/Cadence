import { useGetBoardDataQuery, useGetBoardHistoryQuery } from '../../store/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export function StatsCards() {
    const user = useSelector((state: RootState) => state.auth.user);
    
    const today = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();
    const { data: boardData, isLoading } = useGetBoardDataQuery(today, {
        skip: !user
    });
    const { data: historyData, isLoading: historyLoading } = useGetBoardHistoryQuery(30, {
        skip: !user
    });
    const { level, current: xp } = useSelector((state: RootState) => state.xp);

    if (isLoading || historyLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = boardData?.cards || [];
    const historyCards = historyData?.cards || [];
    // today is already calculated above


    // Calculate stats
    const todayCompleted = cards.filter(card =>
        card.date === today && card.status === 'done'
    ).length;

    const todayTotal = cards.filter(card => card.date === today).length;

    const weeklyCompleted = historyCards.filter(card => {
        const cardDate = new Date(card.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return cardDate >= weekAgo && card.status === 'done';
    }).length;

    const currentStreak = calculateStreak(historyCards);
    const completionRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today's Completion */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {todayCompleted}/{todayTotal}
                        </p>
                        <p className="text-sm text-gray-500">{completionRate}% complete</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                        <span className="text-2xl">✅</span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Weekly Total */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">This Week</p>
                        <p className="text-2xl font-bold text-gray-900">{weeklyCompleted}</p>
                        <p className="text-sm text-gray-500">activities completed</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                        <span className="text-2xl">📅</span>
                    </div>
                </div>
            </div>

            {/* Current Streak */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Current Streak</p>
                        <p className="text-2xl font-bold text-gray-900">{currentStreak}</p>
                        <p className="text-sm text-gray-500">days in a row</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                        <span className="text-2xl">🔥</span>
                    </div>
                </div>
            </div>

            {/* Current Level */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Current Level</p>
                        <p className="text-2xl font-bold text-gray-900">Level {level}</p>
                        <p className="text-sm text-gray-500">{xp} XP total</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                        <span className="text-2xl">⭐</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function calculateStreak(cards: any[]): number {
    const completedDates = new Set(
        cards
            .filter(card => card.status === 'done')
            .map(card => card.date)
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (completedDates.has(dateStr)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
