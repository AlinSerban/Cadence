import { useState, useEffect } from 'react';
import type { ActivityCard } from '../../types/activityBoard';

interface EditCardProps {
    card: ActivityCard;
    onUpdateCard: (cardId: string, updates: Partial<ActivityCard>) => void;
    onClose: () => void;
}

export function EditCard({ card, onUpdateCard, onClose }: EditCardProps) {
    const [formData, setFormData] = useState({
        name: card.name,
        description: card.description,
        label: card.label
    });
    const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

    useEffect(() => {
        setFormData({
            name: card.name,
            description: card.description,
            label: card.label
        });
    }, [card]);

    const validateForm = () => {
        const newErrors: { name?: string; description?: string } = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'Activity name is required';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Activity name must be 100 characters or less';
        }

        // Validate description (optional but with reasonable limit)
        if (formData.description.length > 500) {
            newErrors.description = 'Description must be 500 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onUpdateCard(card.id, {
            name: formData.name,
            description: formData.description,
            label: formData.label
        });

        onClose();
    };

    const labelOptions = [
        { value: 'gym', label: 'Gym', emoji: '💪' },
        { value: 'study', label: 'Study', emoji: '📚' },
        { value: 'work', label: 'Work', emoji: '💼' },
        { value: 'personal', label: 'Personal', emoji: '🏠' },
        { value: 'other', label: 'Other', emoji: '📝' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✏️</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Activity Card</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 cursor-pointer hover:scale-110"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Activity Name *
                            </label>
                            <span className={`text-xs ${formData.name.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                                {formData.name.length}/100
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.name
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            placeholder="e.g., Morning Workout"
                            maxLength={100}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                                {formData.description.length}/500
                            </span>
                        </div>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${errors.description
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            placeholder="e.g., Today I want to do 30 minutes of cardio..."
                            rows={3}
                            maxLength={500}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    {/* Label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {labelOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, label: option.value as any })}
                                    className={`
                    p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium cursor-pointer hover:scale-105
                    ${formData.label === option.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <span className="mr-2">{option.emoji}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Actions */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer font-medium shadow-lg hover:shadow-xl"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
