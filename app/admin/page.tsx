import type { Metadata } from "next"

import AdminDashboard from "@/components/admin/dashboard"
import RequireAdmin from "./RequireAdmin"

export const metadata: Metadata = {
  title: "Admin Dashboard | Noctael",
  description: "Manage your Noctael store.",
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  )
}
