"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { NavLinks } from "@/components/dashboard/nav-links";
import { CrisisResources } from "@/components/dashboard/crisis-resources";

interface MobileNavProps {
  profile: { name: string; subscription_status: string } | null;
  userEmail: string;
}

export function MobileNav({ profile, userEmail }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="px-6 py-5 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="Anchor" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg text-foreground">Anchor</span>
          </Link>
        </div>

        <div onClick={() => setOpen(false)}>
          <NavLinks />
        </div>

        <CrisisResources />

        <Separator />

        <div className="p-4 space-y-3">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate text-foreground">{profile?.name ?? userEmail}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile?.subscription_status === "active"
                ? "Active subscription"
                : profile?.subscription_status === "trialing"
                ? "Trial"
                : "No subscription"}
            </p>
          </div>
          <div className="px-3 flex gap-2 text-[10px] text-muted-foreground">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/disclaimer" className="hover:underline">Disclaimer</Link>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
