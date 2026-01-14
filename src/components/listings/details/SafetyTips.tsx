import { ShieldCheck } from "lucide-react";

export default function SafetyTips() {
  return (
    <div className="rounded-xl border bg-muted/50 p-4">
      <div className="mb-2 flex items-center gap-2 font-medium">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        Safety Tips
      </div>

      <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
        <li>Meet seller at a safe location</li>
        <li>Check the item before you buy</li>
        <li>Pay only after collecting item</li>
      </ul>
    </div>
  );
}
