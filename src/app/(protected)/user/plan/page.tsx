"use client";

import * as React from "react";
import { CreditCard, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
import ActivePlanCard from "@/components/plans/ActivePlanCard";
import PlanCard, { type Plan } from "@/components/plans/PlanCard";

type Subscription = {
  id: number;
  status: string;
  startAt: string;
  endAt: string;
  remainingListings: number;
  remainingBumps: number;
  remainingFeaturedDays: number;
  plan: Plan;
};

type PlansResponse = {
  items: Plan[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export default function UserPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subRes, plansRes] = await Promise.all([
          api<Subscription | null>("/api/user/subscription").catch(() => null),
          api<PlansResponse>("/api/plans?pageSize=100").catch(() => ({ items: [], pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 } })),
        ]);
        setSubscription(subRes);
        setPlans(plansRes.items || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load plan information");
      } finally {
        setLoading(false);
        setPlansLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectPlan = React.useCallback(
    (planId: number) => {
      // Navigate to public plans page with the selected plan highlighted
      router.push(`/plan?select=${planId}`);
    },
    [router]
  );

  const handleUpgrade = React.useCallback(() => {
    router.push("/plan");
  }, [router]);

  const handleCreatePlan = React.useCallback(() => {
    router.push("/plan");
  }, [router]);

  if (loading) {
    return (
      <div className="relative min-h-[400px]">
        <LoaderOverlay label="Loading your plan..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>My Subscription</CardTitle>
          </div>
          <CardDescription>Manage your subscription plan and view usage details</CardDescription>
        </CardHeader>
      </Card>

      {subscription ? (
        <>
          <ActivePlanCard subscription={subscription} onUpgrade={handleUpgrade} />

          {plans.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Plans</CardTitle>
                    <CardDescription>Upgrade to unlock more features and listings</CardDescription>
                  </div>
                  <Button onClick={handleUpgrade} variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View All Plans
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {plans
                    .filter((p) => p.id !== subscription.plan.id)
                    .slice(0, 3)
                    .map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={handleSelectPlan}
                        buttonText="Upgrade"
                        variant={plan.isFeatured ? "featured" : "default"}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">No Active Plan</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              You don't have an active subscription plan. Choose a plan to start creating and managing your listings.
            </CardDescription>
            <Button onClick={handleCreatePlan} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Browse Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
