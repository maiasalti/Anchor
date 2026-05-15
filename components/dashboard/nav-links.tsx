"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Calendar,
  HelpCircle,
  Pill,
  Activity,
  UtensilsCrossed,
  FlaskConical,
  Stethoscope,
  FolderOpen,
  Receipt,
  MessageSquare,
  Users,
  UserSearch,
  BookOpen,
  Share2,
  FileSearch,
  ChevronDown,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  key: string;
  items: NavItem[];
};

const standaloneItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const navGroups: NavGroup[] = [
  {
    label: "Support",
    key: "support",
    items: [
      { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
      { href: "/dashboard/journal/side-effects", label: "Side Effects", icon: Activity },
      { href: "/dashboard/therapists", label: "Therapists", icon: UserSearch },
      { href: "/dashboard/support-groups", label: "Support Groups", icon: Users },
      { href: "/dashboard/conversations", label: "Conversation Scripts", icon: MessageSquare },
      { href: "/dashboard/updates", label: "Care Updates", icon: Share2 },
    ],
  },
  {
    label: "Action Plan",
    key: "action_plan",
    items: [
      { href: "/dashboard/checklist", label: "Checklist", icon: CheckSquare },
      { href: "/dashboard/questions", label: "Question Builder", icon: HelpCircle },
      { href: "/dashboard/cost-estimator", label: "Cost Estimator", icon: DollarSign },
      { href: "/dashboard/deadlines", label: "Deadlines", icon: Calendar },
    ],
  },
  {
    label: "Health",
    key: "health",
    items: [
      { href: "/dashboard/medications", label: "Medications", icon: Pill },
      { href: "/dashboard/meal-planning", label: "Meal Planning", icon: UtensilsCrossed },
      { href: "/dashboard/clinical-trials", label: "Clinical Trials", icon: FlaskConical },
      { href: "/dashboard/second-opinion", label: "Second Opinion", icon: Stethoscope },
    ],
  },
  {
    label: "Records & Bills",
    key: "records_bills",
    items: [
      { href: "/dashboard/records", label: "Medical Records", icon: FolderOpen },
      { href: "/dashboard/bills", label: "Bill Tracker", icon: Receipt },
      { href: "/dashboard/report-translator", label: "Report Translator", icon: FileSearch },
    ],
  },
];

function getStoredGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("nav-expanded");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function storeGroups(groups: Record<string, boolean>) {
  try {
    localStorage.setItem("nav-expanded", JSON.stringify(groups));
  } catch {}
}

export function NavLinks() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredGroups();
    // Auto-expand Support on first visit, and the group containing the active page
    const isFirstVisit = Object.keys(stored).length === 0;
    const withActive = { ...stored };
    if (isFirstVisit) {
      withActive["support"] = true;
    }
    for (const group of navGroups) {
      if (group.items.some((item) => isActive(item.href, pathname))) {
        withActive[group.key] = true;
      }
    }
    setExpanded(withActive);
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      storeGroups(next);
      return next;
    });
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {standaloneItems.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}

      {hydrated &&
        navGroups.map((group) => (
          <div key={group.key}>
            <button
              onClick={() => toggleGroup(group.key)}
              className="flex items-center justify-between w-full px-3 py-1.5 mt-3 mb-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {group.label}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expanded[group.key] ? "" : "-rotate-90"
                }`}
              />
            </button>
            {expanded[group.key] && (
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            )}
          </div>
        ))}
    </nav>
  );
}

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item.href, pathname);
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-accent text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </Link>
  );
}
