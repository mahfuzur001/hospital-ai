"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, LayoutDashboard, CalendarDays, Users, LogOut,
  Settings, MessageSquareText, ClipboardList, Stethoscope, X
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { logout } from "../src/services/api";

const navConfig = {
  patient: [
    { name: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    { name: "My Appointments", href: "/dashboard/patient/appointments", icon: CalendarDays },
    { name: "Medical Records", href: "/dashboard/patient/records", icon: ClipboardList },
    { name: "AI Consultation", href: "/chat", icon: MessageSquareText },
    { name: "Settings", href: "/dashboard/patient/settings", icon: Settings },
  ],
  doctor: [
    { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
    { name: "My Schedule", href: "/dashboard/doctor/schedule", icon: CalendarDays },
    { name: "My Patients", href: "/dashboard/doctor/patients", icon: Users },
    { name: "Settings", href: "/dashboard/doctor/settings", icon: Settings },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Manage Doctors", href: "/dashboard/admin/doctors", icon: Stethoscope },
    { name: "Manage Staff", href: "/dashboard/admin/staff", icon: Users },
    { name: "Manage Patients", href: "/dashboard/admin/patients", icon: Users },
    { name: "Manage Appointments", href: "/dashboard/admin/appointments", icon: CalendarDays },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  staff: [
    { name: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
    { name: "Settings", href: "/dashboard/staff/settings", icon: Settings },
  ],
};

export default function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const navLinks = role && navConfig[role] ? navConfig[role] : [];

  const handleLogout = () => { logout(); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary-500 text-white p-1.5 rounded-lg shadow-md shadow-primary-500/20">
            <Activity size={20} />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            SmartHospital
          </span>
        </Link>
        {/* Close button only on mobile */}
        <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
          <X size={20} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          {role || "User"} Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 flex flex-col animate-slideIn shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
