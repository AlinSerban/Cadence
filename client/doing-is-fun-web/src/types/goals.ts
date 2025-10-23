export interface Goal {
    id: string;
    user_id: string;
    activity_id: string;
    goal_type: 'daily' | 'weekly' | 'monthly';
    target_frequency: number;
    target_duration?: number;
    start_date: string;
    end_date: string;
    is_completed: boolean;
    completed_count: number;
    created_at: string;
    updated_at: string;
    activity?: {
        id: string;
        name: string;
        icon: string;
        color: string;
    };
}

export interface CreateGoalRequest {
    activity_id: string;
    goal_type: 'daily' | 'weekly' | 'monthly';
    target_frequency: number;
    target_duration?: number;
    start_date: string;
    end_date: string;
}

export interface UpdateGoalRequest {
    id: string;
    target_frequency?: number;
    target_duration?: number;
    end_date?: string;
    is_completed?: boolean;
}

export interface GoalProgress {
    goal_id: string;
    completed_count: number;
    target_frequency: number;
    progress_percentage: number;
    days_remaining: number;
    is_on_track: boolean;
    is_completed: boolean;
    streak: number;
    last_completion_date?: string;
}

export interface WeeklyChallenge {
    id: string;
    title: string;
    description: string;
    goals: Goal[];
    start_date: string;
    end_date: string;
    is_active: boolean;
    completion_percentage: number;
    rewards: {
        xp: number;
        badges: string[];
    };
}

export interface GoalCompletion {
    goal_id: string;
    completed_at: string;
    xp_earned: number;
    badges_unlocked: string[];
    streak_bonus: number;
    message: string;
}
