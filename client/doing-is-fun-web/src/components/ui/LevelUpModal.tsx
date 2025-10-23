import { useSelector, useDispatch } from 'react-redux';
import { clearLevelUp } from '../../store/slices/xpSlice';
import type { RootState } from '../../store';

export function LevelUpModal() {
    const dispatch = useDispatch();
    const level = useSelector((s: RootState) => s.xp.level);
    const justLeveled = useSelector((s: RootState) => s.xp.justLeveled);

    if (!justLeveled) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 border border-white/20 backdrop-blur-sm">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="text-6xl mb-4">⭐</div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">LEVEL UP!</h2>
                    <div className="text-6xl font-bold text-blue-600 mb-4">
                        {level}
                    </div>
                    <p className="text-lg text-gray-600 mb-6">Keep up the amazing work!</p>
                    <button
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={() => dispatch(clearLevelUp())}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
