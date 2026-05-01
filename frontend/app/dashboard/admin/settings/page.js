"use client";
import { Settings } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/src/services/api";


export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3"><Settings size={28} /> System Settings</h1>
        <p className="text-slate-300">Configure hospital system settings.</p>
      </div>
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Admin Actions</h2>
        <div className="space-y-3">
          <Link href="/dashboard/admin/doctors" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition-colors">
            <span className="font-medium text-slate-900 dark:text-white">Manage Doctors</span>
            <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">Open →</span>
          </Link>
          <Link href="/dashboard/admin/staff" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition-colors">
            <span className="font-medium text-slate-900 dark:text-white">Manage Staff</span>
            <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">Open →</span>
          </Link>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-medium text-slate-900 dark:text-white">Django Admin Panel</span>
              <p className="text-xs text-slate-400 mt-0.5">Full system administration</p>
            </div>
            <a href={`${API_URL}/admin/`} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline">Open ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}
