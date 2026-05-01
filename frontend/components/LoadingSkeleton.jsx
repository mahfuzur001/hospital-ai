"use client";

export default function LoadingSkeleton({ type = "card", count = 1 }) {
  const items = Array.from({ length: count });

  if (type === "page") {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="h-40 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800" />
      ))}
    </div>
  );
}
