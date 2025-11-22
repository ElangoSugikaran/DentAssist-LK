// filepath: src/app/admin/layout.tsx
import { ReactNode } from "react";
import { checkAdminAccess } from "@/lib/actions/admin-check";

export const metadata = {
  title: "Admin Dashboard - DentAssist LK",
  description: "Admin panel for managing doctors and appointments",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Verify admin access on layout level (protects entire /admin route)
  await checkAdminAccess();

  return <>{children}</>;
}
