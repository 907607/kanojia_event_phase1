"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { generateExhibitionPDF } from "@/lib/pdfGenerator";

export default function ExhibitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [exhibition, setExhibition] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/exhibitions/${id}`).then((res) => res.json()),
      fetch(`/api/orders?exhibitionId=${id}`).then((res) => res.json()),
    ])
      .then(([expoData, ordersData]) => {
        if (expoData.error) {
          alert(expoData.error);
          router.push("/admin/exhibitions");
          return;
        }
        setExhibition(expoData);
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.paymentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.salesman?.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const downloadPDF = () => {
    if (!exhibition) return;

    const reportData = {
      exhibition: {
        name: exhibition.name,
        city: exhibition.city,
        startDate: exhibition.startDate,
        endDate: exhibition.endDate,
        status: exhibition.status,
      },
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      },
      orders: filteredOrders,
    };

    const doc = generateExhibitionPDF(reportData);
    doc.save(`Exhibition_${exhibition.name.replace(/\s+/g, "_")}_Report.pdf`);
  };

  const downloadCSV = () => {
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Product",
      "Quantity",
      "Amount",
      "Salesman",
      "Payment Ref",
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toISOString(),
      o.customerName,
      o.customerPhone,
      o.productName,
      o.quantity,
      o.totalAmount,
      o.salesman?.username || "Unknown",
      o.paymentRef,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exhibition_report_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading Report...</p>
        </div>
      </div>
    );

  if (!exhibition)
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900">
          Exhibition not found
        </h2>
        <Link
          href="/admin/exhibitions"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Return to list
        </Link>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <Link
            href="/admin/exhibitions"
            className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-3"
          >
            <svg
              className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Exhibitions
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {exhibition.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-slate-500">
            <span className="flex items-center gap-1.5">
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
              {exhibition.city}
            </span>
            <span>•</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                            ${
                              exhibition.status === "LIVE"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : exhibition.status === "PLANNING"
                                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
            >
              {exhibition.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors shadow-sm font-medium text-sm"
          >
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-sm font-medium text-sm"
          >
            <svg
              className="w-4 h-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              ₹{totalRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {orders.length}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Order Value
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              ₹
              {orders.length > 0
                ? Math.round(totalRevenue / orders.length).toLocaleString()
                : 0}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 text-lg">
            Detailed Order Report
          </h3>
          <div className="relative w-full sm:w-72">
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
              placeholder="Search by customer, ref, or salesman..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Customer
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Product
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                  Amount
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Salesman
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No orders match your search filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.customerName}
                      <div className="text-xs text-slate-400 font-normal">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {order.productName}
                      <span className="text-slate-400 text-xs ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded">
                        x{order.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {order.salesman?.username.charAt(0).toUpperCase()}
                        </div>
                        {order.salesman?.username}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {order.paymentRef}
                      </span>
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
