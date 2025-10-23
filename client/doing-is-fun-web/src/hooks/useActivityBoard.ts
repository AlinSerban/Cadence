import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    useGetBoardDataQuery,
    useCreateCardMutation,
    useUpdateCardMutation,
    useDeleteCardMutation,
    useCreateColumnMutation,
    useDeleteColumnMutation
} from '../store/api';
import type {
    CreateCardRequest,
    CreateColumnRequest,
    ActivityCard,
    BoardColumn
} from '../types/activityBoard';

export function useActivityBoard(initialDate?: string) {
    const dispatch = useDispatch();

    const [currentDate, setCurrentDate] = useState(() => {
        if (initialDate) return initialDate;
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const [showAddCard, setShowAddCard] = useState(false);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [showEditCard, setShowEditCard] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>();
    const [editingCard, setEditingCard] = useState<ActivityCard | null>(null);
    const [isMainBoardDragOver, setIsMainBoardDragOver] = useState(false);
    const [showMainBoardCompleted, setShowMainBoardCompleted] = useState(false);

    // API hooks
    const { data: boardData, isLoading, error } = useGetBoardDataQuery(currentDate);
    const [createCard] = useCreateCardMutation();
    const [updateCard] = useUpdateCardMutation();
    const [deleteCard] = useDeleteCardMutation();
    const [createColumn] = useCreateColumnMutation();
    const [deleteColumn] = useDeleteColumnMutation();

    const cards = boardData?.cards || [];
    const columns = boardData?.columns || [];

    // Business logic handlers
    const handleAddCard = useCallback(async (cardData: CreateCardRequest) => {
        try {
            await createCard(cardData).unwrap();
            setShowAddCard(false);
        } catch (error) {
            console.error('Failed to create card:', error);
            throw error;
        }
    }, [createCard]);

    const handleAddColumn = useCallback(async (columnData: CreateColumnRequest) => {
        try {
            await createColumn(columnData).unwrap();
            setShowAddColumn(false);
        } catch (error) {
            console.error('Failed to create column:', error);
            throw error;
        }
    }, [createColumn]);

    const handleUpdateCard = useCallback(async (cardId: string, updates: Partial<ActivityCard>) => {
        try {
            const result = await updateCard({ id: cardId, updates }).unwrap();


            return result;
        } catch (error) {
            console.error('Failed to update card:', error);
            throw error;
        }
    }, [updateCard]);

    const handleDeleteCard = useCallback(async (cardId: string) => {
        try {
            await deleteCard(cardId).unwrap();
        } catch (error) {
            console.error('Failed to delete card:', error);
            throw error;
        }
    }, [deleteCard]);

    const handleDeleteColumn = useCallback(async (columnId: string) => {
        try {
            await deleteColumn(columnId).unwrap();
        } catch (error) {
            console.error('Failed to delete column:', error);
            throw error;
        }
    }, [deleteColumn]);

    const handleEditCard = useCallback((card: ActivityCard) => {
        setEditingCard(card);
        setShowEditCard(true);
    }, []);

    const handleEditColumn = useCallback((column: BoardColumn) => {
        // TODO: Implement column editing
    }, []);

    const handleMoveCardToColumn = useCallback(async (cardId: string, columnId: string | undefined) => {
        try {
            await updateCard({ id: cardId, updates: { column_id: columnId } }).unwrap();
        } catch (error) {
            console.error('Failed to move card:', error);
            throw error;
        }
    }, [updateCard]);

    // UI state handlers
    const openAddCard = useCallback((columnId?: string) => {
        setSelectedColumnId(columnId);
        setShowAddCard(true);
    }, []);

    const closeAddCard = useCallback(() => {
        setShowAddCard(false);
        setSelectedColumnId(undefined);
    }, []);

    const openAddColumn = useCallback(() => {
        setShowAddColumn(true);
    }, []);

    const closeAddColumn = useCallback(() => {
        setShowAddColumn(false);
    }, []);

    const closeEditCard = useCallback(() => {
        setShowEditCard(false);
        setEditingCard(null);
    }, []);

    const changeDate = useCallback((newDate: string) => {
        setCurrentDate(newDate);
    }, []);

    return {
        // Data
        currentDate,
        cards,
        columns,
        boardData,
        isLoading,
        error,

        // UI State
        showAddCard,
        showAddColumn,
        showEditCard,
        selectedColumnId,
        editingCard,
        isMainBoardDragOver,
        showMainBoardCompleted,

        // Actions
        handleAddCard,
        handleAddColumn,
        handleUpdateCard,
        handleDeleteCard,
        handleDeleteColumn,
        handleEditCard,
        handleEditColumn,
        handleMoveCardToColumn,

        // UI State Actions
        openAddCard,
        closeAddCard,
        openAddColumn,
        closeAddColumn,
        closeEditCard,
        changeDate,
        setIsMainBoardDragOver,
        setShowMainBoardCompleted,
    };
}
