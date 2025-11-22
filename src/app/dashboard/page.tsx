import ActivityOverview from "@/components/dashboard/ActivityOverview"
import MainActions from "@/components/dashboard/MainActions"
import WelcomeSection from "@/components/dashboard/WelcomeSection"
import Navbar from "@/components/Navbar"
import { currentUser } from "@clerk/nextjs/server"
import { waitForUserInDatabase } from "@/lib/actions/wait-for-user"
import { redirect } from "next/navigation"


async function DashboardPage() {
  // Ensure user is logged in
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect('/');
  }

  // Wait for user to be synced to database (max 10 seconds with faster checks)
  // This handles the case where dashboard loads before UserSync component completes
  const dbUser = await waitForUserInDatabase(clerkUser.id, 10000, 50);
  if (!dbUser) {
    // If user still not in database after waiting, show error UI
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Account Setup In Progress</h2>
            <p className="text-red-500/80 mb-4">
              Your account is being set up. This usually takes a few seconds.
            </p>
            <p className="text-red-500/70 text-sm">
              Please refresh this page to continue. If the issue persists, try signing out and back in.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
     <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
      </div>
    </>
  )
}

export default DashboardPage
