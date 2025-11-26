"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="min-h-screen bg-background font-sans antialiased">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <Card className="w-full max-w-md p-8 text-center border-destructive/20 bg-card/50 backdrop-blur-sm">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-2 text-foreground">Critical Error</h2>
                        <p className="text-muted-foreground mb-8">
                            A critical system error has occurred. Please try refreshing the page.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => reset()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Try again
                            </Button>
                        </div>
                    </Card>
                </div>
            </body>
        </html>
    );
}
