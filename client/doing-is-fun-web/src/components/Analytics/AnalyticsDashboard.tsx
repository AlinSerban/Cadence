import { useState } from 'react';
import { StatsCards } from './StatsCards.tsx';
import { XPProgressChart } from './XPProgressChart.tsx';
import { CategoryCharts } from './CategoryCharts.tsx';
import { ActivityHeatmap } from './ActivityHeatmap.tsx';

export function AnalyticsDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'categories' | 'patterns'>('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'progress', label: 'XP Progress', icon: '📈' },
        { id: 'categories', label: 'Categories', icon: '🏷️' },
        { id: 'patterns', label: 'Patterns', icon: '🗓️' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Track your progress and discover insights about your activity patterns</p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <StatsCards />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <XPProgressChart />
                            <CategoryCharts />
                        </div>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="space-y-6">
                        <XPProgressChart />
                        <StatsCards />
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <CategoryCharts />
                        <StatsCards />
                    </div>
                )}

                {activeTab === 'patterns' && (
                    <div className="space-y-6">
                        <ActivityHeatmap />
                        <StatsCards />
                    </div>
                )}
            </div>
        </div>
    );
}
