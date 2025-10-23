export interface CustomActivity {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon: string;
    created_at: string;
    is_active: boolean;
    user_id: string;
    category?: string;
    target_duration?: number; // in minutes
}

export interface ActivityLog {
    id: string;
    activity_id: string;
    goal_id?: string;
    duration: number;
    notes?: string;
    entry_date: string;
    created_at: string;
    user_id: string;
}

export interface ActivityGoal {
    id: string;
    activity_id: string;
    user_id: string;
    goal_type: 'daily' | 'weekly' | 'monthly';
    target_frequency: number;
    target_duration?: number;
    start_date: string;
    end_date: string;
    is_completed: boolean;
    completed_count: number;
    created_at: string;
    activity?: CustomActivity;
}

export interface ActivitySummary {
    totalMinutes: number;
    mostFrequentActivity: string;
    streak: number;
    lastActivityDate: string;
    thisWeekMinutes: number;
    thisMonthMinutes: number;
}

export interface ActivityHistoryItem {
    entry_date: string;
    total_duration: number;
    activity_count: number;
    activities: {
        activity_id: string;
        activity_name: string;
        duration: number;
    }[];
}

export interface NewActivityLog {
    activity_id: string;
    goal_id?: string;
    duration: number;
    notes?: string;
    entry_date: string;
}

export interface CreateActivityRequest {
    name: string;
    description?: string;
    color: string;
    icon: string;
    category?: string;
    target_duration?: number;
}

export interface UpdateActivityRequest {
    id: string;
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    category?: string;
    target_duration?: number;
    is_active?: boolean;
}
