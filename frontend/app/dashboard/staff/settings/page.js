"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle, User } from "lucide-react";
import api from "../../../../src/services/api";

export default function StaffSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", mobile_number: "", address: "",
  });
  const [profileForm, setProfileForm] = useState({ department: "", designation: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/accounts/profile/");
        const data = res.data;
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          mobile_number: data.mobile_number || "",
          address: data.address || "",
        });
        if (data.profile_details) {
          setProfileForm({
            department: data.profile_details.department || "",
            designation: data.profile_details.designation || "",
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/accounts/profile/", { ...form, profile_details: profileForm });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="animate-spin mr-2" size={24} /> Loading...
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-400 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3"><Settings size={28} /> Account Settings</h1>
        <p className="text-emerald-100">Manage your profile and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Info */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><User size={18} /> Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">First Name</label>
                <input className="input-field" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Last Name</label>
                <input className="input-field" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile Number</label>
              <input className="input-field" value={form.mobile_number} onChange={e => setForm({...form, mobile_number: e.target.value})} placeholder="+880..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address</label>
              <textarea className="input-field resize-none" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Work Info */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Work Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Department</label>
              <input className="input-field" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} placeholder="e.g. Reception" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Designation</label>
              <input className="input-field" value={profileForm.designation} onChange={e => setProfileForm({...profileForm, designation: e.target.value})} placeholder="e.g. Manager" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-3 px-6">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
