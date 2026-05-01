"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import LoadingSkeleton from "./LoadingSkeleton";

export default function AuthGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // Not logged in, redirect to login unless already on a public page
      if (!pathname.startsWith("/login") && !pathname.startsWith("/register") && pathname !== "/") {
        router.replace(`/login?redirect=${pathname}`);
      }
    } else {
      // Logged in, check role-based access for dashboard
      const role = user?.role?.toLowerCase();
      
      if (pathname.startsWith("/dashboard")) {
        // If they are at /dashboard (base), redirect to their specific dashboard
        if (pathname === "/dashboard") {
          router.replace(`/dashboard/${role}`);
          return;
        }

        // Prevent cross-role access (e.g., patient trying to access /dashboard/admin)
        const pathSegments = pathname.split("/");
        const requestedRole = pathSegments[2]; // /dashboard/[role]/...

        if (requestedRole && requestedRole !== role) {
          router.replace(`/dashboard/${role}`);
          return;
        }
      }

      // If they are on login/register while logged in, redirect to dashboard
      if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        router.replace(`/dashboard/${role}`);
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, isAuthenticated, pathname, router]);

  if (loading || (!isAuthorized && !pathname.startsWith("/login") && !pathname.startsWith("/register") && pathname !== "/")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSkeleton type="page" />
      </div>
    );
  }

  return <>{children}</>;
}
