import React, { useState, useEffect } from 'react';
import { useCookieConsent, type CookiePreferences } from '../context/CookieContext';

const CookiePreferencesModal: React.FC = () => {
    const {
        consent,
        isPreferencesOpen,
        hidePreferences,
        acceptSelected
    } = useCookieConsent();

    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        performance: false,
        personalization: false,
        analytics: false,
    });

    // Load current preferences when modal opens
    useEffect(() => {
        if (isPreferencesOpen && consent) {
            setPreferences(consent.preferences);
        }
    }, [isPreferencesOpen, consent]);

    const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
        if (key === 'necessary') return; // Cannot disable necessary cookies
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        acceptSelected(preferences);
    };

    const handleAcceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            performance: true,
            personalization: true,
            analytics: true,
        };
        setPreferences(allAccepted);
        acceptSelected(allAccepted);
    };

    const handleRejectAll = () => {
        const onlyNecessary: CookiePreferences = {
            necessary: true,
            performance: false,
            personalization: false,
            analytics: false,
        };
        setPreferences(onlyNecessary);
        acceptSelected(onlyNecessary);
    };

    if (!isPreferencesOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={hidePreferences} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Cookie Preferences
                            </h2>
                            <button
                                onClick={hidePreferences}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                        <p className="text-sm text-gray-600 mb-6">
                            We use cookies to enhance your productivity experience and help you achieve your goals. You can choose which types of cookies to allow.
                        </p>

                        {/* Cookie Categories */}
                        <div className="space-y-6">
                            {/* Necessary Cookies */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Necessary Cookies</h3>
                                        <p className="text-sm text-gray-500">Essential for the website to function properly</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                                            <div className="w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-500">Always Active</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600">
                                    These cookies are essential for your productivity app to function properly. They handle user authentication,
                                    session management, and core features like activity tracking and XP system.
                                </p>
                            </div>

                            {/* Performance Cookies */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Performance Cookies</h3>
                                        <p className="text-sm text-gray-500">Optimize app speed and caching for better experience</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.performance}
                                            onChange={(e) => handlePreferenceChange('performance', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-600">
                                    These cookies help us optimize your app experience by caching data and improving loading times for your activities and analytics.
                                </p>
                            </div>

                            {/* Personalization Cookies */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Personalization Cookies</h3>
                                        <p className="text-sm text-gray-500">Remember your preferences and customize your experience</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.personalization}
                                            onChange={(e) => handlePreferenceChange('personalization', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-600">
                                    These cookies remember your dashboard layout, theme settings, and other customizations to personalize your productivity journey.
                                </p>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                                        <p className="text-sm text-gray-500">Help us understand how you use the app to improve features</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.analytics}
                                            onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-600">
                                    These cookies help us understand how you interact with features like the activity board and analytics dashboard to improve your experience.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRejectAll}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Accept All
                                </button>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePreferencesModal;
