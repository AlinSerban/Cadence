import type { GoalProgress } from '../../types/goals';

interface GoalProgressProps {
    progress: GoalProgress;
    goalName: string;
    goalIcon: string;
}

export function GoalProgress({ progress, goalName, goalIcon }: GoalProgressProps) {
    const getProgressColor = () => {
        if (progress.is_completed) return 'bg-green-500';
        if (progress.is_on_track) return 'bg-blue-500';
        if (progress.progress_percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getProgressText = () => {
        if (progress.is_completed) return 'Completed!';
        if (progress.is_on_track) return 'On Track';
        if (progress.progress_percentage >= 50) return 'In Progress';
        return 'Needs Attention';
    };

    const getProgressTextColor = () => {
        if (progress.is_completed) return 'text-green-600';
        if (progress.is_on_track) return 'text-blue-600';
        if (progress.progress_percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{goalIcon}</span>
                    <span className="font-medium text-gray-800">{goalName}</span>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-medium ${getProgressTextColor()}`}>
                        {getProgressText()}
                    </div>
                    <div className="text-xs text-gray-500">
                        {progress.days_remaining} days left
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress.completed_count}/{progress.target_frequency}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                        style={{ width: `${Math.min(progress.progress_percentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div className="text-gray-500">Completion</div>
                    <div className="font-medium">{progress.progress_percentage}%</div>
                </div>
                <div>
                    <div className="text-gray-500">Streak</div>
                    <div className="font-medium">{progress.streak} days</div>
                </div>
            </div>

            {/* Last Completion */}
            {progress.last_completion_date && (
                <div className="mt-3 text-xs text-gray-500">
                    Last completed: {new Date(progress.last_completion_date).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}
