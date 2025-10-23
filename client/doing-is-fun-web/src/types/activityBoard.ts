export interface ActivityCard {
    id: string;
    name: string;
    description: string;
    label: 'gym' | 'study' | 'work' | 'personal' | 'other';
    status: 'in_progress' | 'done';
    column_id?: string; // Optional - if null, card is in the main board
    date: string; // YYYY-MM-DD format
    created_at: string;
    completed_at?: string;
    xp_value: number; // XP points awarded when completed
    xpGained?: number; // XP gained from this action
    totalXp?: number; // User's total XP after this action
    unlockedBadges?: Badge[]; // Badges unlocked from this action
}

export interface Badge {
    id: number;
    key: string;
    name: string;
    description: string;
    icon_url?: string;
}

export interface BoardColumn {
    id: string;
    name: string;
    color: string;
    date: string; // YYYY-MM-DD format
    created_at: string;
    order_index: number; // For sorting columns
}

export interface ActivityBoard {
    date: string; // YYYY-MM-DD format
    cards: ActivityCard[];
    columns: BoardColumn[];
}

export interface CreateCardRequest {
    name: string;
    description: string;
    label: 'gym' | 'study' | 'work' | 'personal' | 'other';
    column_id?: string;
    date: string;
    xpValue?: number;
}

export interface UpdateCardRequest {
    id: string;
    name?: string;
    description?: string;
    label?: 'gym' | 'study' | 'work' | 'personal' | 'other';
    status?: 'in_progress' | 'done';
    column_id?: string;
    xpValue?: number;
    completed_at?: string;
}

export interface CreateColumnRequest {
    name: string;
    color: string;
    date: string;
}

export interface UpdateColumnRequest {
    id: string;
    name?: string;
    color?: string;
    order?: number;
}

export interface BoardStats {
    totalCards: number;
    completedCards: number;
    inProgressCards: number;
    totalXpEarned: number;
    completionRate: number; // percentage
}
