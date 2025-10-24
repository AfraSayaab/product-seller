// components/admin/Sidebar.tsx
"use client"
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---- Types ----
type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// ---- Nav Data ----
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/dashboard/admin/products", icon: Package },
  { label: "Categories", href: "/dashboard/admin/categories", icon: Tags },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        // FLEX LAYOUT: sidebar is a flex-none column with animated width
        "flex-none h-screen border-r bg-background text-foreground transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        {!collapsed && <span className="text-sm font-semibold">Admin</span>}
      </div>
      <Separator />

      <ScrollArea className="h-[calc(100vh-56px)]">
        <nav className="p-2">
          <TooltipProvider disableHoverableContent>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              const content = (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    active ? "bg-foreground text-background" : "hover:bg-muted/60"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-background" : "text-foreground/80 group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className={cn(active ? "text-background" : "text-foreground/90")}>{item.label}</span>
                  )}
                </button>
              );

              return collapsed ? (
                <Tooltip key={item.href} delayDuration={50}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" className="px-2 py-1 text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{content}</div>
              );
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>
    </div>
  );
}

