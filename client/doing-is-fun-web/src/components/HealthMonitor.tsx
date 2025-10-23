/**
 * Health Monitor Component
 * Displays system health status for administrators
 */

import { useState, useEffect } from 'react';

interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'warning';
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    responseTime: number;
    checks?: {
        server: { status: string; responseTime: number };
        database: { status: string; responseTime: number; error?: string };
        redis: { status: string; responseTime: number; error?: string };
        memory: { status: string; usage: any };
    };
}

export function HealthMonitor() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const response = await fetch('/health/detailed');
            const data = await response.json();
            setHealth(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch health status');
            console.error('Health check failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'unhealthy': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading health status...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                    <div className="text-red-600">❌</div>
                    <span className="ml-2 text-red-800">{error}</span>
                </div>
            </div>
        );
    }

    if (!health) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-600">No health data available</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
                <button
                    onClick={fetchHealth}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Overall Status */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Overall Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                        {health.status.toUpperCase()}
                    </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    <p>Last checked: {new Date(health.timestamp).toLocaleString()}</p>
                    <p>Uptime: {formatUptime(health.uptime)}</p>
                    <p>Environment: {health.environment}</p>
                    <p>Response time: {health.responseTime}ms</p>
                </div>
            </div>

            {/* Component Status */}
            {health.checks && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Server */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Server</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.checks.server.status)}`}>
                                {health.checks.server.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">{health.checks.server.responseTime}ms</p>
                    </div>

                    {/* Database */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Database</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.checks.database.status)}`}>
                                {health.checks.database.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {health.checks.database.responseTime}ms
                            {health.checks.database.error && (
                                <span className="text-red-600 ml-2">({health.checks.database.error})</span>
                            )}
                        </p>
                    </div>

                    {/* Redis */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Redis</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.checks.redis.status)}`}>
                                {health.checks.redis.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {health.checks.redis.responseTime}ms
                            {health.checks.redis.error && (
                                <span className="text-red-600 ml-2">({health.checks.redis.error})</span>
                            )}
                        </p>
                    </div>

                    {/* Memory */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Memory</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(health.checks.memory.status)}`}>
                                {health.checks.memory.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Used: {health.checks.memory.usage.heapUsed}MB / {health.checks.memory.usage.heapTotal}MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
