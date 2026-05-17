import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { NavLinks } from "@/components/dashboard/nav-links";
import { CrisisResources } from "@/components/dashboard/crisis-resources";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserProvider } from "@/components/user-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read user from cookie — no Supabase auth network call
  const user = await getUserFromCookie();
  if (!user) redirect("/login");

  // Only DB query here (not an auth API call, doesn't hit rate limit)
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, subscription_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile header */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-sidebar-border fixed top-0 left-0 right-0 bg-background z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="WayFlame" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-lg text-foreground">WayFlame</span>
        </Link>
        <MobileNav profile={profile} userEmail={user.email ?? ""} />
      </div>

      <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="WayFlame" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg text-foreground">WayFlame</span>
          </Link>
        </div>

        <NavLinks />

        <CrisisResources />

        <Separator />

        <div className="p-4 space-y-3">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate text-foreground">{profile?.name ?? user.email}</p>
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
      </aside>

      <main className="flex-1 ml-0 md:ml-64 p-8 pt-20 md:pt-8">
        <UserProvider userId={user.id} email={user.email ?? ""}>
        {children}
        </UserProvider>
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            WayFlame provides informational support only and is not a substitute for professional medical advice. Always consult your healthcare team.{" "}
            <Link href="/disclaimer" className="underline hover:text-foreground">Full disclaimer</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
