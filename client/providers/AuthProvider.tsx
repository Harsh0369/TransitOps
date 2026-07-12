"use client";

import React, { createContext, useState, useEffect } from "react";
import { User, Role } from "@/types/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("transitops_user");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (role: Role) => {
    const newUser: User = {
      id: "1",
      name: "Demo User",
      email: "demo@transitops.in",
      role,
    };
    setUser(newUser);
    localStorage.setItem("transitops_user", JSON.stringify(newUser));
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("transitops_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
