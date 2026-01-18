import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
// Import the Client Shell we just made
import AdminShell from "./components/AdminShell";

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

  return <AdminShell user={user}>{children}</AdminShell>;
}
