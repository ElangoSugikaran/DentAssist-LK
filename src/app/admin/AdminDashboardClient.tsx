"use client"

import Navbar from "@/components/Navbar"
import { useGetDoctors } from "@/hooks/use-doctors";
import { useGetAppointments } from "@/hooks/use-appointments";
import { useUser } from "@clerk/nextjs";
import { ShieldIcon, AlertCircle } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";
import DoctorsManagement from "@/components/admin/DoctorsManagement";
import RecentAppointments from "@/components/admin/RecentAppointments";
import { Alert, AlertDescription } from "@/components/ui/alert";

function AdminDashboardClient() {
  const { user } = useUser();
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctors();
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetAppointments();

  // Check if user has admin role from Clerk metadata (check both public and unsafe)
  interface ClerkMetadata {
    role?: string;
  }
  const isAdminVerified = 
    (user?.publicMetadata as ClerkMetadata | undefined)?.role === "admin";

  // calculate stats from real data
  const stats = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter((doc) => doc.isActive).length,
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter((app) => app.status === "COMPLETED").length,
  };

  if (doctorsLoading || appointmentsLoading) return <LoadingUI />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* ADMIN ROLE VERIFICATION ALERT */}
        {!isAdminVerified && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Admin role not verified in Clerk metadata. Please ensure your Clerk account has the admin role set.
            </AlertDescription>
          </Alert>
        )}

        {/* ADMIN WELCOME SECTION */}
        <div className="mb-12 flex items-center justify-between bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <ShieldIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Admin Portal</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome, {user?.firstName || "Admin"}!
              </h1>
              <p className="text-muted-foreground">
                Manage doctors, oversee appointments, and monitor your dental practice performance.
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <ShieldIcon className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <AdminStats
          totalDoctors={stats.totalDoctors}
          activeDoctors={stats.activeDoctors}
          totalAppointments={stats.totalAppointments}
          completedAppointments={stats.completedAppointments}
        />

        {/* MANAGEMENT SECTIONS */}
        <DoctorsManagement />
        <RecentAppointments />
      </div>
    </div>
  )
}

export default AdminDashboardClient;

function LoadingUI() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
