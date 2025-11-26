"use client";

import { syncUser } from "@/lib/actions/users";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

function UserSync() {
    const { isSignedIn, isLoaded, user } = useUser();
    const isSynced = useRef(false);

    useEffect(() => {
        const handleUserSync = async () => {
            if (isLoaded && isSignedIn && user && !isSynced.current) {
                try {
                    isSynced.current = true;
                    await syncUser();
                } catch (error) {
                    // Silent fail or handle via global error boundary
                    console.error("User sync failed:", error);
                    // Optional: reset isSynced to false if you want to retry, 
                    // but for infinite loop prevention, keeping it true is safer.
                }
            }
        };
        handleUserSync();
    }, [isSignedIn, isLoaded, user]);

    return null;
}

export default UserSync;