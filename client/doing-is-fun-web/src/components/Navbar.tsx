import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials } from "../store/slices/authSlice";
import { useLogoutMutation } from "../features/api/authApi";
type NavbarProps = {
    onRegisterClick: () => void;
    onLoginClick: () => void;
};

const Navbar = ({ onRegisterClick, onLoginClick }: NavbarProps) => {
    const [logoutApi] = useLogoutMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    //const { user, setUser } = useAuth();
    // const [, setAccessToken] = useAccessToken();

    const handleLogout = async () => {
        try {
            //await logoutUser();
            await logoutApi().unwrap();
            dispatch(clearCredentials());
            // setUser(null);
            // setAccessToken("");
            navigate("/")
        }
        catch (err) {
            console.error("Logout failed", err);
        }
    }

    return (
        <nav className="bg-transparent">
            <div className="mx-auto max-w-6xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between text-white">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate("/")}
                            className="text-white/80 hover:text-white transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer hover:scale-105"
                        >
                            🏠 Home
                        </button>
                        {user && (
                            <>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="text-white/80 hover:text-white transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer hover:scale-105"
                                >
                                    📋 Dashboard
                                </button>
                                <button
                                    onClick={() => navigate("/analytics")}
                                    className="text-white/80 hover:text-white transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer hover:scale-105"
                                >
                                    📊 Analytics
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* User Avatar and Name */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-white/30 to-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                        {user.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white/90 text-sm font-medium">
                                        {user.full_name.split(" ")[0]}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="text-white/80 hover:text-white transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer hover:scale-105"
                                    >
                                        👤 Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-300 hover:text-red-200 transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-500/20 cursor-pointer hover:scale-105"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onRegisterClick}
                                    className="rounded-lg bg-gradient-to-r from-[#9c2c34] to-[#8a252b] py-2 px-4 text-white text-sm font-medium hover:from-[#8a252b] hover:to-[#7a1f25] transition-all duration-200 cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl">
                                    Register
                                </button>
                                <button
                                    onClick={onLoginClick}
                                    className="rounded-lg bg-white/10 py-2 px-4 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200 cursor-pointer hover:scale-105 shadow-md hover:shadow-lg">
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;