"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle, User, Lock } from "lucide-react";
import api from "../../../../src/services/api";

export default function PatientSettingsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", mobile_number: "", address: "" });
  const [profileForm, setProfileForm] = useState({ age: "", gender: "", blood_group: "", medical_history: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/accounts/profile/");
        const data = res.data;
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          mobile_number: data.mobile_number || "",
          address: data.address || "",
        });
        if (data.profile_details) {
          setProfileForm({
            age: data.profile_details.age || "",
            gender: data.profile_details.gender || "",
            blood_group: data.profile_details.blood_group || "",
            medical_history: data.profile_details.medical_history || "",
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
      const payload = { 
        ...form, 
        profile_details: { 
          ...profileForm, 
          age: profileForm.age === "" ? null : parseInt(profileForm.age) 
        } 
      };
      await api.patch("/api/accounts/profile/", payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" size={24} /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3"><Settings size={28} /> Account Settings</h1>
        <p className="text-primary-100">Manage your profile and preferences.</p>
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

        {/* Medical Info */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Medical Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Age</label>
                <input type="number" className="input-field" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Gender</label>
                <select className="input-field" value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Blood Group</label>
                <select className="input-field" value={profileForm.blood_group} onChange={e => setProfileForm({...profileForm, blood_group: e.target.value})}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Medical History</label>
              <textarea className="input-field resize-none" rows={3} value={profileForm.medical_history} onChange={e => setProfileForm({...profileForm, medical_history: e.target.value})} placeholder="Any known conditions, allergies, past surgeries..." />
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
