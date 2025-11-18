import * as React from "react";
import { CheckCircle2, Image, Layers, TrendingUp, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Subscription = {
  id: number;
  status: string;
  startAt: string;
  endAt: string;
  remainingListings: number;
  remainingBumps: number;
  remainingFeaturedDays: number;
  plan: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number | string;
    currency: string;
    durationDays: number;
    maxActiveListings: number;
    quotaListings: number;
    quotaPhotosPerListing: number;
    quotaVideosPerListing: number;
    quotaBumps: number;
    quotaFeaturedDays: number;
    maxCategories: number;
    isSticky: boolean;
    isFeatured: boolean;
  };
};

type ActivePlanCardProps = {
  subscription: Subscription;
  onUpgrade?: () => void;
};

export default function ActivePlanCard({ subscription, onUpgrade }: ActivePlanCardProps) {
  const startDate = new Date(subscription.startAt);
  const endDate = new Date(subscription.endAt);
  const now = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = totalDays > 0 ? ((totalDays - remainingDays) / totalDays) * 100 : 0;

  const listingsUsed = subscription.plan.quotaListings - subscription.remainingListings;
  const listingsProgress =
    subscription.plan.quotaListings > 0
      ? (listingsUsed / subscription.plan.quotaListings) * 100
      : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{subscription.plan.name}</CardTitle>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>
            {subscription.plan.description && (
              <CardDescription className="mt-2">{subscription.plan.description}</CardDescription>
            )}
          </div>
          {onUpgrade && (
            <Button onClick={onUpgrade} variant="outline" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subscription Period</span>
            <span className="font-medium">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Days Remaining</span>
            <span className="font-medium">{remainingDays} days</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Listings Used</span>
            <span className="font-medium">
              {listingsUsed} / {subscription.plan.quotaListings}
            </span>
          </div>
          <Progress value={listingsProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Remaining Listings</p>
            <p className="text-2xl font-bold">{subscription.remainingListings}</p>
          </div>
          {subscription.plan.quotaBumps > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Remaining Bumps</p>
              <p className="text-2xl font-bold">{subscription.remainingBumps}</p>
            </div>
          )}
          {subscription.plan.quotaFeaturedDays > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Featured Days</p>
              <p className="text-2xl font-bold">{subscription.remainingFeaturedDays}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Max Active</p>
            <p className="text-2xl font-bold">{subscription.plan.maxActiveListings}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image className="h-4 w-4" />
            <span>{subscription.plan.quotaPhotosPerListing} photos per listing</span>
          </div>
          {subscription.plan.quotaVideosPerListing > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-4 w-4" />
              <span>{subscription.plan.quotaVideosPerListing} videos per listing</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{subscription.plan.maxCategories} categories per listing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

