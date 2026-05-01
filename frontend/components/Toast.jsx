"use client";

import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import { useState, useEffect } from "react";

let toastFn = null;

export const showToast = (message, type = "success") => {
  if (toastFn) toastFn(message, type);
};

export default function ToastContainer() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    toastFn = (message, type) => {
      setToast({ message, type, id: Date.now() });
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
    error: "border-red-100 bg-red-50 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    info: "border-blue-100 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fadeInUp">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md min-w-[300px] max-w-md ${bgColors[toast.type]}`}>
        <div className="shrink-0">{icons[toast.type]}</div>
        <div className="flex-1 text-sm font-medium">{toast.message}</div>
        <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
