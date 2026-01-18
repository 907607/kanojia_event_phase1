"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SalesmenPage() {
  const router = useRouter();
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  // UI States
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Assignment Modal State
  const [assignModal, setAssignModal] = useState<{
    show: boolean;
    salesmanId: string;
    currentExhibitionId: string | null;
  }>({
    show: false,
    salesmanId: "",
    currentExhibitionId: null,
  });

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const [salesmenRes, exhibitionsRes] = await Promise.all([
        fetch("/api/admin/salesmen"),
        fetch("/api/exhibitions"),
      ]);

      const salesmenData = await salesmenRes.json();
      const exhibitionsData = await exhibitionsRes.json();

      if (Array.isArray(salesmenData)) setSalesmen(salesmenData);
      if (Array.isArray(exhibitionsData)) setExhibitions(exhibitionsData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSalesmen = salesmen.filter(
    (s) =>
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.assignedExhibition?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/salesmen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ username: "", password: "" });
      setShowForm(false);
      fetchData();
    } else {
      alert("Failed to create salesman");
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setSalesmen((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s)),
    );
    const res = await fetch(`/api/admin/salesmen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    if (!res.ok) {
      alert("Failed to update status");
      fetchData();
    }
  };

  const assignExhibition = async (exhibitionId: string | null) => {
    const res = await fetch(`/api/admin/salesmen/${assignModal.salesmanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedExhibitionId: exhibitionId }),
    });

    if (res.ok) {
      setAssignModal({
        show: false,
        salesmanId: "",
        currentExhibitionId: null,
      });
      fetchData();
    } else {
      alert("Failed to assign exhibition");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Salesmen
          </h1>
          <p className="mt-2 text-slate-500">Manage your sales team.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-lg active:scale-95 whitespace-nowrap ${
              showForm
                ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {showForm ? "Cancel" : "+ Add Salesman"}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Create Account</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg active:scale-95 disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- VIEW 1: DESKTOP TABLE (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Salesman
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Assignment
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700">Joined</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageLoading
              ? [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              : filteredSalesmen.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${user.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {user.assignedExhibition ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {user.assignedExhibition.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          setAssignModal({
                            show: true,
                            salesmanId: user.id,
                            currentExhibitionId:
                              user.assignedExhibition?.id || null,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* --- VIEW 2: MOBILE CARDS (Visible on Mobile) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {pageLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-pulse h-32"
              />
            ))
          : filteredSalesmen.map((user: any) => (
              <div
                key={user.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {user.username}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStatus(user.id, user.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">
                      Current Assignment
                    </p>
                    <p className="font-medium text-slate-900">
                      {user.assignedExhibition?.name || "Unassigned"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAssignModal({
                        show: true,
                        salesmanId: user.id,
                        currentExhibitionId:
                          user.assignedExhibition?.id || null,
                      })
                    }
                    className="text-sm font-semibold text-blue-600 bg-white px-3 py-1.5 rounded border border-blue-100 shadow-sm"
                  >
                    Change
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Assignment Modal */}
      {assignModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                Assign Exhibition
              </h3>
              <button
                onClick={() =>
                  setAssignModal({
                    show: false,
                    salesmanId: "",
                    currentExhibitionId: null,
                  })
                }
                className="text-slate-400 hover:text-slate-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              <button
                onClick={() => assignExhibition(null)}
                className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all group"
              >
                <div className="font-semibold text-slate-700 group-hover:text-red-700">
                  Unassign Current Exhibition
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Remove salesman from active duties
                </div>
              </button>
              <div className="border-t border-slate-100 my-2 pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Available Events
                </p>
                {exhibitions.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => assignExhibition(ex.id)}
                    className={`w-full text-left px-4 py-3 mb-2 rounded-xl border transition-all flex justify-between items-center ${assignModal.currentExhibitionId === ex.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
                  >
                    <div>
                      <div
                        className={`font-semibold ${assignModal.currentExhibitionId === ex.id ? "text-blue-700" : "text-slate-900"}`}
                      >
                        {ex.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {ex.city}
                      </div>
                    </div>
                    {assignModal.currentExhibitionId === ex.id && (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
