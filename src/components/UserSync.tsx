"use client";

import { syncUser } from "@/lib/actions/users";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

function UserSync() {
    const { isSignedIn, isLoaded, user } = useUser();

    useEffect(() => {
        const handleUserSync = async () => {
            if (isLoaded && isSignedIn && user) {
                try {
                    console.log("🔄 UserSync: Syncing user with clerkId:", user.id);
                    const result = await syncUser();
                    console.log("✅ UserSync: User synced successfully:", result);
                } catch (error) {
                    console.error("❌ UserSync: Failed to sync user:", error);
                }
            } else {
                console.log("⏳ UserSync: Waiting for user to load... isLoaded:", isLoaded, "isSignedIn:", isSignedIn);
            }
        };
        handleUserSync();
    }, [isSignedIn, isLoaded, user]);

    return null;
}

export default UserSync;