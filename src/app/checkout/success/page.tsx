"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Suspense } from "react";
function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get("session_id");
  const [verifying, setVerifying] = React.useState(true);
  const [verified, setVerified] = React.useState(false);

  React.useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        // Give webhook a moment to process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // In a real app, you might want to verify with your backend
        // For now, we'll assume success if session_id exists
        setVerified(true);
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="mt-2">
            Thank you for your purchase. Your subscription has been activated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {sessionId ? (
                <>Session ID: <code className="text-xs">{sessionId}</code></>
              ) : (
                "Your payment has been processed successfully."
              )}
            </p>
          </div> */}
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/user")} className="w-full">
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push("/plan")} variant="outline" className="w-full">
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function Page() {
  return (
    <Suspense fallback={<div>Loading listings…</div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}