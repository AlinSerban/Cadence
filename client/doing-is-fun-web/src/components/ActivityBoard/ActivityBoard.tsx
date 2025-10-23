import { useDispatch } from 'react-redux';
import { addBadges } from '../../store/slices/badgeSlice';
import { useActivityBoard } from '../../hooks/useActivityBoard';
import type { ActivityCard } from '../../types/activityBoard';
import { DateNavigator } from './DateNavigator';
import { BoardColumn as BoardColumnComponent } from './BoardColumn';
import { ActivityCard as ActivityCardComponent } from './ActivityCard';
import { AddCard } from './AddCard';
import { AddColumn } from './AddColumn';
import { EditCard } from './EditCard';

export function ActivityBoard() {
    const dispatch = useDispatch();

    // Use the custom hook for all activity board logic
    const {
        currentDate,
        cards,
        columns,
        isLoading,
        error,
        showAddCard,
        showAddColumn,
        showEditCard,
        selectedColumnId,
        editingCard,
        isMainBoardDragOver,
        showMainBoardCompleted,
        handleAddCard,
        handleAddColumn,
        handleUpdateCard,
        handleDeleteCard,
        handleDeleteColumn,
        handleEditCard,
        handleEditColumn,
        handleMoveCardToColumn,
        openAddCard,
        closeAddCard,
        openAddColumn,
        closeAddColumn,
        closeEditCard,
        changeDate,
        setIsMainBoardDragOver,
        setShowMainBoardCompleted,
    } = useActivityBoard();

    // Enhanced handler for card status updates with badge handling
    const handleUpdateCardStatus = async (cardId: string, status: 'in_progress' | 'done') => {
        try {
            const updates = {
                status,
                completed_at: status === 'done' ? (() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
                })() : undefined
            };

            const result = await handleUpdateCard(cardId, updates);

            // Handle unlocked badges
            if (result.unlockedBadges && result.unlockedBadges.length > 0) {
                dispatch(addBadges(result.unlockedBadges));
            }
        } catch (error) {
            console.error('Failed to update card status:', error);
        }
    };

    // Drag and drop handlers for main board
    const handleMainBoardDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsMainBoardDragOver(true);
    };

    const handleMainBoardDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsMainBoardDragOver(false);
    };

    const handleMainBoardDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsMainBoardDragOver(false);

        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) {
            handleMoveCardToColumn(cardId, undefined);
        }
    };

    // Enhanced card update handler for edit modal
    const handleUpdateCardFromEdit = async (cardId: string, updates: Partial<ActivityCard>) => {
        try {
            await handleUpdateCard(cardId, updates);
            closeEditCard();
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    const mainBoardCards = cards.filter(card => !card.column_id);

    // Group main board cards by status
    const mainBoardActiveCards = mainBoardCards.filter(card => card.status === 'in_progress');
    const mainBoardCompletedCards = mainBoardCards.filter(card => card.status === 'done');
    const sortedColumns = [...columns].sort((a, b) => a.order_index - b.order_index);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading board data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-600">Failed to load board data</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Board</h1>
                    <p className="text-gray-600">Organize and track your daily activities</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => openAddCard()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <span className="text-lg">+</span>
                        <span className="font-medium">Add Card</span>
                    </button>
                    <button
                        onClick={() => openAddColumn()}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <span className="text-lg">+</span>
                        <span className="font-medium">Add Column</span>
                    </button>
                </div>
            </div>

            {/* Date Navigator */}
            <DateNavigator currentDate={currentDate} onDateChange={changeDate} />

            {/* Board Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{cards.length}</div>
                            <div className="text-sm font-medium text-gray-600 mt-1">Total Cards</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-emerald-600">
                                {cards.filter(c => c.status === 'done').length}
                            </div>
                            <div className="text-sm font-medium text-gray-600 mt-1">Completed</div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-amber-600">
                                {cards.filter(c => c.status === 'in_progress').length}
                            </div>
                            <div className="text-sm font-medium text-gray-600 mt-1">In Progress</div>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">⏳</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-blue-600">
                                {cards.filter(c => c.status === 'done').reduce((sum, c) => sum + c.xp_value, 0)}
                            </div>
                            <div className="text-sm font-medium text-gray-600 mt-1">XP Earned</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">⭐</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className={`grid gap-6 pb-6 ${sortedColumns.length + 1 <= 3
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : sortedColumns.length + 1 <= 4
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                }`}>
                {/* Main Board */}
                <div
                    className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 min-h-[500px] transition-all duration-200 shadow-lg border border-white/20 hover:shadow-xl ${isMainBoardDragOver ? 'bg-blue-50/80 border-2 border-blue-300 border-dashed' : ''
                        }`}
                    onDragOver={handleMainBoardDragOver}
                    onDragLeave={handleMainBoardDragLeave}
                    onDrop={handleMainBoardDrop}
                >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">📋</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Main Board</h3>
                        </div>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {mainBoardCards.length} cards
                        </span>
                    </div>

                    <div className="space-y-6">
                        {mainBoardCards.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📝</span>
                                </div>
                                <p className="text-sm font-medium mb-1">No cards on main board</p>
                                <p className="text-xs text-gray-400">Create your first activity card!</p>
                            </div>
                        ) : (
                            <>
                                {/* Active Cards Section */}
                                {mainBoardActiveCards.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Active Tasks</span>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {mainBoardActiveCards.length}
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            {mainBoardActiveCards.map(card => (
                                                <ActivityCardComponent
                                                    key={card.id}
                                                    card={card}
                                                    onUpdateStatus={handleUpdateCardStatus}
                                                    onDelete={handleDeleteCard}
                                                    onEdit={handleEditCard}
                                                    onMoveToColumn={handleMoveCardToColumn}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Visual Separator */}
                                {mainBoardActiveCards.length > 0 && mainBoardCompletedCards.length > 0 && (
                                    <div className="border-t border-gray-200"></div>
                                )}

                                {/* Completed Cards Section */}
                                {mainBoardCompletedCards.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => setShowMainBoardCompleted(!showMainBoardCompleted)}
                                            className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Completed</span>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                {mainBoardCompletedCards.length}
                                            </span>
                                            <span className={`transition-transform duration-200 ${showMainBoardCompleted ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>

                                        {showMainBoardCompleted && (
                                            <div className="space-y-4">
                                                {mainBoardCompletedCards.map(card => (
                                                    <ActivityCardComponent
                                                        key={card.id}
                                                        card={card}
                                                        onUpdateStatus={handleUpdateCardStatus}
                                                        onDelete={handleDeleteCard}
                                                        onEdit={handleEditCard}
                                                        onMoveToColumn={handleMoveCardToColumn}
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

                {/* Columns */}
                {sortedColumns.map(column => (
                    <BoardColumnComponent
                        key={column.id}
                        column={column}
                        cards={cards}
                        onUpdateCardStatus={handleUpdateCardStatus}
                        onDeleteCard={handleDeleteCard}
                        onEditCard={handleEditCard}
                        onDeleteColumn={handleDeleteColumn}
                        onEditColumn={handleEditColumn}
                        onMoveCardToColumn={handleMoveCardToColumn}
                    />
                ))}
            </div>

            {/* Modals */}
            {showAddCard && (
                <AddCard
                    onAddCard={handleAddCard}
                    onClose={closeAddCard}
                    selectedColumnId={selectedColumnId}
                    date={currentDate}
                />
            )}

            {showAddColumn && (
                <AddColumn
                    onAddColumn={handleAddColumn}
                    onClose={closeAddColumn}
                    date={currentDate}
                />
            )}

            {showEditCard && editingCard && (
                <EditCard
                    card={editingCard}
                    onUpdateCard={handleUpdateCardFromEdit}
                    onClose={closeEditCard}
                />
            )}
        </div>
    );
}
