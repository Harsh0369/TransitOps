"use client";

import React, { createContext, useState, useEffect } from "react";
import { User } from "@/types/auth";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRoleBasedRedirect = (role: string): string => {
  switch (role) {
    case "FLEET_MANAGER":
      return "/dashboard";
    case "DRIVER":
      return "/trips";
    case "SAFETY_OFFICER":
      return "/drivers";
    case "FINANCIAL_ANALYST":
      return "/analytics";
    default:
      return "/dashboard";
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("transitops_token");
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem("transitops_user", JSON.stringify(res.data));
          } else {
            localStorage.removeItem("transitops_token");
            localStorage.removeItem("transitops_user");
          }
        } catch (e) {
          console.error("Auth check failed:", e);
          localStorage.removeItem("transitops_token");
          localStorage.removeItem("transitops_user");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Store token and user
        localStorage.setItem("transitops_token", token);
        localStorage.setItem("transitops_user", JSON.stringify(userData));
        
        setUser(userData);
        
        // Redirect based on role
        const redirectPath = getRoleBasedRedirect(userData.role);
        router.push(redirectPath);
        
        return { success: true };
      } else {
        const errorMsg = response.message || "Login failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}
