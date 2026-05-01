"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle } from "lucide-react";
import api from "../../../../src/services/api";

export default function DoctorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", mobile_number: "" });
  const [doctorForm, setDoctorForm] = useState({ speciality: "", experience: "", consultation_fee: "", qualification: "", hospital_name: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/accounts/profile/");
        const data = res.data;
        setForm({ first_name: data.first_name || "", last_name: data.last_name || "", email: data.email || "", mobile_number: data.mobile_number || "" });
        if (data.profile_details) {
          setDoctorForm({
            speciality: data.profile_details.speciality || "",
            experience: data.profile_details.experience || "",
            consultation_fee: data.profile_details.consultation_fee || "",
            qualification: data.profile_details.qualification || "",
            hospital_name: data.profile_details.hospital_name || "",
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
      await api.patch("/api/accounts/profile/", { ...form, profile_details: doctorForm });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={24} /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3"><Settings size={28} /> Doctor Settings</h1>
        <p className="text-slate-300">Update your profile and professional information.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Personal Info</h2>
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile</label>
              <input className="input-field" value={form.mobile_number} onChange={e => setForm({...form, mobile_number: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Professional Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Speciality</label>
                <input className="input-field" placeholder="e.g. Cardiology" value={doctorForm.speciality} onChange={e => setDoctorForm({...doctorForm, speciality: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Experience (years)</label>
                <input type="number" className="input-field" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Consultation Fee (৳)</label>
                <input type="number" className="input-field" value={doctorForm.consultation_fee} onChange={e => setDoctorForm({...doctorForm, consultation_fee: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Qualification</label>
                <input className="input-field" placeholder="e.g. MBBS, MD" value={doctorForm.qualification} onChange={e => setDoctorForm({...doctorForm, qualification: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hospital Name</label>
              <input className="input-field" value={doctorForm.hospital_name} onChange={e => setDoctorForm({...doctorForm, hospital_name: e.target.value})} />
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
