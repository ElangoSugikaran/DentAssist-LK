import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md p-8 text-center border-border bg-card/50 backdrop-blur-sm">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-muted text-muted-foreground">
                        <FileQuestion className="w-12 h-12" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-foreground">Page Not Found</h2>
                <p className="text-muted-foreground mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
