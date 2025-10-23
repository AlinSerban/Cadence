import { useState } from 'react';
import type { Goal, GoalProgress } from '../../types/goals';
import { CreateGoal } from './CreateGoal';

export function GoalList() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mock data for now - will be replaced with API calls
    const goals: Goal[] = [
        {
            id: '1',
            user_id: '1',
            activity_id: '1',
            goal_type: 'weekly',
            target_frequency: 5,
            target_duration: 60,
            start_date: '2024-01-01',
            end_date: '2024-01-07',
            is_completed: false,
            completed_count: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: {
                id: '1',
                name: 'Coding',
                icon: '💻',
                color: '#3B82F6'
            }
        },
        {
            id: '2',
            user_id: '1',
            activity_id: '2',
            goal_type: 'daily',
            target_frequency: 1,
            target_duration: 30,
            start_date: '2024-01-01',
            end_date: '2024-01-31',
            is_completed: false,
            completed_count: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: {
                id: '2',
                name: 'Reading',
                icon: '📚',
                color: '#10B981'
            }
        }
    ];

    const getGoalProgress = (goal: Goal): GoalProgress => {
        const progressPercentage = Math.round((goal.completed_count / goal.target_frequency) * 100);
        const daysRemaining = Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

        return {
            goal_id: goal.id,
            completed_count: goal.completed_count,
            target_frequency: goal.target_frequency,
            progress_percentage: progressPercentage,
            days_remaining: daysRemaining,
            is_on_track: progressPercentage >= 80,
            is_completed: progressPercentage >= 100,
            streak: 5, // This would come from API
            last_completion_date: '2024-01-15' // This would come from API
        };
    };

    const getGoalStatusColor = (progress: GoalProgress) => {
        if (progress.is_completed) return 'text-green-600';
        if (progress.is_on_track) return 'text-blue-600';
        if (progress.progress_percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getGoalStatusText = (progress: GoalProgress) => {
        if (progress.is_completed) return 'Completed!';
        if (progress.is_on_track) return 'On Track';
        if (progress.progress_percentage >= 50) return 'In Progress';
        return 'Needs Attention';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Goals</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Create Goal
                </button>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {goals.map(goal => {
                    const progress = getGoalProgress(goal);
                    return (
                        <div key={goal.id} className="bg-white rounded-lg p-6 shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{goal.activity?.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{goal.activity?.name}</h3>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {goal.goal_type} goal • {goal.target_frequency} times
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-medium ${getGoalStatusColor(progress)}`}>
                                        {getGoalStatusText(progress)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {progress.days_remaining} days left
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{progress.completed_count}/{goal.target_frequency}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${progress.is_completed ? 'bg-green-500' :
                                            progress.is_on_track ? 'bg-blue-500' :
                                                progress.progress_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.min(progress.progress_percentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Goal Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-500">Target Duration</div>
                                    <div className="font-medium">{goal.target_duration} min/session</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Streak</div>
                                    <div className="font-medium">{progress.streak} days</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors">
                                    Log Progress
                                </button>
                                <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                                    Edit
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {goals.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No goals yet</h3>
                    <p className="text-gray-500 mb-6">Create your first goal to start tracking your progress!</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Create Your First Goal
                    </button>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateGoal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
