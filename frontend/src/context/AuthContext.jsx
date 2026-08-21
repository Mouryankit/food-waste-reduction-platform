import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import API from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const res = await API.get("/auth/me");
            console.log(res.data.user); 
            setUser(res.data.user);
            return res.data.user;
        } catch (error) {
            console.error("Auth check failed:", error.message || error);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = useMemo(() => ({
        user,
        setUser,
        loading,
        setLoading,
        checkAuth
    }), [user, loading, checkAuth]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}