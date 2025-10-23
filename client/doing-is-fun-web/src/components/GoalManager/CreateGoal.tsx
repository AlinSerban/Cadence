import { useState } from 'react';
import type { CreateGoalRequest } from '../../types/goals';
import type { CustomActivity } from '../../types/customActivities';

interface CreateGoalProps {
    onClose: () => void;
}

export function CreateGoal({ onClose }: CreateGoalProps) {
    const [formData, setFormData] = useState<CreateGoalRequest>({
        activity_id: '',
        goal_type: 'weekly',
        target_frequency: 1,
        target_duration: undefined,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock activities - will be replaced with API call
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Replace with actual API call

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onClose();
        } catch (error) {
            console.error('Failed to create goal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof CreateGoalRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGoalTypeChange = (goalType: 'daily' | 'weekly' | 'monthly') => {
        const today = new Date();
        let endDate: Date;

        switch (goalType) {
            case 'daily':
                endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
                break;
            case 'weekly':
                endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                break;
            case 'monthly':
                endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
                break;
        }

        setFormData(prev => ({
            ...prev,
            goal_type: goalType,
            end_date: endDate.toISOString().split('T')[0]
        }));
    };

    const selectedActivity = activities.find(a => a.id === formData.activity_id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Activity Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activity *
                        </label>
                        <select
                            value={formData.activity_id}
                            onChange={(e) => handleChange('activity_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select an activity</option>
                            {activities.map(activity => (
                                <option key={activity.id} value={activity.id}>
                                    {activity.icon} {activity.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Goal Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Goal Type *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['daily', 'weekly', 'monthly'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleGoalTypeChange(type)}
                                    className={`
                    p-3 rounded-lg border-2 transition-all
                    ${formData.goal_type === type
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                  `}
                                >
                                    <div className="text-sm font-medium capitalize">{type}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Frequency *
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={formData.target_frequency}
                                onChange={(e) => handleChange('target_frequency', parseInt(e.target.value) || 1)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="1"
                                required
                            />
                            <span className="text-sm text-gray-600">
                                times per {formData.goal_type}
                            </span>
                        </div>
                    </div>

                    {/* Target Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Duration (minutes per session)
                        </label>
                        <input
                            type="number"
                            value={formData.target_duration || ''}
                            onChange={(e) => handleChange('target_duration', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional target duration per session"
                            min="1"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date *
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {selectedActivity && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-2">Goal Preview:</div>
                            <div
                                className="flex items-center space-x-3 p-3 rounded-lg"
                                style={{ borderLeft: `4px solid ${selectedActivity.color}` }}
                            >
                                <span className="text-2xl">{selectedActivity.icon}</span>
                                <div>
                                    <div className="font-semibold text-gray-800">{selectedActivity.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {formData.target_frequency} times per {formData.goal_type}
                                        {formData.target_duration && ` • ${formData.target_duration} min/session`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.activity_id || isSubmitting}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
