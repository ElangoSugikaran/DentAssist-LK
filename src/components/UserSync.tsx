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
                    await syncUser();
                } catch (error) {
                    // Silent fail or handle via global error boundary
                }
            }
        };
        handleUserSync();
    }, [isSignedIn, isLoaded, user]);

    return null;
}

export default UserSync;