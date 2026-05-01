"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, User, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function DashboardHeader({ onMenuToggle }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Hamburger for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="hidden md:block" /> {/* Spacer */}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={20} className="transition-transform hover:rotate-90 duration-500" />
            ) : (
              <Moon size={20} className="transition-transform hover:-rotate-12 duration-500" />
            )}
          </button>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
            {user?.username?.[0]?.toUpperCase() || <User size={16} />}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-slate-900 dark:text-white leading-none">
              {user?.username || "Loading..."}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 capitalize text-xs">
              {user?.role?.toLowerCase() || "User"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
