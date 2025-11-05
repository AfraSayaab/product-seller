"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, X, RefreshCw } from "lucide-react";

type Plan = {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  durationDays: number;
};

type Subscription = {
  id: number;
  planId: number;
  status: string;
  startAt: string;
  endAt: string;
  canceledAt: string | null;
  remainingListings: number;
  remainingBumps: number;
  remainingFeaturedDays: number;
  plan: Plan;
};

interface UserSubscriptionManagerProps {
  userId: number;
  currentSubscription?: Subscription | null;
  onUpdated: () => void;
}

export default function UserSubscriptionManager({
  userId,
  currentSubscription,
  onUpdated,
}: UserSubscriptionManagerProps) {
  const [loading, setLoading] = React.useState(false);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("");
  const [extendDays, setExtendDays] = React.useState<string>("");
  const [subscription, setSubscription] = React.useState<Subscription | null>(currentSubscription || null);

  // Fetch plans
  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api<{ items: Plan[] }>("/api/admin/plans?pageSize=100&isActive=true");
        setPlans(res.items || []);
      } catch (e: any) {
        toast.error(e.message || "Failed to load plans");
      }
    };
    fetchPlans();
  }, []);

  // Fetch current subscription
  React.useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await api<Subscription>(`/api/admin/users/${userId}/subscription`);
        setSubscription(res || null);
      } catch (e: any) {
        // Subscription might not exist, that's okay
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [userId, currentSubscription]);

  const handleAssignPlan = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        planId: Number(selectedPlanId),
      };

      if (extendDays) {
        payload.extendDays = Number(extendDays);
      }

      const res = await api<Subscription>(`/api/admin/users/${userId}/subscription`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubscription(res);
      setSelectedPlanId("");
      setExtendDays("");
      toast.success("Plan assigned successfully");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to assign plan");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!subscription || !extendDays) {
      toast.error("Please enter days to extend");
      return;
    }

    setLoading(true);
    try {
      const res = await api<Subscription>(`/api/admin/users/${userId}/subscription`, {
        method: "PATCH",
        body: JSON.stringify({
          subscriptionId: subscription.id,
          extendDays: Number(extendDays),
        }),
      });

      setSubscription(res);
      setExtendDays("");
      toast.success("Subscription extended successfully");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to extend subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm(`Are you sure you want to cancel the subscription for plan "${subscription.plan.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await api(`/api/admin/users/${userId}/subscription?subscriptionId=${subscription.id}`, {
        method: "DELETE",
      });

      setSubscription(null);
      toast.success("Subscription canceled successfully");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!subscription || !selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    setLoading(true);
    try {
      const res = await api<Subscription>(`/api/admin/users/${userId}/subscription`, {
        method: "PATCH",
        body: JSON.stringify({
          subscriptionId: subscription.id,
          planId: Number(selectedPlanId),
        }),
      });

      setSubscription(res);
      setSelectedPlanId("");
      toast.success("Plan changed successfully");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to change plan");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Subscription Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        )}

        {/* Current Subscription */}
        {subscription ? (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">{subscription.plan.name}</Badge>
                  <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Price:</strong> {formatPrice(subscription.plan.price, subscription.plan.currency)}
                  </p>
                  <p>
                    <strong>Start:</strong> {formatDate(subscription.startAt)}
                  </p>
                  <p>
                    <strong>End:</strong> {formatDate(subscription.endAt)}
                  </p>
                  <p>
                    <strong>Remaining:</strong> {subscription.remainingListings} listings, {subscription.remainingBumps} bumps, {subscription.remainingFeaturedDays} featured days
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
                disabled={loading || subscription.status === "CANCELED"}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>

            {/* Extend Subscription */}
            <div className="flex items-end gap-2 pt-2 border-t">
              <div className="flex-1">
                <Label className="text-xs">Extend by (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  placeholder="e.g., 30"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleExtendSubscription}
                disabled={loading || !extendDays}
                size="sm"
              >
                Extend
              </Button>
            </div>

            {/* Change Plan */}
            <div className="flex items-end gap-2 pt-2 border-t">
              <div className="flex-1">
                <Label className="text-xs">Change to Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans
                      .filter((p) => p.id !== subscription.planId)
                      .map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                          {plan.name} - {formatPrice(plan.price, plan.currency)} / {plan.durationDays} days
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleChangePlan}
                disabled={loading || !selectedPlanId}
                size="sm"
                variant="outline"
              >
                Change Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border rounded-lg bg-gray-50 text-center">
            <p className="text-sm text-gray-600 mb-4">No active subscription</p>

            {/* Assign New Plan */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Select Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        {plan.name} - {formatPrice(plan.price, plan.currency)} / {plan.durationDays} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Custom Duration (days, optional)</Label>
                <Input
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  placeholder={`Default: ${plans.find((p) => p.id === Number(selectedPlanId))?.durationDays || 7} days`}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleAssignPlan}
                disabled={loading || !selectedPlanId}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

