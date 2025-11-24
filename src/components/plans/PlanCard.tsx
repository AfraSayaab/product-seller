import * as React from "react";
import { Check, Sparkles, Zap, Image, Video, Layers, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Plan = {
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
  isActive: boolean;
};

type PlanCardProps = {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect?: (planId: number) => void;
  buttonText?: string;
  variant?: "default" | "featured";
  isProcessing?: boolean;
};

export default function PlanCard({
  plan,
  isCurrentPlan = false,
  onSelect,
  buttonText,
  variant = "default",
  isProcessing = false,
}: PlanCardProps) {
  const price = typeof plan.price === "number" ? plan.price : Number(plan.price);
  const formattedPrice = price.toFixed(2);
  const isFeatured = variant === "featured" || plan.isFeatured;

  const features = [
    { icon: Layers, label: `${plan.maxActiveListings} active listings`, value: plan.maxActiveListings },
    { icon: Sparkles, label: `${plan.quotaListings} listings per period`, value: plan.quotaListings },
    { icon: Image, label: `${plan.quotaPhotosPerListing} photos per listing`, value: plan.quotaPhotosPerListing },
    ...(plan.quotaVideosPerListing > 0
      ? [{ icon: Video, label: `${plan.quotaVideosPerListing} videos per listing`, value: plan.quotaVideosPerListing }]
      : []),
    { icon: Layers, label: `${plan.maxCategories} categories per listing`, value: plan.maxCategories },
    ...(plan.quotaBumps > 0
      ? [{ icon: TrendingUp, label: `${plan.quotaBumps} bumps included`, value: plan.quotaBumps }]
      : []),
    ...(plan.quotaFeaturedDays > 0
      ? [{ icon: Star, label: `${plan.quotaFeaturedDays} featured days`, value: plan.quotaFeaturedDays }]
      : []),
    ...(plan.isSticky ? [{ icon: Zap, label: "Sticky listings", value: true }] : []),
  ].filter((f) => f.value !== 0 && f.value !== false);

  return (
    <Card
      className={`relative flex h-full flex-col transition-all hover:shadow-lg ${
        isFeatured ? "border-primary shadow-md ring-2 ring-primary/20" : ""
      } ${isCurrentPlan ? "border-green-500 ring-2 ring-green-500/20" : ""}`}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription className="mt-2 min-h-[40px]">{plan.description}</CardDescription>
        )}
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">{plan.currency}</span>
            <span className="text-4xl font-bold">{formattedPrice}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            per {plan.durationDays} {plan.durationDays === 1 ? "day" : "days"}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm">{feature.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {onSelect && (
          <Button
            onClick={() => onSelect(plan.id)}
            className="w-full"
            variant={isFeatured ? "default" : "outline"}
            disabled={isCurrentPlan || isProcessing}
          >
            {isCurrentPlan ? "Current Plan" : buttonText || "Select Plan"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

