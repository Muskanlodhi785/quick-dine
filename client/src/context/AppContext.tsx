/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../lib/api.ts";


interface UserType {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user" | "admin" | "owner";
}

interface AppContextType {
    user: UserType | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<boolean>;
    logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface Props {
    children: React.ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

    const login = async (email: string, password: string): Promise<boolean> => {
       try{
        setLoading(true);
        const res = await api.post("/auth/login", { email, password });
        const { token : userToken, ...userData} = res.data;
        localStorage.setItem("token", userToken);
        setToken(userToken);
        setUser(userData);
        toast.success(`Login successful, ${userData.name}`);
        return true;
       }
       catch(error: any){
        toast.error(error?.response?.data?.message || "Login failed");
        return false;
       }
       finally{
        setLoading(false);
       }

    };

    const register = async (name: string, email: string, password: string, phone?: string, role?: string): Promise<boolean> => {
         try{
        setLoading(true);
        const res = await api.post("/auth/register", {name, phone: phone || undefined, role, email, password });
        const { token : userToken, ...userData} = res.data;
        localStorage.setItem("token", userToken);
        setToken(userToken);
        setUser(userData);
        toast.success(`Welcome to Velvet Table!`);
        return true;
       }
      catch (error: any) {
    console.log("Registration Error:", error);
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);

    toast.error(error?.response?.data?.message || error.message);

    return false;
}
       finally{
        setLoading(false);
       }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        window.location.href = "/";
    };

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try{
                    const res = await api.get("/auth/me");
                   setUser(res.data)
                }catch(error: any){
                    // Only a real 401 (invalid/expired token) should log the user out.
                    // Network blips or 5xx keep the stored token so the next visit retries.
                    if (error?.response?.status === 401) {
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const value: AppContextType = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within AppContextProvider");
    }
    return context;
};
