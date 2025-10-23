// App-specific cookie utilities for your productivity app
import {
    setPersonalizationCookie,
    setPerformanceCookie,
    setAnalyticsCookie,
    isCookieCategoryAllowed,
    COOKIE_CATEGORIES
} from './cookies';

// Personalization cookies for your app
export const saveUserPreferences = (preferences: {
    theme?: 'light' | 'dark';
    dashboardLayout?: 'grid' | 'list';
    notificationsEnabled?: boolean;
}) => {
    if (isCookieCategoryAllowed(COOKIE_CATEGORIES.PERSONALIZATION)) {
        setPersonalizationCookie('user_preferences', JSON.stringify(preferences), 365);
    } else {
    }
};

export const saveDashboardLayout = (layout: 'grid' | 'list') => {
    if (isCookieCategoryAllowed(COOKIE_CATEGORIES.PERSONALIZATION)) {
        setPersonalizationCookie('dashboard_layout', layout, 365);
    }
};


// Performance cookies for caching
export const saveActivityCache = (activities: any[]) => {
    if (isCookieCategoryAllowed(COOKIE_CATEGORIES.PERFORMANCE)) {
        setPerformanceCookie('activity_cache', JSON.stringify(activities), 1); // Cache for 1 day
    }
};

export const saveAnalyticsCache = (analyticsData: any) => {
    if (isCookieCategoryAllowed(COOKIE_CATEGORIES.PERFORMANCE)) {
        setPerformanceCookie('analytics_cache', JSON.stringify(analyticsData), 1);
    }
};

// Analytics cookies for tracking user behavior
export const trackActivityCompletion = (activityType: string, xpGained: number) => {
    if (isCookieCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)) {
        const trackingData = {
            activityType,
            xpGained,
            timestamp: new Date().toISOString(),
            userId: 'current_user' // Replace with actual user ID
        };
        setAnalyticsCookie('activity_completion', JSON.stringify(trackingData), 30);
    }
};

export const trackFeatureUsage = (feature: string, action: string) => {
    if (isCookieCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)) {
        const usageData = {
            feature,
            action,
            timestamp: new Date().toISOString()
        };
        setAnalyticsCookie('feature_usage', JSON.stringify(usageData), 30);
    }
};

// Example usage in your components:
/*
import { saveUserPreferences, trackActivityCompletion } from '../utils/appCookies';

// In a component:
const handleThemeChange = (theme: 'light' | 'dark') => {
  saveUserPreferences({ theme });
};

const handleActivityComplete = (activity: any) => {
  trackActivityCompletion(activity.type, activity.xpValue);
};
*/
