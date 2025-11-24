"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("order_id");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="mt-2">
            Your payment was cancelled. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Order ID: <code className="text-xs">{orderId}</code>
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/plan")} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

