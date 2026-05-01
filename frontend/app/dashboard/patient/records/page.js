"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, X, Loader2, Search, AlertCircle } from "lucide-react";
import api, { getList } from "../../../../src/services/api";

const RECORD_TYPE_COLORS = {
  PRESCRIPTION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  LAB_RESULT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DIAGNOSIS: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  REPORT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function PatientRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchRecords = async () => {
    try {
      const data = await getList("/api/patients/medical-records/");
      setRecords(data);
    } catch (e) {
      console.error("Failed to fetch records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const filtered = records.filter(r =>
    (r.diagnosis || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.symptoms || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.record_type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-primary-500 to-blue-400 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-2 relative z-10 flex items-center gap-3">
          <FileText size={30} /> Medical Records
        </h1>
        <p className="text-primary-100 relative z-10">Your complete health history in one place.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by diagnosis, symptoms, type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 w-full max-w-md"
        />
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={24} /> Loading records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">No medical records found.</p>
          <p className="text-sm mt-1">Your doctor will add records after consultations.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(record => {
            const colorClass = RECORD_TYPE_COLORS[record.record_type] || RECORD_TYPE_COLORS.REPORT;
            return (
              <div
                key={record.id}
                onClick={() => setSelected(record)}
                className="card cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                    {(record.record_type || "REPORT").replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">{record.date_added || "—"}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {record.diagnosis || "No Diagnosis"}
                </h3>
                {record.symptoms && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {record.symptoms}
                  </p>
                )}
                {record.file && (
                  <a
                    href={record.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-bold mt-3 hover:underline"
                  >
                    <FileText size={12} /> View Attachment
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 animate-fadeInUp">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${RECORD_TYPE_COLORS[selected.record_type] || RECORD_TYPE_COLORS.REPORT}`}>
                  {(selected.record_type || "REPORT").replace("_", " ")}
                </span>
                <span className="text-sm text-slate-400">{selected.date_added}</span>
              </div>
              {selected.diagnosis && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Diagnosis</p>
                  <p className="text-slate-900 dark:text-white font-medium">{selected.diagnosis}</p>
                </div>
              )}
              {selected.symptoms && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Symptoms</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{selected.symptoms}</p>
                </div>
              )}
              {selected.treatment && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Treatment</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{selected.treatment}</p>
                </div>
              )}
              {selected.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{selected.notes}</p>
                </div>
              )}
              {selected.file && (
                <a
                  href={selected.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                >
                  <FileText size={16} /> View Attached File
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
