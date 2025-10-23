import { useState } from 'react';
import type { CustomActivity, UpdateActivityRequest } from '../../types/customActivities';

interface EditActivityProps {
    activity: CustomActivity;
    onClose: () => void;
}

const ICON_OPTIONS = [
    '💻', '📚', '💪', '🎨', '🎵', '🎮', '🧘', '🏃', '🚴', '🏊',
    '🎯', '📝', '🔬', '🎭', '📷', '🍳', '🌱', '🎪', '🏠', '🚀'
];

const COLOR_OPTIONS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const CATEGORY_OPTIONS = [
    'work', 'learning', 'health', 'creative', 'social', 'hobby', 'other'
];

export function EditActivity({ activity, onClose }: EditActivityProps) {
    const [formData, setFormData] = useState<UpdateActivityRequest>({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        color: activity.color,
        icon: activity.icon,
        category: activity.category,
        target_duration: activity.target_duration,
        is_active: activity.is_active
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Replace with actual API call

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onClose();
        } catch (error) {
            console.error('Failed to update activity:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof UpdateActivityRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Activity</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Activity Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activity Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Coding, Reading, Exercise"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe what this activity involves..."
                            rows={3}
                        />
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon
                        </label>
                        <div className="grid grid-cols-10 gap-2">
                            {ICON_OPTIONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => handleChange('icon', icon)}
                                    className={`
                    w-10 h-10 text-2xl rounded-lg border-2 transition-all
                    ${formData.icon === icon
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                  `}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {COLOR_OPTIONS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleChange('color', color)}
                                    className={`
                    w-10 h-10 rounded-lg border-2 transition-all
                    ${formData.color === color
                                            ? 'border-gray-800 scale-110'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                  `}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {CATEGORY_OPTIONS.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Target Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Duration (minutes)
                        </label>
                        <input
                            type="number"
                            value={formData.target_duration || ''}
                            onChange={(e) => handleChange('target_duration', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional target duration"
                            min="1"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                            Activity is active
                        </label>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                        <div
                            className="flex items-center space-x-3 p-3 rounded-lg"
                            style={{ borderLeft: `4px solid ${formData.color}` }}
                        >
                            <span className="text-2xl">{formData.icon}</span>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    {formData.name || 'Activity Name'}
                                </div>
                                <div className="text-sm text-gray-600 capitalize">
                                    {formData.category}
                                </div>
                            </div>
                        </div>
                    </div>

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
                            disabled={!formData.name || isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
