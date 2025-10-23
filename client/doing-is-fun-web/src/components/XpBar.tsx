import { useAppSelector } from "../store/hooks";
import { getXpProgress } from '../utils/leveling';

export default function XpBar() {
    const xp = useAppSelector(s => s.xp.current);
    const { level, progress, xpToNext, currentLevelXp, nextLevelXp } = getXpProgress(xp);

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{level}</div>
                            <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">Level</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Experience Progress</h3>
                        <p className="text-sm text-gray-600">Keep completing activities to level up!</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{xp.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total XP</div>
                    <div className="text-sm text-blue-600 font-medium">{xpToNext} XP to next level</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress to Level {level + 1}</span>
                    <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
                </div>

                <div className="relative">
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                    <div
                        className="absolute top-0 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full blur-sm opacity-60 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                        {xpToNext > 0 ? `${xpToNext.toLocaleString()} XP to next level` : 'MAX LEVEL!'}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-semibold text-gray-900">{(xp - currentLevelXp).toLocaleString()}</div>
                        <div className="text-gray-500">Current</div>
                    </div>
                    <div className="text-gray-300">/</div>
                    <div className="text-center">
                        <div className="font-semibold text-gray-900">{(nextLevelXp - currentLevelXp).toLocaleString()}</div>
                        <div className="text-gray-500">Needed</div>
                    </div>
                </div>
            </div>
        </div>
    )
}