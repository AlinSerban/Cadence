import { useState } from 'react';
import type { CustomActivity } from '../../types/customActivities';
import { CreateActivity } from './CreateActivity';
import { EditActivity } from './EditActivity';
import { QuickLog } from './QuickLog';

export function ActivityList() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState<CustomActivity | null>(null);
    const [loggingActivity, setLoggingActivity] = useState<CustomActivity | null>(null);

    // Mock data for now - will be replaced with API calls
    const activities: CustomActivity[] = [
        {
            id: '1',
            name: 'Coding',
            description: 'Focused coding sessions',
            color: '#3B82F6',
            icon: '💻',
            created_at: new Date().toISOString(),
            is_active: true,
            user_id: '1',
            category: 'work',
            target_duration: 60
        },
        {
            id: '2',
            name: 'Reading',
            description: 'Reading books or articles',
            color: '#10B981',
            icon: '📚',
            created_at: new Date().toISOString(),
            is_active: true,
            user_id: '1',
            category: 'learning',
            target_duration: 30
        },
        {
            id: '3',
            name: 'Exercise',
            description: 'Physical exercise and workouts',
            color: '#F59E0B',
            icon: '💪',
            created_at: new Date().toISOString(),
            is_active: true,
            user_id: '1',
            category: 'health',
            target_duration: 45
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Activities</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Activity
                </button>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map(activity => (
                    <div
                        key={activity.id}
                        className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                        style={{ borderLeft: `4px solid ${activity.color}` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{activity.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{activity.name}</h3>
                                    <p className="text-sm text-gray-600">{activity.category}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingActivity(activity)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    title="Edit activity"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setLoggingActivity(activity)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    title="Quick log"
                                >
                                    ⏱️
                                </button>
                            </div>
                        </div>

                        {activity.description && (
                            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                        )}

                        {activity.target_duration && (
                            <div className="text-xs text-gray-500 mb-3">
                                Target: {activity.target_duration} min
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setLoggingActivity(activity)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                            >
                                Log Time
                            </button>
                            <button
                                onClick={() => setEditingActivity(activity)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No activities yet</h3>
                    <p className="text-gray-500 mb-6">Create your first custom activity to start tracking your progress!</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Create Your First Activity
                    </button>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateActivity onClose={() => setShowCreateModal(false)} />
            )}

            {editingActivity && (
                <EditActivity
                    activity={editingActivity}
                    onClose={() => setEditingActivity(null)}
                />
            )}

            {loggingActivity && (
                <QuickLog
                    activity={loggingActivity}
                    onClose={() => setLoggingActivity(null)}
                />
            )}
        </div>
    );
}
