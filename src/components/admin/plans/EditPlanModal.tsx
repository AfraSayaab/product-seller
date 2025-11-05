"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PlanForm from "./PlanForm";

export default function EditPlanModal({
  open,
  onClose,
  planId,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  planId: number | null;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [planData, setPlanData] = React.useState<any>(null);

  React.useEffect(() => {
    if (open && planId) {
      setLoading(true);
      api(`/api/admin/plans/${planId}`)
        .then((data) => {
          setPlanData(data);
        })
        .catch((error: any) => {
          toast.error(error.message || "Failed to load plan");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPlanData(null);
    }
  }, [open, planId, onClose]);

  const handleSuccess = React.useCallback(() => {
    onUpdated();
    onClose();
  }, [onUpdated, onClose]);

  if (!planId) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Plan</SheetTitle>
          <SheetDescription>
            Make changes to your plan here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">Loading plan data...</p>
            </div>
          ) : planData ? (
            <PlanForm
              initialData={planData}
              planId={planId}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

