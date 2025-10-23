import { Link } from 'react-router';
import { useAppSelector } from '../store/hooks';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const user = useAppSelector((state) => state.auth.user);

    return (
        <footer className="bg-blue-100/95 backdrop-blur-sm border-t border-blue-200/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Brand Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">🏃</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Cadence</h3>
                            <p className="text-gray-600 text-xs">
                                Gamified productivity platform
                            </p>
                        </div>
                    </div>

                    {/* Quick Links - Only show for logged in users */}
                    {user && (
                        <div className="flex items-center gap-6">
                            <Link
                                to="/dashboard"
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm cursor-pointer"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/analytics"
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm cursor-pointer"
                            >
                                Analytics
                            </Link>
                            <Link
                                to="/profile"
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm cursor-pointer"
                            >
                                Profile
                            </Link>
                            <Link
                                to="/cookie-settings"
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm cursor-pointer"
                            >
                                Cookie Settings
                            </Link>
                        </div>
                    )}

                    {/* Copyright */}
                    <div className="text-sm text-gray-500">
                        © {currentYear} Cadence
                    </div>
                </div>
            </div>
        </footer>
    );
}
