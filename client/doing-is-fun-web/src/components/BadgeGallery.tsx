import { useGetAllBadgesQuery } from '../store/api';
import type { Badge } from '../types/activityBoard';

interface BadgeWithStatus extends Badge {
    is_unlocked: boolean;
    unlocked_at?: string;
    category: string;
    requirement_value?: number;
}

export function BadgeGallery() {
    const { data, isLoading, error } = useGetAllBadgesQuery();

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏅 Badge Collection</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏅 Badge Collection</h2>
                <p className="text-red-600">Failed to load badges</p>
            </div>
        );
    }

    const badges = (data?.badges as BadgeWithStatus[]) || [];
    const unlockedBadges = badges.filter(badge => badge.is_unlocked);

    // Group badges by category
    const groupedBadges = badges.reduce((acc, badge) => {
        if (!acc[badge.category]) {
            acc[badge.category] = [];
        }
        acc[badge.category].push(badge);
        return acc;
    }, {} as Record<string, BadgeWithStatus[]>);

    const categoryNames: Record<string, string> = {
        'special': '🌟 Special',
        'level': '📈 Level',
        'streak': '🔥 Streak',
        'activity': '🎯 Activity',
        'daily': '📅 Daily',
        'general': '🏆 General'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">🏅 Badge Collection</h2>
                <div className="text-sm text-gray-600">
                    {unlockedBadges.length} / {badges.length} unlocked
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((unlockedBadges.length / badges.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Badge categories */}
            {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
                <div key={category} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {categoryNames[category] || category}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryBadges.map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function BadgeCard({ badge }: { badge: BadgeWithStatus }) {
    const isUnlocked = badge.is_unlocked;

    return (
        <div className={`
            relative rounded-lg p-4 border-2 transition-all duration-200 hover:scale-105
            ${isUnlocked
                ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md'
                : 'border-gray-200 bg-gray-50 opacity-60'
            }
        `}>
            {/* Badge icon */}
            <div className="text-center mb-3">
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto
                    ${isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300'}
                `}>
                    {isUnlocked ? badge.icon_url : '🔒'}
                </div>
            </div>

            {/* Badge name */}
            <h4 className={`
                text-sm font-semibold text-center mb-1
                ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}
            `}>
                {badge.name}
            </h4>

            {/* Badge description */}
            <p className={`
                text-xs text-center leading-tight
                ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}
            `}>
                {badge.description}
            </p>

            {/* Unlock date */}
            {isUnlocked && badge.unlocked_at && (
                <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
            )}
        </div>
    );
}
