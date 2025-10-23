import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { User } from "../types/auth";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials, setCredentials } from "../store/slices/authSlice";
import type { RootState } from "../store";
import { setXp } from "../store/slices/xpSlice";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user) as User | null;
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function tryRefresh() {
            try {
                const res = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include"
                });
                const data = await res.json();

                if (res.ok && data.accessToken) {
                    const profileRes = await fetch("/api/auth/me", {
                        headers: { Authorization: `Bearer ${data.accessToken}` }
                    })
                    const userData: User & { xp: number } = await profileRes.json();

                    dispatch(setCredentials({ user: userData, accessToken: data.accessToken }))
                    dispatch(setXp(userData.xp));
                }
                else {
                    dispatch(clearCredentials());
                }

            }
            catch {
                dispatch(clearCredentials());
            }
            finally {
                setLoading(false)
            }
        }
        tryRefresh();
    }, [dispatch])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Initializing...</p>
                </div>
            </div>
        );
    }

    const ctxValue: AuthContextType = {
        user,
        accessToken,
        loading,
        setUser: () => { }, // Placeholder - would be implemented with proper state management
        setAccessToken: () => { } // Placeholder - would be implemented with proper state management
    };

    return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>;
}
