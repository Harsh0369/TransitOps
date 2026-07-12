"use client";

import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RoleGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) {
  const { user, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user === null) {
      router.replace("/login");
    } else if (!allowedRoles.includes(user.role)) {
      router.replace("/dashboard"); 
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading || !isAuthorized) {
    return null; 
  }

  return <>{children}</>;
}
