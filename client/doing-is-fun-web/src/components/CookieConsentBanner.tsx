import React from 'react';
import { useCookieConsent } from '../context/CookieContext';

const CookieConsentBanner: React.FC = () => {
    const { showConsentBanner, acceptAll, rejectAll, showPreferences } = useCookieConsent();

    if (!showConsentBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            🍪 We use cookies
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We use cookies to enhance your productivity experience, optimize app performance, and personalize your journey.
                            By clicking "Accept All", you consent to our use of cookies. You can manage your preferences
                            to customize which features you'd like to enable.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:ml-8">
                        <button
                            onClick={rejectAll}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Reject All
                        </button>
                        <button
                            onClick={showPreferences}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Customize
                        </button>
                        <button
                            onClick={acceptAll}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
