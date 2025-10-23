import React, { useState, useEffect, useRef } from 'react';
import { useGetBoardHistoryQuery } from '../../store/api';
import { BarChart } from './BarChart';
import { DoughnutChart } from './DoughnutChart';
import { Chart as ChartJS } from 'chart.js';

export function CategoryCharts() {
    const [chartType, setChartType] = useState<'bar' | 'doughnut'>('bar');
    const { data: boardData, isLoading } = useGetBoardHistoryQuery(30);
    const chartRef = useRef<ChartJS<'bar' | 'doughnut'> | null>(null);

    const handleChartTypeChange = (newType: 'bar' | 'doughnut') => {
        // Destroy existing chart before switching
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
        setChartType(newType);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

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
    const categoryData = generateCategoryData(cards);

    const colors = {
        gym: '#EF4444',
        study: '#3B82F6',
        work: '#10B981',
        personal: '#F59E0B',
        other: '#8B5CF6'
    };

    const barData = {
        labels: categoryData.labels,
        datasets: [
            {
                label: 'Completed',
                data: categoryData.completed,
                backgroundColor: categoryData.labels.map(label => colors[label as keyof typeof colors]),
                borderColor: categoryData.labels.map(label => colors[label as keyof typeof colors]),
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'In Progress',
                data: categoryData.inProgress,
                backgroundColor: categoryData.labels.map(label => colors[label as keyof typeof colors] + '40'),
                borderColor: categoryData.labels.map(label => colors[label as keyof typeof colors]),
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
    };

    const doughnutData = {
        labels: categoryData.labels,
        datasets: [
            {
                data: categoryData.completed,
                backgroundColor: categoryData.labels.map(label => colors[label as keyof typeof colors]),
                borderColor: '#fff',
                borderWidth: 2,
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Activities by Category',
                font: {
                    size: 18,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
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
                    stepSize: 1
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                text: 'Completion Distribution',
                font: {
                    size: 18,
                    weight: 'bold' as const
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((context.parsed / total) * 100);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header with chart type selector */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleChartTypeChange('bar')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${chartType === 'bar'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Bar Chart
                    </button>
                    <button
                        onClick={() => handleChartTypeChange('doughnut')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${chartType === 'doughnut'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Pie Chart
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                {chartType === 'bar' ? (
                    <BarChart
                        key="bar-chart"
                        ref={chartRef as React.Ref<ChartJS<'bar'>>}
                        data={barData}
                        options={barOptions}
                    />
                ) : (
                    <DoughnutChart
                        key="doughnut-chart"
                        ref={chartRef as React.Ref<ChartJS<'doughnut'>>}
                        data={doughnutData}
                        options={doughnutOptions}
                    />
                )}
            </div>

            {/* Category stats */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                {categoryData.labels.map((label, index) => {
                    const completed = categoryData.completed[index];
                    const total = completed + categoryData.inProgress[index];
                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                        <div key={label} className="text-center">
                            <div
                                className="w-4 h-4 rounded-full mx-auto mb-2"
                                style={{ backgroundColor: colors[label as keyof typeof colors] }}
                            ></div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{label}</p>
                            <p className="text-lg font-bold text-gray-900">{completed}</p>
                            <p className="text-xs text-gray-500">{rate}% complete</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function generateCategoryData(cards: any[]) {
    const categories = ['gym', 'study', 'work', 'personal', 'other'];
    const completed: number[] = [];
    const inProgress: number[] = [];

    categories.forEach(category => {
        const categoryCards = cards.filter(card => card.label === category);
        completed.push(categoryCards.filter(card => card.status === 'done').length);
        inProgress.push(categoryCards.filter(card => card.status === 'in_progress').length);
    });

    return {
        labels: categories,
        completed,
        inProgress
    };
}
