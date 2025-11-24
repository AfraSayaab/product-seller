"use client"
import * as React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // if you don't have, replace cn(...) with template classes
import {
    LayoutDashboard,
    Users,
    Package,
    Tags,
    Settings,
    Menu,
    ChevronLeft,
    CreditCard,
    ChevronDown,
    ChevronRight,
    Key,
    User
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
    children?: NavItem[];
};

// ---- Nav Data ----
const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Products", href: "/admin/listings", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Plans", href: "/admin/plans", icon: CreditCard },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        children: [
            { label: "Profile", href: "/admin/settings/profile", icon: User },
            { label: "Change Password", href: "/admin/settings/change-password", icon: Key },
            { label: "API Keys", href: "/admin/settings/api-keys", icon: Key },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Auto-expand items if any child is active
    React.useEffect(() => {
        const newExpanded = new Set<string>();
        NAV_ITEMS.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some((child) => pathname === child.href || pathname.startsWith(child.href));
                if (hasActiveChild) {
                    newExpanded.add(item.href);
                }
            }
        });
        setExpandedItems(newExpanded);
    }, [pathname]);

    const toggleExpanded = (href: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(href)) {
                next.delete(href);
            } else {
                next.add(href);
            }
            return next;
        });
    };

    const isActive = (item: NavItem) => {
        if (pathname === item.href) return true;
        if (item.children) {
            return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href));
        }
        return false;
    };

    const renderNavItem = (item: NavItem, level: number = 0) => {
        const Icon = item.icon;
        const active = isActive(item);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.href);

        const handleClick = () => {
            if (hasChildren && !collapsed) {
                toggleExpanded(item.href);
            } else {
                router.push(item.href);
            }
        };

        const content = (
            <button
                onClick={handleClick}
                className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    active
                        ? "bg-foreground text-background"
                        : "hover:bg-muted/60",
                    level > 0 && "ml-4"
                )}
            >
                <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-background" : "text-foreground/80 group-hover:text-foreground")} />
                {!collapsed && (
                    <>
                        <span className={cn("flex-1 text-left", active ? "text-background" : "text-foreground/90")}>{item.label}</span>
                        {hasChildren && (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            ) : (
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            )
                        )}
                    </>
                )}
            </button>
        );

        if (collapsed) {
            return (
                <Tooltip key={item.href} delayDuration={50}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="px-2 py-1 text-xs">
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return (
            <div key={item.href}>
                {content}
                {hasChildren && isExpanded && (
                    <div className="mt-1 space-y-1">
                        {item.children?.map((child) => renderNavItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={cn(
                "h-screen border-r bg-background text-foreground transition-[width] duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-14 items-center gap-2 px-3">
                <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? "Expand menu" : "Collapse menu"}>
                    {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
                {!collapsed && <span className="text-sm font-semibold">Admin</span>}
            </div>
            <Separator />

            <ScrollArea className="h-[calc(100vh-56px)]">
                <nav className="p-2">
                    <TooltipProvider disableHoverableContent>
                        {NAV_ITEMS.map((item) => renderNavItem(item))}
                    </TooltipProvider>
                </nav>
            </ScrollArea>
        </div>
    );
}
