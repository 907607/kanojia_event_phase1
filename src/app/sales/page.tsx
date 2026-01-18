"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SalesExhibitionSelect() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sales/exhibitions")
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API Error ${res.status}: ${text}`);
        }
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }
      })
      .then((data) => {
        console.log("Exhibitions Data:", data);
        if (Array.isArray(data)) {
          setExhibitions(data);
        } else {
          console.error("Data is not an array:", data);
          setDebugError("Received invalid data format");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setDebugError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: string) => {
    router.push(`/sales/${id}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Active Exhibitions
          </h2>
          <p className="text-slate-500 mt-2 text-base">
            Select an event below to access the sales terminal.
          </p>
        </div>
      </div>

      {debugError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 shadow-sm">
          <svg
            className="w-5 h-5 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-sm">Connection Error</h3>
            <p className="text-sm opacity-90">{debugError}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-48 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-5 w-12 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-10 bg-slate-100 rounded-lg w-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
          <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            No active exhibitions
          </h3>
          <p className="text-slate-500 mt-1">
            There are no events scheduled for today.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitions.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelect(ex.id)}
              className="group relative flex flex-col justify-between bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-200 text-left overflow-hidden ring-1 ring-transparent focus:outline-none focus:ring-blue-500"
            >
              {/* Colored Accent Line */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:bg-blue-600 transition-colors" />

              <div className="p-6 w-full">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                    {ex.name}
                  </h3>
                  <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                    <div className="w-8 flex justify-center">
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">{ex.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                    <div className="w-8 flex justify-center">
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span>
                      {new Date(ex.startDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-700">
                  Open Dashboard
                </span>
                <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
