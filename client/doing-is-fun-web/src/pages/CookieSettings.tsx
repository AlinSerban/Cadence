import React, { useState, useEffect } from 'react';
import { useCookieConsent, type CookiePreferences } from '../context/CookieContext';
import { clearNonNecessaryCookies } from '../utils/cookies';

const CookieSettings: React.FC = () => {
    const {
        consent,
        updatePreferences
    } = useCookieConsent();

    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        performance: false,
        personalization: false,
        analytics: false,
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Load current preferences
    useEffect(() => {
        if (consent) {
            setPreferences(consent.preferences);
        }
    }, [consent]);

    const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
        if (key === 'necessary') return; // Cannot disable necessary cookies
        setPreferences(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        updatePreferences(preferences);
        setHasChanges(false);

        // Clear cookies that are no longer allowed
        clearNonNecessaryCookies();

        // Show success message
        alert('Cookie preferences updated successfully!');
    };

    const handleReset = () => {
        if (consent) {
            setPreferences(consent.preferences);
            setHasChanges(false);
        }
    };

    const cookieCategories = [
        {
            key: 'necessary' as keyof CookiePreferences,
            title: 'Necessary Cookies',
            description: 'Essential for your productivity app to function properly',
            required: true,
            details: [
                'User authentication and login sessions',
                'Activity tracking and XP system',
                'Activity completion tracking',
                'Core app functionality'
            ]
        },
        {
            key: 'performance' as keyof CookiePreferences,
            title: 'Performance Cookies',
            description: 'Optimize app speed and caching for better experience',
            required: false,
            details: [
                'Activity data caching',
                'Analytics dashboard optimization',
                'Faster loading times',
                'Reduced server requests'
            ]
        },
        {
            key: 'personalization' as keyof CookiePreferences,
            title: 'Personalization Cookies',
            description: 'Remember your preferences and customize your experience',
            required: false,
            details: [
                'Dashboard layout preferences',
                'Dashboard preferences',
                'Theme and appearance',
                'Activity board customizations'
            ]
        },
        {
            key: 'analytics' as keyof CookiePreferences,
            title: 'Analytics Cookies',
            description: 'Help us understand how you use the app to improve features',
            required: false,
            details: [
                'Activity completion patterns',
                'Feature usage statistics',
                'Performance insights',
                'User experience improvements'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Cookie Settings
                    </h1>
                    <p className="text-gray-600">
                        Manage your cookie preferences to customize your productivity experience. Choose which features you'd like to enable for a personalized journey.
                    </p>
                </div>

                {/* Cookie Categories */}
                <div className="space-y-6">
                    {cookieCategories.map((category) => (
                        <div key={category.key} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {category.title}
                                        </h3>
                                        {category.required && (
                                            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-3">
                                        {category.description}
                                    </p>

                                    {/* Details */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">What we use these for:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {category.details.map((detail, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Toggle */}
                                <div className="ml-6">
                                    {category.required ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                                                <div className="w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                            <span className="text-sm text-gray-500">Always Active</span>
                                        </div>
                                    ) : (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={preferences[category.key]}
                                                onChange={(e) => handlePreferenceChange(category.key, e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {hasChanges ? (
                                <span className="text-amber-600 font-medium">
                                    You have unsaved changes
                                </span>
                            ) : (
                                <span>All changes saved</span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {hasChanges && (
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>

                {/* Privacy Information */}
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        Privacy Information
                    </h3>
                    <div className="text-sm text-blue-800 space-y-2">
                        <p>
                            We respect your privacy and are committed to protecting your personal data.
                            Our use of cookies is designed to enhance your productivity experience while maintaining your privacy.
                        </p>
                        <p>
                            You can change your cookie preferences at any time. Changes will take effect immediately
                            and will apply to your future use of the app.
                        </p>
                        <p>
                            Your activity data, XP progress, and personal preferences are stored securely and used only
                            to improve your productivity journey. For more information, please read our
                            <a href="/privacy" className="underline hover:no-underline ml-1">
                                Privacy Policy
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieSettings;
