"use client";

import * as React from "react";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
import PlanCard, { type Plan } from "@/components/plans/PlanCard";

type PlansResponse = {
  items: Plan[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export default function PublicPlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const planIdParam = searchParams?.get("select");
    if (planIdParam) {
      setSelectedPlanId(Number(planIdParam));
    }
  }, [searchParams]);

  React.useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await api<PlansResponse>("/api/plans?pageSize=100");
        setPlans(res.items || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = React.useCallback(
    (planId: number) => {
      // TODO: Implement payment/checkout flow
      toast.info("Payment integration coming soon. Please contact support to subscribe.");
      // router.push(`/checkout?planId=${planId}`);
    },
    []
  );

  if (loading) {
    return (
      <div className="relative min-h-[600px]">
        <LoaderOverlay label="Loading plans..." />
      </div>
    );
  }

  // Sort plans: featured first, then by price
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    const priceA = typeof a.price === "number" ? a.price : Number(a.price);
    const priceB = typeof b.price === "number" ? b.price : Number(b.price);
    return priceA - priceB;
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Choose Your Plan
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Pricing Plans
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Select the perfect plan for your needs. All plans include powerful features to help you
              manage and grow your listings.
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container mx-auto px-4 py-12 sm:px-6">
        {sortedPlans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No Plans Available</CardTitle>
              <CardDescription>Plans are currently being updated. Please check back later.</CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={selectedPlanId === plan.id}
                onSelect={handleSelectPlan}
                buttonText="Get Started"
                variant={plan.isFeatured ? "featured" : "default"}
              />
            ))}
          </div>
        )}

        {/* Features Section */}
        <Card className="mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">All Plans Include</CardTitle>
            <CardDescription>Everything you need to succeed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                "Unlimited listing creation",
                "Mobile-responsive dashboard",
                "Real-time analytics",
                "Email support",
                "Secure payment processing",
                "Regular feature updates",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-8 text-center">
            <h3 className="mb-2 text-xl font-semibold">Need help choosing a plan?</h3>
            <p className="mb-6 text-muted-foreground">
              Contact our support team to find the perfect plan for your business needs.
            </p>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
