import { useState } from 'react';
import type { ActivityCard as ActivityCardType } from '../../types/activityBoard';

interface ActivityCardProps {
    card: ActivityCardType;
    onUpdateStatus: (cardId: string, status: 'in_progress' | 'done') => void;
    onDelete: (cardId: string) => void;
    onEdit: (card: ActivityCardType) => void;
    onMoveToColumn?: (cardId: string, columnId: string | undefined) => void;
}

export function ActivityCard({ card, onUpdateStatus, onDelete, onEdit }: ActivityCardProps) {
    const [showActions, setShowActions] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const getLabelColor = (label: string) => {
        const colors = {
            gym: 'bg-red-100 text-red-800 border-red-200',
            study: 'bg-blue-100 text-blue-800 border-blue-200',
            work: 'bg-green-100 text-green-800 border-green-200',
            personal: 'bg-blue-100 text-blue-800 border-blue-200',
            other: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[label as keyof typeof colors] || colors.other;
    };

    const getStatusIcon = () => {
        if (card.status === 'done') {
            return '✅';
        }
        return '⏳';
    };

    const handleStatusToggle = () => {
        const newStatus = card.status === 'in_progress' ? 'done' : 'in_progress';
        onUpdateStatus(card.id, newStatus);
    };

    const handleDelete = () => {
        if (card.status === 'done') {
            // First change status to in_progress to remove XP
            onUpdateStatus(card.id, 'in_progress');
            // Then delete after a short delay
            setTimeout(() => {
                onDelete(card.id);
            }, 100);
        } else {
            onDelete(card.id);
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDoubleClick={() => onEdit(card)}
            className={`
        bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-l-4 p-5 cursor-grab transition-all duration-300
        ${card.status === 'done'
                    ? 'opacity-70 border-l-emerald-500 bg-emerald-50/80 hover:opacity-80'
                    : 'border-l-blue-500 hover:shadow-xl hover:scale-[1.02] hover:border-l-blue-600'
                }
        ${isDragging ? 'opacity-50 scale-95 cursor-grabbing' : ''}
        hover:bg-white/95
      `}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            title="Double-click to edit, drag to move"
        >
            {/* Header */}
            <div className="flex items-start mb-3">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{getStatusIcon()}</span>
                    <h3 className={`font-semibold ${card.status === 'done' ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                        {card.name}
                    </h3>
                </div>
            </div>

            {/* Description */}
            <p className={`text-sm mb-3 ${card.status === 'done' ? 'text-gray-500' : 'text-gray-700'}`}>
                {card.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                {/* Left side - Category */}
                <span className={`
                    px-3 py-1.5 rounded-full text-xs font-medium border
                    ${getLabelColor(card.label)}
                `}>
                    {card.label}
                </span>

                {/* Right side - Actions and Checkbox */}
                <div className="flex items-center gap-2">
                    {/* Edit and Delete buttons */}
                    {showActions && (
                        <div className="flex gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(card);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110"
                                title="Edit card (or double-click)"
                            >
                                <span className="text-sm">✏️</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110"
                                title="Delete card"
                            >
                                <span className="text-sm">🗑️</span>
                            </button>
                        </div>
                    )}

                    {/* Checkbox */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusToggle();
                        }}
                        className={`
                            w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110
                            ${card.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600'
                                : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }
                        `}
                        title={card.status === 'done' ? 'Mark as incomplete' : 'Mark as done'}
                    >
                        {card.status === 'done' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}