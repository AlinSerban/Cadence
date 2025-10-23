import { useNavigate } from "react-router";
import { useAppSelector } from "../store/hooks";
import { useGetTodaySummaryQuery, useGetBoardHistoryQuery } from "../store/api";
import { getXpProgress } from "../utils/leveling";

type HomeProps = {
    onRegisterClick: () => void;
    onLoginClick: () => void;
};

export default function Home({ onRegisterClick, onLoginClick }: HomeProps) {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const xp = useAppSelector((state) => state.xp.current);
    const { level, progress, xpToNext } = getXpProgress(xp);

    // Only fetch data if user is logged in
    const { data: todaySummary, isLoading: summaryLoading } = useGetTodaySummaryQuery(undefined, {
        skip: !user
    });

    useGetBoardHistoryQuery(7, {
        skip: !user
    });

    // If user is not logged in, show simple app introduction
    if (!user) {
        return (
            <div className="min-h-full">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 mb-6">
                            Cadence
                        </h1>

                        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            A productivity app that gamifies your daily tasks.
                            Create activities, earn XP, level up, and unlock achievements!
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                                <div className="text-3xl mb-3">📋</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Board</h3>
                                <p className="text-gray-600 text-sm">Create and organize your daily tasks with drag-and-drop functionality.</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                                <div className="text-3xl mb-3">⚡</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">XP & Leveling</h3>
                                <p className="text-gray-600 text-sm">Earn experience points for completing tasks and level up your productivity.</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                                <div className="text-3xl mb-3">🏆</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Achievements</h3>
                                <p className="text-gray-600 text-sm">Unlock badges and celebrate your productivity milestones.</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                                <div className="text-3xl mb-3">📊</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
                                <p className="text-gray-600 text-sm">Track your productivity patterns with beautiful charts and insights.</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                                <div className="text-3xl mb-3">🎮</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Gamification</h3>
                                <p className="text-gray-600 text-sm">Turn boring tasks into exciting challenges with points, levels, and rewards.</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                                <div className="text-3xl mb-3">📱</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Responsive</h3>
                                <p className="text-gray-600 text-sm">Works great on desktop, tablet, and mobile devices.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onRegisterClick}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                            >
                                Register
                            </button>
                            <button
                                onClick={onLoginClick}
                                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-semibold text-lg hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-200 cursor-pointer"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If user is logged in, show personalized dashboard preview
    const recentCards = recentData?.cards || [];
    const completedToday = recentCards.filter(card => {
        const today = (() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })();
        return card.date === today && card.status === 'done';
    }).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Welcome Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            Welcome back, <span className="text-blue-600">{user.full_name.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600">Ready to complete your goals?</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{level}</div>
                                <div className="text-xs sm:text-sm text-gray-500">Current Level</div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{xp.toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500">Total XP</div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{completedToday}</div>
                                <div className="text-xs sm:text-sm text-gray-500">Completed Today</div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">{xpToNext}</div>
                                <div className="text-xs sm:text-sm text-gray-500">XP to Next Level</div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-base sm:text-lg font-semibold text-gray-900">Progress to Level {level + 1}</span>
                            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-white rounded-lg shadow-sm border-2 border-blue-200 p-4 sm:p-6 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
                        >
                            <div className="text-2xl sm:text-3xl mb-3">📋</div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-600">Go to Dashboard</h3>
                            <p className="text-gray-600 text-sm sm:text-base">Manage your activities and track your progress</p>
                        </button>

                        <button
                            onClick={() => navigate("/analytics")}
                            className="bg-white rounded-lg shadow-sm border-2 border-emerald-200 p-4 sm:p-6 hover:shadow-md hover:border-emerald-300 transition-all duration-300 transform hover:scale-105"
                        >
                            <div className="text-2xl sm:text-3xl mb-3">📊</div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-emerald-600">View Analytics</h3>
                            <p className="text-gray-600 text-sm sm:text-base">See your productivity patterns and insights</p>
                        </button>

                        <button
                            onClick={() => navigate("/profile")}
                            className="bg-white rounded-lg shadow-sm border-2 border-orange-200 p-4 sm:p-6 hover:shadow-md hover:border-orange-300 transition-all duration-300 transform hover:scale-105 sm:col-span-2 lg:col-span-1"
                        >
                            <div className="text-2xl sm:text-3xl mb-3">👤</div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-orange-600">Your Profile</h3>
                            <p className="text-gray-600 text-sm sm:text-base">Manage your account and preferences</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
