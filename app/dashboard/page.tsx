import { createClient } from "@/lib/supabase/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CheckSquare, Calendar, ArrowRight, Clock, BookOpen, UserSearch, Heart, Activity, Users } from "lucide-react";
import { WellnessCheckIn } from "./wellness-check-in";
import { TodayItems } from "./today-items";

export default async function DashboardPage() {
  const user = await getUserFromCookie();
  if (!user) return null;

  const supabase = await createClient();

  const [profileRes, actionItemsRes, deadlinesRes, journalRes, todayItemsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("action_items")
      .select("id, status, priority")
      .eq("user_id", user.id),
    supabase
      .from("deadlines")
      .select("id, title, date, is_completed")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(5),
    supabase
      .from("journal_entries")
      .select("id, mood, energy, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(7),
    supabase
      .from("action_items")
      .select("id, title, category, priority, due_date, timeline_bucket")
      .eq("user_id", user.id)
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileRes.data;
  const allActions = actionItemsRes.data ?? [];
  const completedActions = allActions.filter((a) => a.status === "completed").length;
  const totalActions = allActions.length;
  const pendingActions = allActions.filter(
    (a) => a.status === "pending" || a.status === "in_progress"
  ).length;
  const urgentActions = allActions.filter(
    (a) => a.priority === "urgent" && a.status !== "completed"
  ).length;
  const upcomingDeadlines = deadlinesRes.data ?? [];
  const journalEntries = journalRes.data ?? [];

  // Build "what to do today" items
  const today = new Date().toISOString().split("T")[0];
  const allTodayItems = (todayItemsRes.data ?? []).filter((item) => {
    const isDueToday = item.due_date && item.due_date <= today;
    const isThisWeek = item.timeline_bucket === "this_week";
    const isUrgent = item.priority === "urgent";
    return isDueToday || isThisWeek || isUrgent;
  });
  // Deduplicate and limit to 3
  const todayItemIds = new Set<string>();
  const todayItems = allTodayItems.filter((item) => {
    if (todayItemIds.has(item.id)) return false;
    todayItemIds.add(item.id);
    return true;
  }).slice(0, 3);

  // Next deadline countdown
  const nextDeadline = upcomingDeadlines[0];
  let daysUntilDeadline: number | null = null;
  if (nextDeadline) {
    const deadlineDate = new Date(nextDeadline.date + "T00:00:00");
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    daysUntilDeadline = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Last check-in info
  const lastEntry = journalEntries[0];
  let lastCheckInText = "No check-ins yet";
  if (lastEntry) {
    const entryDate = new Date(lastEntry.date);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const daysAgo = Math.floor((todayDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) lastCheckInText = "Last check-in: Today";
    else if (daysAgo === 1) lastCheckInText = "Last check-in: Yesterday";
    else lastCheckInText = `Last check-in: ${daysAgo} days ago`;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}. How are you feeling today?
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s going on — we&apos;re keeping track so you don&apos;t have to.
        </p>
      </div>

      {/* Quick Wellness Check-in */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Quick Check-in
            </CardTitle>
            <span className="text-xs text-muted-foreground">{lastCheckInText}</span>
          </div>
        </CardHeader>
        <CardContent>
          <WellnessCheckIn />
        </CardContent>
      </Card>

      {/* Support Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/dashboard/journal">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Write in your journal</p>
                <p className="text-xs text-muted-foreground">A private space to reflect</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/therapists">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <UserSearch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Find a therapist</p>
                <p className="text-xs text-muted-foreground">Cancer-specialized support</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card className="h-full">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Talk to someone now</p>
              <p className="text-xs text-muted-foreground">
                Call/text <span className="font-medium">988</span> or text HOME to <span className="font-medium">741741</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent alert */}
      {urgentActions > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Urgent</Badge>
            <span className="text-sm text-red-800">
              You have {urgentActions} urgent action{urgentActions !== 1 ? "s" : ""} that need attention.
            </span>
          </div>
          <Link href="/dashboard/checklist">
            <Button size="sm" variant="destructive">
              View
            </Button>
          </Link>
        </div>
      )}

      {/* What to do today */}
      <TodayItems items={todayItems} />

      {/* Your Week at a Glance */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staying on Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{completedActions} of {totalActions}</span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalActions === 0
                ? "Your personalized action plan will appear here. Let's build it together."
                : pendingActions === 0
                ? "All items completed!"
                : `${pendingActions} item${pendingActions !== 1 ? "s" : ""} remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            {nextDeadline && daysUntilDeadline !== null ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {daysUntilDeadline === 0
                      ? "Today"
                      : daysUntilDeadline === 1
                      ? "Tomorrow"
                      : `${daysUntilDeadline} days`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {nextDeadline.title ?? "Upcoming deadline"}
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-muted-foreground">—</span>
                <p className="text-sm text-muted-foreground mt-1">No upcoming deadlines</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          {
            title: "Pending Actions",
            value: pendingActions,
            icon: CheckSquare,
            href: "/dashboard/checklist",
            color: "text-primary",
            bg: "bg-accent",
          },
          {
            title: "Upcoming Deadlines",
            value: upcomingDeadlines.length,
            icon: Calendar,
            href: "/dashboard/deadlines",
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mood Trend Mini Chart */}
      {journalEntries.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mood Trend (Last 7 entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-12">
              {[...journalEntries].reverse().map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-primary/80"
                    style={{ height: `${(entry.mood ?? 3) * 20}%` }}
                    title={`Mood: ${entry.mood}/5`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your profile summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Cancer type", value: profile?.cancer_type },
              { label: "Stage", value: profile?.stage },
              { label: "Treatment status", value: profile?.treatment_status },
              { label: "Insurance", value: profile?.insurance_type },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-1 border-b last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium capitalize">
                  {row.value ? row.value.replace(/_/g, " ") : "—"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "View action checklist", href: "/dashboard/checklist", icon: CheckSquare },
              { label: "Log side effects", href: "/dashboard/journal/side-effects", icon: Activity },
              { label: "Find support groups", href: "/dashboard/support-groups", icon: Users },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between py-2 text-sm hover:text-primary border-b last:border-0 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <action.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {action.label}
                </span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
