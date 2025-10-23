import { useState } from 'react';
import type { CreateColumnRequest } from '../../types/activityBoard';

interface AddColumnProps {
    onAddColumn: (column: CreateColumnRequest) => void;
    onClose: () => void;
    date: string;
}

const COLORS = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
];

export function AddColumn({ onAddColumn, onClose, date }: AddColumnProps) {
    const [formData, setFormData] = useState({
        name: '',
        color: COLORS[0].value
    });
    const [errors, setErrors] = useState<{ name?: string }>({});

    const validateForm = () => {
        const newErrors: { name?: string } = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'Column name is required';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Column name must be 50 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onAddColumn({
            ...formData,
            date
        });

        // Reset form
        setFormData({
            name: '',
            color: COLORS[0].value
        });
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">+</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Add Column</h2>
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
                                Column Name *
                            </label>
                            <span className={`text-xs ${formData.name.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                {formData.name.length}/50
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
                            placeholder="e.g., Gym, Study, Work"
                            maxLength={50}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {COLORS.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                    className={`
                    w-12 h-12 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-110 shadow-md hover:shadow-lg
                    ${formData.color === color.value
                                            ? 'border-gray-800 scale-110 shadow-lg'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }
                  `}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:scale-105 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 cursor-pointer hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                        >
                            Add Column
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
