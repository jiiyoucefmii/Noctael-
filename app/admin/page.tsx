import type { Metadata } from "next"

import AdminDashboard from "@/components/admin/dashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard | Noctael",
  description: "Manage your Noctael store.",
}

export default function AdminPage() {
  return <AdminDashboard />
}
