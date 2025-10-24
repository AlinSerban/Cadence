import { useState } from 'react';
import { useGetBoardHistoryQuery } from '../../store/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export function ActivityHeatmap() {
    const [weekOffset, setWeekOffset] = useState(0);
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: boardData, isLoading } = useGetBoardHistoryQuery(30, {
        skip: !user
    });

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    const cards = boardData?.cards || [];
    const heatmapData = generateHeatmapData(cards, weekOffset);

    const getIntensityColor = (count: number, max: number) => {
        if (count === 0) return 'bg-gray-100';
        const intensity = count / max;
        if (intensity <= 0.25) return 'bg-green-200';
        if (intensity <= 0.5) return 'bg-green-300';
        if (intensity <= 0.75) return 'bg-green-400';
        return 'bg-green-500';
    };

    const getTextColor = (count: number) => {
        return count === 0 ? 'text-gray-400' : 'text-white';
    };

    const maxCount = Math.max(...heatmapData.flat().map(day => day.count));

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header with week navigation */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activity Heatmap</h3>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setWeekOffset(weekOffset + 1)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Previous week"
                    >
                        ←
                    </button>
                    <span className="text-sm text-gray-600 min-w-[120px] text-center">
                        {getWeekLabel(weekOffset)}
                    </span>
                    <button
                        onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Next week"
                        disabled={weekOffset === 0}
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Heatmap */}
            <div className="space-y-2">
                {/* Day labels */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="text-xs text-gray-500 text-center font-medium">Time</div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs text-gray-500 text-center font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Hour rows */}
                {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="grid grid-cols-8 gap-1">
                        <div className="text-xs text-gray-500 text-right pr-2 flex items-center justify-end">
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                        {heatmapData[hour].map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={`
                                    w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium
                                    ${getIntensityColor(day.count, maxCount)}
                                    ${getTextColor(day.count)}
                                    transition-all duration-200 hover:scale-110 cursor-pointer
                                `}
                                title={`${day.date}: ${day.count} activities`}
                            >
                                {day.count > 0 ? day.count : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Less</span>
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    </div>
                    <span className="text-sm text-gray-500">More</span>
                </div>

                {/* Week summary */}
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{heatmapData.flat().reduce((sum, day) => sum + day.count, 0)}</span> activities this week
                </div>
            </div>
        </div>
    );
}

function generateHeatmapData(cards: any[], weekOffset: number) {
    const heatmap: Array<Array<{ count: number; date: string }>> = [];

    // Initialize 24x7 grid
    for (let hour = 0; hour < 24; hour++) {
        heatmap[hour] = [];
        for (let day = 0; day < 7; day++) {
            heatmap[hour][day] = { count: 0, date: '' };
        }
    }

    // Calculate the start of the target week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 - (weekOffset * 7)); // Monday

    // Process cards for the target week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + dayOffset);
        // Use local date instead of UTC
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Handle both date formats (ISO strings and date-only)
        const dayCards = cards.filter(card => {
            // Handle both ISO datetime strings and date-only strings
            let cardDate;
            if (typeof card.date === 'string') {
                if (card.date.includes('T')) {
                    // ISO datetime string like '2025-10-14T21:00:00.000Z'
                    cardDate = card.date.split('T')[0];
                } else {
                    // Date-only string like '2025-10-14'
                    cardDate = card.date;
                }
            } else {
                // Date object
                cardDate = card.date.toISOString().split('T')[0];
            }
            return cardDate === dateStr && card.status === 'done';
        });


        // Use actual completion times instead of random simulation
        dayCards.forEach((card) => {
            if (card.completed_at) {
                // Parse the completed_at timestamp
                const completedAt = new Date(card.completed_at);

                // Get the hour in local timezone
                const hour = completedAt.getHours();


                if (hour >= 0 && hour < 24) {
                    heatmap[hour][dayOffset].count++;
                    heatmap[hour][dayOffset].date = dateStr;
                }
            } else {
                // Fallback: if no completed_at timestamp, use a default time
                const fallbackHour = 12; // Default to noon
                heatmap[fallbackHour][dayOffset].count++;
                heatmap[fallbackHour][dayOffset].date = dateStr;
            }
        });
    }

    return heatmap;
}

function getWeekLabel(weekOffset: number): string {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 - (weekOffset * 7));

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (weekOffset === 0) {
        return 'This Week';
    } else if (weekOffset === 1) {
        return 'Last Week';
    } else {
        return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    }
}
