"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Activity, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary-500 text-white p-1.5 rounded-lg group-hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              Smart<span className="text-primary-500">Hospital</span>
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-300"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="transition-transform rotate-0 hover:rotate-90 duration-500" />
                ) : (
                  <Moon size={20} className="transition-transform rotate-0 hover:-rotate-12 duration-500" />
                )}
              </button>
            )}

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors">
                Log in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-800 mt-2 pt-4 space-y-3 animate-fadeInUp">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-primary-500 transition-colors">
              Log in
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="block text-center btn-primary py-2.5">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
