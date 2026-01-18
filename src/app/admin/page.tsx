import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  const user = verifyToken(token);
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* STATE MANAGER: Hidden Checkbox 
        Controls the sidebar toggle without JavaScript.
      */}
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />

      {/* MOBILE HEADER (Visible only on Mobile)
        Theme: White background, Dark text
      */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-slate-900">Admin Panel</span>
        </div>
        {/* Toggle Button (Hamburger) */}
        <label
          htmlFor="sidebar-toggle"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
      </div>

      {/* MOBILE OVERLAY 
        Darkens screen when menu is open on mobile.
      */}
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 bg-slate-900/50 z-40 hidden peer-checked:block md:peer-checked:hidden backdrop-blur-sm transition-opacity"
      />

      {/* SIDEBAR NAVIGATION
        Theme: Dark (bg-slate-900) for Desktop
        Behavior: Slides in on Mobile, Fixed on Desktop
      */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out -translate-x-full peer-checked:translate-x-0 md:translate-x-0">
        <div className="flex flex-col h-full p-6">
          {/* Desktop Brand Logo */}
          <div className="hidden md:flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                Admin Panel
              </h2>
              <p className="text-xs text-slate-400">Furniture Shoppe</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <div className="md:hidden flex justify-end mb-6">
            <label
              htmlFor="sidebar-toggle"
              className="p-2 text-slate-400 hover:text-white cursor-pointer"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </label>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/exhibitions"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors"
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
              <span className="font-medium">Exhibitions</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="font-medium">Products</span>
            </Link>

            <Link
              href="/admin/salesmen"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-green-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium">Salesmen</span>
            </Link>
          </nav>

          {/* User Profile */}
          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-slate-400 truncate">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT
        Fix: md:ml-64 ensures margin is only on desktop.
        Fix: pt-20 ensures content isn't hidden under mobile header.
      */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 min-h-screen pt-20 md:pt-8 transition-all">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
