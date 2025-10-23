import { ActivityBoard } from '../components/ActivityBoard/ActivityBoard';
import XpBar from '../components/XpBar';

export default function Dashboard() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Activity Tracker</h1>
                        <p className="text-gray-600">Stay productive and achieve your goals</p>
                    </div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <XpBar />
                </div>
            </div>

            {/* Main Content */}
            <div className="pb-12">
                <ActivityBoard />
            </div>

        </div>
    );
}
