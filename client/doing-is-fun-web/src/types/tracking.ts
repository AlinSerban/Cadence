// Legacy types - keeping for backward compatibility during migration
export interface ActivityHistoryItem {
  entry_date: string;
  total_duration: number;
}

export interface NewActivity {
  activity_type: string;
  duration: number;
  entry_date: string;
}

// New enhanced types for custom activities
export interface TodaySummary {
  xp: number;
  today: {
    activitiesMinutes: number;
    activitiesCount: number;
    goalsCompleted: number;
    streak: number;
  };
}

export interface ActivitySummary {
  totalMinutes: number;
  mostFrequentActivity: string;
  streak: number;
  lastActivityDate: string;
  thisWeekMinutes: number;
  thisMonthMinutes: number;
}
