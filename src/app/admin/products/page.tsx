"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    basePrice: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = () => {
    setPageLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: "", sku: "", basePrice: "", imageUrl: "" });
      setShowForm(false);
      fetchProducts();
    } else {
      alert("Failed to create product");
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p)),
    );

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      fetchProducts();
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      basePrice: product.basePrice.toString(),
      imageUrl: product.imageUrl || "",
    });
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setEditingId(null);
      setFormData({ name: "", sku: "", basePrice: "", imageUrl: "" });
      fetchProducts();
    } else {
      alert("Failed to update product");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", sku: "", basePrice: "", imageUrl: "" });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your furniture catalog and pricing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
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
              placeholder="Search product or SKU..."
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
            {showForm ? (
              "Cancel"
            ) : (
              <>
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
                Add Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Add New Product</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Royal Oak Sofa"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  SKU Code
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="e.g. SF-001"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg active:scale-95 disabled:opacity-70"
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- VIEW 1: DESKTOP TABLE --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Product
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">SKU</th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Price
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-10 w-48 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {editingId === p.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            className="input-table"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            className="input-table"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData({ ...formData, sku: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            className="input-table"
                            value={formData.basePrice}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                basePrice: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4 opacity-50">
                          <span className="text-xs text-slate-400">Locked</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => saveEdit(p.id)}
                            className="text-green-600 font-medium hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-slate-500 font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-slate-400">
                                  IMG
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-slate-900">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {p.sku}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{p.basePrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(p.id, p.isActive)}
                            className={`badge ${p.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-green-500" : "bg-red-500"}`}
                            />
                            {p.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => startEdit(p)}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW 2: MOBILE CARDS --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {pageLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-48 animate-pulse"
              />
            ))
          : filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4"
              >
                {editingId === p.id ? (
                  // Mobile Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        Name
                      </label>
                      <input
                        type="text"
                        className="input-table w-full mt-1"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          SKU
                        </label>
                        <input
                          type="text"
                          className="input-table w-full mt-1"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          Price
                        </label>
                        <input
                          type="number"
                          className="input-table w-full mt-1"
                          value={formData.basePrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              basePrice: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={cancelEdit}
                        className="text-slate-500 font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(p.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mobile View Mode
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">IMG</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{p.name}</h3>
                          <p className="text-xs font-mono text-slate-500">
                            {p.sku}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(p.id, p.isActive)}
                        className={`badge ${p.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                      <span className="text-lg font-bold text-slate-900">
                        ₹{p.basePrice.toLocaleString()}
                      </span>
                      <button
                        onClick={() => startEdit(p)}
                        className="text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-lg"
                      >
                        Edit Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
      </div>

      <style jsx>{`
        .input-table {
          @apply w-full px-2 py-1 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none;
        }
        .badge {
          @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all;
        }
      `}</style>
    </div>
  );
}
