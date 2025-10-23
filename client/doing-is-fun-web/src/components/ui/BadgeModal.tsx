import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearUnlocked, type Badge } from '../../store/slices/badgeSlice';


export function BadgeModal() {
    const dispatch = useDispatch();
    const unlocked = useSelector((state: RootState) => state.badge.unlocked);

    if (unlocked.length === 0) {
        return null;
    }

    // Show the first newly unlocked badge
    const badge: Badge = unlocked[0];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 border border-white/20 backdrop-blur-sm">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="text-6xl mb-4 animate-bounce">🏆</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Badge Unlocked!</h2>
                    <div className="text-4xl mb-3">{badge.icon_url || '🏅'}</div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-3">
                        {badge.name}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">{badge.description}</p>
                    <button
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={() => dispatch(clearUnlocked())}
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
}
