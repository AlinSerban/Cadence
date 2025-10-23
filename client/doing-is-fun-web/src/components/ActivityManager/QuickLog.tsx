import { useState } from 'react';
import type { CustomActivity, NewActivityLog } from '../../types/customActivities';

interface QuickLogProps {
    activity: CustomActivity;
    onClose: () => void;
}

export function QuickLog({ activity, onClose }: QuickLogProps) {
    const [formData, setFormData] = useState<NewActivityLog>({
        activity_id: activity.id,
        duration: activity.target_duration || 30,
        notes: '',
        entry_date: new Date().toISOString().split('T')[0]
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
            console.error('Failed to log activity:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof NewActivityLog, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const quickDurations = [15, 30, 45, 60, 90, 120];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Log Time</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Activity Info */}
                <div
                    className="flex items-center space-x-3 p-4 rounded-lg mb-6"
                    style={{ borderLeft: `4px solid ${activity.color}` }}
                >
                    <span className="text-3xl">{activity.icon}</span>
                    <div>
                        <h3 className="font-semibold text-gray-800">{activity.name}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (minutes) *
                        </label>
                        <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter duration in minutes"
                            min="1"
                            required
                        />

                        {/* Quick Duration Buttons */}
                        <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-2">Quick select:</div>
                            <div className="flex flex-wrap gap-2">
                                {quickDurations.map(duration => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => handleChange('duration', duration)}
                                        className={`
                      px-3 py-1 text-sm rounded-full border transition-colors
                      ${formData.duration === duration
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        {duration}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.entry_date}
                            onChange={(e) => handleChange('entry_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add any notes about this session..."
                            rows={3}
                        />
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Summary:</div>
                        <div className="text-sm text-gray-600">
                            <div>Activity: <span className="font-medium">{activity.name}</span></div>
                            <div>Duration: <span className="font-medium">{formData.duration} minutes</span></div>
                            <div>Date: <span className="font-medium">{new Date(formData.entry_date).toLocaleDateString()}</span></div>
                            {formData.notes && (
                                <div>Notes: <span className="font-medium">{formData.notes}</span></div>
                            )}
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
                            disabled={!formData.duration || isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Logging...' : 'Log Time'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
