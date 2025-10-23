import { createContext, } from "react";
import { type User } from "../types/auth";

export type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


