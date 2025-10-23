import { useState } from 'react';
import type { BoardColumn as BoardColumnType, ActivityCard } from '../../types/activityBoard';
import { ActivityCard as ActivityCardComponent } from './ActivityCard';

interface BoardColumnProps {
    column: BoardColumnType;
    cards: ActivityCard[];
    onUpdateCardStatus: (cardId: string, status: 'in_progress' | 'done') => void;
    onDeleteCard: (cardId: string) => void;
    onEditCard: (card: ActivityCard) => void;
    onDeleteColumn: (columnId: string) => void;
    onEditColumn: (column: BoardColumnType) => void;
    onMoveCardToColumn: (cardId: string, columnId: string | undefined) => void;
}

export function BoardColumn({
    column,
    cards,
    onUpdateCardStatus,
    onDeleteCard,
    onEditCard,
    onDeleteColumn,
    onEditColumn,
    onMoveCardToColumn
}: BoardColumnProps) {
    const [showActions, setShowActions] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    const columnCards = cards.filter(card => card.column_id === column.id);

    // Group cards by status
    const activeCards = columnCards.filter(card => card.status === 'in_progress');
    const completedCards = columnCards.filter(card => card.status === 'done');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) {
            onMoveCardToColumn(cardId, column.id);
        }
    };

    return (
        <div
            className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 min-h-[400px] transition-all duration-200 shadow-lg border border-white/20 hover:shadow-xl ${isDragOver ? 'bg-blue-50/80 border-2 border-blue-300 border-dashed' : ''
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div
                className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50"
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: column.color }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{column.name}</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {columnCards.length} cards
                    </span>
                </div>

                {showActions && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEditColumn(column)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit column"
                        >
                            <span className="text-sm">✏️</span>
                        </button>
                        <button
                            onClick={() => onDeleteColumn(column.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete column"
                        >
                            <span className="text-sm">🗑️</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Cards */}
            <div className="space-y-6">
                {columnCards.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <p className="text-sm font-medium mb-1">No cards in this column</p>
                        <p className="text-xs text-gray-400">Drag cards here or create new ones</p>
                    </div>
                ) : (
                    <>
                        {/* Active Cards Section */}
                        {activeCards.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">Active Tasks</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {activeCards.length}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {activeCards.map(card => (
                                        <ActivityCardComponent
                                            key={card.id}
                                            card={card}
                                            onUpdateStatus={onUpdateCardStatus}
                                            onDelete={onDeleteCard}
                                            onEdit={onEditCard}
                                            onMoveToColumn={onMoveCardToColumn}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Visual Separator */}
                        {activeCards.length > 0 && completedCards.length > 0 && (
                            <div className="border-t border-gray-200"></div>
                        )}

                        {/* Completed Cards Section */}
                        {completedCards.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Completed</span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {completedCards.length}
                                    </span>
                                    <span className={`transition-transform duration-200 ${showCompleted ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {showCompleted && (
                                    <div className="space-y-4">
                                        {completedCards.map(card => (
                                            <ActivityCardComponent
                                                key={card.id}
                                                card={card}
                                                onUpdateStatus={onUpdateCardStatus}
                                                onDelete={onDeleteCard}
                                                onEdit={onEditCard}
                                                onMoveToColumn={onMoveCardToColumn}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
