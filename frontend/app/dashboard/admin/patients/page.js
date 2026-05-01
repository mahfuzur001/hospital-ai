"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, AlertCircle, CheckCircle, RefreshCw, Trash2, Edit2, Search } from "lucide-react";
import api, { getList } from "../../../../src/services/api";
import LoadingSkeleton from "../../../../components/LoadingSkeleton";
import { showToast } from "../../../../components/Toast";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getList("/api/accounts/patients/");
      setPatients(data);
    } catch (e) {
      console.error("Failed to fetch patients", e);
      showToast("Failed to fetch patients list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this patient account? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/accounts/admin/manage-user/${userId}/`);
      showToast("Patient deleted successfully", "success");
      fetchPatients();
    } catch (err) {
      showToast("Failed to delete patient", "error");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user.first_name + " " + p.user.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 relative z-10">
          <Users size={30} /> Manage Patients
        </h1>
        <p className="text-emerald-100 relative z-10">View and manage hospital patient accounts.</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, username or email..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchPatients} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Users size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-medium">No patients found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Age/Gender</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                          {p.user.first_name?.[0] || p.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white leading-tight">
                            {p.user.first_name} {p.user.last_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">@{p.user.username}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{p.user.email}</p>
                      <p className="text-xs text-slate-500">{p.user.mobile_number || "No phone"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {p.age || "N/A"} / {p.gender || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all" title="Edit Profile">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" 
                          title="Delete Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
