"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/exhibitions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setExhibitions(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            CLOSED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Exhibitions
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your furniture exhibitions and events.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/exhibitions/create")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 w-full sm:w-auto"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Exhibition
        </button>
      </div>

      {/* --- VIEW 1: MOBILE CARDS (Visible on Mobile) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-40 animate-pulse"
            />
          ))
        ) : exhibitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No exhibitions found.</p>
          </div>
        ) : (
          exhibitions.map((ex) => (
            <div
              key={ex.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                    <svg
                      className="w-4 h-4"
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
                    {ex.city}
                  </div>
                </div>
                <div className="shrink-0">{getStatusBadge(ex.status)}</div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="text-xs text-slate-500 font-medium">
                  {new Date(ex.startDate).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </div>
                <button
                  onClick={() => router.push(`/admin/exhibitions/${ex.id}`)}
                  className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Manage Event
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- VIEW 2: DESKTOP TABLE (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                <th className="px-6 py-4 font-semibold text-slate-700">City</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 w-48 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-24 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-32 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-5 w-12 bg-slate-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : exhibitions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-900 font-medium">
                        No exhibitions found
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        Get started by creating your first event.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                exhibitions.map((ex) => (
                  <tr
                    key={ex.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {ex.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ex.city}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {new Date(ex.startDate).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ex.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          router.push(`/admin/exhibitions/${ex.id}`)
                        }
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
