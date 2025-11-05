"use client";

import * as React from "react";
import SimpleModal from "@/components/ui/SimpleModal";
import PlanForm from "./PlanForm";

export default function AddPlanModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSuccess = React.useCallback(() => {
    onCreated();
    onOpenChange(false);
  }, [onCreated, onOpenChange]);

  return (
    <SimpleModal
      open={open}
      onClose={handleClose}
      title="Create Plan"
      size="lg"
    >
      <PlanForm
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </SimpleModal>
  );
}

