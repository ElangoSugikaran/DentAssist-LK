import AdminDashboardClient from "./AdminDashboardClient";

async function AdminPage() {
  // Admin access is already verified in layout.tsx
  // This page is only accessible to authenticated admins
  return <AdminDashboardClient />;
}

export default AdminPage;
