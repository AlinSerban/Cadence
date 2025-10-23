import { useState } from 'react';
import { useGetBoardHistoryQuery } from '../../store/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { LineChart } from './LineChart';

export function XPProgressChart() {
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
    const { current: xp } = useSelector((state: RootState) => state.xp);
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const { data: boardData, isLoading } = useGetBoardHistoryQuery(days);


    const handleDateRangeChange = (newRange: '7d' | '30d' | '90d') => {
        setDateRange(newRange);
    };

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
    const xpData = generateXPData(cards, dateRange);

    const data = {
        labels: xpData.labels,
        datasets: [
            {
                label: 'XP Gained',
                data: xpData.values,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'XP Progress Over Time',
                font: {
                    size: 18,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return `XP: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6B7280'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    color: '#6B7280',
                    callback: function (value: any) {
                        return value + ' XP';
                    }
                }
            }
        },
        elements: {
            point: {
                hoverBackgroundColor: 'rgb(59, 130, 246)'
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header with date range selector */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">XP Progress</h3>
                <div className="flex space-x-2">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => handleDateRangeChange(range)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${dateRange === range
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <LineChart
                    data={data}
                    options={options}
                />
            </div>

            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{xp}</p>
                    <p className="text-sm text-gray-500">Total XP</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{xpData.avgDaily}</p>
                    <p className="text-sm text-gray-500">Avg Daily</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{xpData.bestDay}</p>
                    <p className="text-sm text-gray-500">Best Day</p>
                </div>
            </div>
        </div>
    );
}

function generateXPData(cards: any[], range: '7d' | '30d' | '90d') {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const labels: string[] = [];
    const values: number[] = [];



    // Generate date range - start from today and go back
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Use local date instead of UTC to match your timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        labels.unshift(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Calculate XP for this day - handle both date formats
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
        const dayXP = dayCards.reduce((sum, card) => sum + (card.xp_value || 10), 0);



        values.unshift(dayXP);
    }

    const totalXP = values.reduce((sum, val) => sum + val, 0);
    const avgDaily = Math.round(totalXP / days);
    const bestDay = Math.max(...values, 0);


    return { labels, values, totalXP, avgDaily, bestDay };
}
