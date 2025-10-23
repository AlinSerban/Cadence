import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CookiePreferences {
    necessary: boolean;
    performance: boolean;
    personalization: boolean;
    analytics: boolean;
}

export interface CookieConsent {
    hasConsented: boolean;
    preferences: CookiePreferences;
    timestamp: number;
    version: string;
}

interface CookieContextType {
    consent: CookieConsent | null;
    showConsentBanner: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
    acceptSelected: (preferences: CookiePreferences) => void;
    updatePreferences: (preferences: Partial<CookiePreferences>) => void;
    showPreferences: () => void;
    hidePreferences: () => void;
    isPreferencesOpen: boolean;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_VERSION = '1.0';

const defaultPreferences: CookiePreferences = {
    necessary: true, // Always true, cannot be disabled
    performance: false,
    personalization: false,
    analytics: false,
};

export const CookieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [consent, setConsent] = useState<CookieConsent | null>(null);
    const [showConsentBanner, setShowConsentBanner] = useState(false);
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

    // Load consent from localStorage on mount
    useEffect(() => {
        const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (savedConsent) {
            try {
                const parsedConsent = JSON.parse(savedConsent);
                // Check if consent version is current
                if (parsedConsent.version === COOKIE_VERSION) {
                    setConsent(parsedConsent);
                    setShowConsentBanner(false);
                } else {
                    // Version mismatch, show banner again
                    setShowConsentBanner(true);
                }
            } catch (error) {
                console.error('Error parsing cookie consent:', error);
                setShowConsentBanner(true);
            }
        } else {
            setShowConsentBanner(true);
        }
    }, []);

    const saveConsent = (preferences: CookiePreferences) => {
        const newConsent: CookieConsent = {
            hasConsented: true,
            preferences,
            timestamp: Date.now(),
            version: COOKIE_VERSION,
        };

        setConsent(newConsent);
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
        setShowConsentBanner(false);
        setIsPreferencesOpen(false);
    };

    const acceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            performance: true,
            personalization: true,
            analytics: true,
        };
        saveConsent(allAccepted);
    };

    const rejectAll = () => {
        saveConsent(defaultPreferences);
    };

    const acceptSelected = (preferences: CookiePreferences) => {
        saveConsent(preferences);
    };

    const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
        if (consent) {
            const updatedPreferences = {
                ...consent.preferences,
                ...newPreferences,
                necessary: true, // Always keep necessary cookies enabled
            };
            saveConsent(updatedPreferences);
        }
    };

    const showPreferences = () => {
        setIsPreferencesOpen(true);
    };

    const hidePreferences = () => {
        setIsPreferencesOpen(false);
    };

    const value: CookieContextType = {
        consent,
        showConsentBanner,
        acceptAll,
        rejectAll,
        acceptSelected,
        updatePreferences,
        showPreferences,
        hidePreferences,
        isPreferencesOpen,
    };

    return (
        <CookieContext.Provider value={value}>
            {children}
        </CookieContext.Provider>
    );
};

export const useCookieConsent = (): CookieContextType => {
    const context = useContext(CookieContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieProvider');
    }
    return context;
};
