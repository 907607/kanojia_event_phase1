"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { generateSalesmanPDF } from "@/lib/pdfGenerator";

export default function SalesmanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [salesman, setSalesman] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/salesmen/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          router.push("/admin/salesmen");
          return;
        }
        setSalesman(data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const downloadPDF = () => {
    if (!salesman) return;

    const reportData = {
      salesman: {
        username: salesman.username,
        createdAt: salesman.createdAt,
      },
      stats: salesman.stats,
      orders: salesman.orders || [],
    };

    const doc = generateSalesmanPDF(reportData);
    doc.save(`Salesman_${salesman.username}_Report.pdf`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading Profile...</p>
        </div>
      </div>
    );

  if (!salesman)
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900">
          Salesman not found
        </h2>
        <Link
          href="/admin/salesmen"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Return to list
        </Link>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <Link
            href="/admin/salesmen"
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
            Back to Salesmen
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
              {salesman.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {salesman.username}
              </h1>
              <p className="text-slate-500 mt-1">
                Joined on {new Date(salesman.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95 font-medium"
          >
            <svg
              className="w-5 h-5 text-slate-300"
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
            Export Performance Report
          </button>
        </div>
      </div>

      {/* Status & Assignment Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Account Status
            </h3>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${
                  salesman.isActive
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${salesman.isActive ? "bg-green-500" : "bg-red-500"}`}
                />
                {salesman.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 md:pt-0 md:pl-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Current Assignment
            </h3>
            {salesman.assignedExhibition ? (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {salesman.assignedExhibition.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {salesman.assignedExhibition.city} •{" "}
                    <span className="font-medium text-blue-600">
                      {salesman.assignedExhibition.status}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 italic">
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Not currently assigned
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              ₹{salesman.stats.totalRevenue.toLocaleString()}
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

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {salesman.stats.totalOrders}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Order Value
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              ₹{Math.round(salesman.stats.avgOrderValue).toLocaleString()}
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-lg">Sales History</h3>
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
                  Exhibition
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!salesman.orders || salesman.orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No sales records found for this user.
                  </td>
                </tr>
              ) : (
                salesman.orders.map((order: any) => (
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
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.productName}
                      <span className="text-slate-400 text-xs ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded">
                        x{order.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.exhibition?.name || (
                        <span className="text-slate-400 italic">
                          Unknown Event
                        </span>
                      )}
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
