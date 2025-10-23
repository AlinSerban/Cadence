import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { getProfile } from "../api/auth";
import { useAccessToken } from "../hooks/useAccessToken";
import { useAppSelector } from "../store/hooks";
import { useCookieConsent } from "../context/CookieContext";
import { BadgeGallery } from "../components/BadgeGallery";
import { useGetAllBadgesQuery } from "../store/api";

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<typeof user | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessToken] = useAccessToken();
    const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'cookies'>('profile');
    const { showPreferences } = useCookieConsent();

    // Get XP and level from Redux store
    const { current: currentXp, level } = useAppSelector((state) => state.xp);

    // Get badges data
    const { data: badgesData } = useGetAllBadgesQuery();
    const badges = badgesData?.badges || [];
    const unlockedBadgesCount = badges.filter((badge: any) => badge.is_unlocked).length;

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
        const fetchProfile = async () => {
            if (!accessToken) return;
            try {
                const profile = await getProfile(accessToken);
                setProfile(profile);
            }
            catch (err) {
                console.error('Failed to fetch profile', err);
                navigate("/");
            }
            finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user, navigate, accessToken]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 text-lg">Profile not found.</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'badges', label: 'Badges', icon: '🏅' },
        { id: 'cookies', label: 'Privacy & Cookies', icon: '🍪' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                            <p className="text-gray-600">Manage your account settings and preferences</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">Level {level}</div>
                            <div className="text-sm text-gray-500">{currentXp} XP</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>

                            {/* Profile Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {profile.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
                                        <p className="text-gray-600">@{profile.username}</p>
                                        <p className="text-sm text-gray-500">{profile.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{level}</div>
                                    <div className="text-sm text-gray-500">Current Level</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{currentXp}</div>
                                    <div className="text-sm text-gray-500">Total XP</div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{unlockedBadgesCount}</div>
                                    <div className="text-sm text-gray-500">Badges Earned</div>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <BadgeGallery />
                    )}

                    {activeTab === 'cookies' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Privacy & Cookies</h2>
                                <button
                                    onClick={showPreferences}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Manage Cookie Preferences
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">🍪 Cookie Information</h4>
                                <p className="text-sm text-blue-800 mb-3">
                                    We use cookies to enhance your productivity experience and personalize your journey.
                                    You can manage your cookie preferences at any time.
                                </p>
                                <div className="text-sm text-blue-700">
                                    <p><strong>Necessary:</strong> Essential for app functionality (always active)</p>
                                    <p><strong>Performance:</strong> Optimize app speed and caching</p>
                                    <p><strong>Personalization:</strong> Remember your preferences and settings</p>
                                    <p><strong>Analytics:</strong> Help us improve your experience</p>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Privacy & Data</h4>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <p>• Your activity data is stored securely and used only to improve your productivity journey</p>
                                    <p>• We never share your personal data with third parties without your consent</p>
                                    <p>• All data is encrypted and protected according to industry standards</p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}