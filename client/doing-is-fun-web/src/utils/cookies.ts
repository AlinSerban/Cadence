// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Cookie categories
export const COOKIE_CATEGORIES = {
    NECESSARY: 'necessary',
    PERFORMANCE: 'performance',
    PERSONALIZATION: 'personalization',
    ANALYTICS: 'analytics',
} as const;

// Analytics cookies (Google Analytics, etc.)
export const setAnalyticsCookie = (name: string, value: string, days: number = 365) => {
    // Only set if analytics cookies are allowed
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
        const parsedConsent = JSON.parse(consent);
        if (parsedConsent.preferences?.analytics) {
            setCookie(name, value, days);
        }
    }
};

// Performance cookies (caching, optimization, etc.)
export const setPerformanceCookie = (name: string, value: string, days: number = 365) => {
    // Only set if performance cookies are allowed
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
        const parsedConsent = JSON.parse(consent);
        if (parsedConsent.preferences?.performance) {
            setCookie(name, value, days);
        }
    }
};

// Personalization cookies (user preferences, themes, etc.)
export const setPersonalizationCookie = (name: string, value: string, days: number = 365) => {
    // Only set if personalization cookies are allowed
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
        const parsedConsent = JSON.parse(consent);
        if (parsedConsent.preferences?.personalization) {
            setCookie(name, value, days);
        }
    }
};

// Clear all non-necessary cookies
export const clearNonNecessaryCookies = () => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
        const parsedConsent = JSON.parse(consent);
        const preferences = parsedConsent.preferences;

        // Clear analytics cookies if not allowed
        if (!preferences.analytics) {
            // Add your analytics cookie names here
            const analyticsCookies = ['_ga', '_ga_*', '_gid', '_gat', '_gcl_au'];
            analyticsCookies.forEach(cookie => deleteCookie(cookie));
        }

        // Clear performance cookies if not allowed
        if (!preferences.performance) {
            // Add your performance cookie names here
            const performanceCookies = ['cache_preferences', 'optimization_settings'];
            performanceCookies.forEach(cookie => deleteCookie(cookie));
        }

        // Clear personalization cookies if not allowed
        if (!preferences.personalization) {
            // Add your personalization cookie names here
            const personalizationCookies = ['user_preferences', 'theme', 'language', 'dashboard_layout'];
            personalizationCookies.forEach(cookie => deleteCookie(cookie));
        }
    }
};

// Check if a specific cookie category is allowed
export const isCookieCategoryAllowed = (category: string): boolean => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) return false;

    try {
        const parsedConsent = JSON.parse(consent);
        const preferences = parsedConsent.preferences;

        switch (category) {
            case COOKIE_CATEGORIES.NECESSARY:
                return true; // Always allowed
            case COOKIE_CATEGORIES.PERFORMANCE:
                return preferences.performance === true;
            case COOKIE_CATEGORIES.PERSONALIZATION:
                return preferences.personalization === true;
            case COOKIE_CATEGORIES.ANALYTICS:
                return preferences.analytics === true;
            default:
                return false;
        }
    } catch (error) {
        console.error('Error parsing cookie consent:', error);
        return false;
    }
};

// Initialize Google Analytics (example)
export const initializeGoogleAnalytics = (trackingId: string) => {
    if (!isCookieCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)) {
        return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = window.gtag || function () {
        (window.gtag.q = window.gtag.q || []).push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', trackingId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=Lax;Secure',
    });
};

// Declare gtag for TypeScript
declare global {
    interface Window {
        gtag: {
            (...args: any[]): void;
            q: any[];
        };
    }
}
