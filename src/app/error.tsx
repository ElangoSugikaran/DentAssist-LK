"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md p-8 text-center border-destructive/20 bg-card/50 backdrop-blur-sm">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-foreground">Something went wrong!</h2>
                <p className="text-muted-foreground mb-8">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                <div className="flex gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                    >
                        Go Home
                    </Button>
                    <Button
                        onClick={() => reset()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Try again
                    </Button>
                </div>

                {process.env.NODE_ENV === "development" && (
                    <div className="mt-8 p-4 rounded-md bg-muted/50 text-left overflow-auto max-h-40 text-xs font-mono">
                        <p className="font-bold text-destructive mb-1">Error Details:</p>
                        {error.message}
                    </div>
                )}
            </Card>
        </div>
    );
}
