"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Plus, AlertCircle, Bell, BellOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@/components/user-provider";

type Deadline = {
  id: string;
  title: string;
  date: string;
  description: string | null;
  is_completed: boolean;
  notify_email: boolean;
};

function getDaysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function UrgencyBadge({ days }: { days: number }) {
  if (days < 0) return <Badge variant="outline" className="text-gray-400">Past due</Badge>;
  if (days === 0) return <Badge variant="destructive">Today</Badge>;
  if (days <= 3) return <Badge variant="destructive">{days}d left</Badge>;
  if (days <= 7) return <Badge className="bg-orange-500 hover:bg-orange-600">{days}d left</Badge>;
  if (days <= 14) return <Badge variant="secondary">{days}d left</Badge>;
  return <Badge variant="outline">{days}d left</Badge>;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);
  return days;
}

function getCalendarDotColor(days: number): string {
  if (days < 0 || days <= 3) return "bg-red-500";
  if (days <= 7) return "bg-orange-500";
  return "bg-gray-400";
}

export default function DeadlinesPage() {
  const { userId } = useUser();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("deadlines")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    setDeadlines(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("deadlines").insert({
      user_id: userId,
      title,
      date,
      description: description || null,
      is_completed: false,
    });
    setTitle(""); setDate(""); setDescription("");
    setOpen(false);
    setSaving(false);
    load();
  }

  async function toggleComplete(id: string, current: boolean) {
    await supabase.from("deadlines").update({ is_completed: !current }).eq("id", id);
    load();
  }

  async function toggleNotifyEmail(id: string, current: boolean) {
    await supabase.from("deadlines").update({ notify_email: !current }).eq("id", id);
    load();
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  }

  const upcoming = deadlines.filter((d) => !d.is_completed);
  const completed = deadlines.filter((d) => d.is_completed);
  const overdue = upcoming.filter((d) => getDaysUntil(d.date) < 0);

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long" });

  function getDeadlinesForDay(day: number): Deadline[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return deadlines.filter((d) => d.date === dateStr);
  }

  const selectedDeadlines = selectedDate
    ? deadlines.filter((d) => d.date === selectedDate)
    : [];

  function renderDeadlineCard(deadline: Deadline) {
    const days = getDaysUntil(deadline.date);
    return (
      <Card
        key={deadline.id}
        className={`hover:shadow-sm transition-shadow ${days < 0 ? "border-red-200 bg-red-50/30" : days <= 3 ? "border-orange-200" : ""}`}
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center min-w-[40px]">
              <div className="text-xs text-gray-400">
                {new Date(deadline.date).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
              </div>
              <div className="text-lg font-bold leading-none">
                {new Date(deadline.date).getUTCDate()}
              </div>
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{deadline.title}</CardTitle>
              {deadline.description && (
                <p className="text-xs text-gray-500 mt-0.5">{deadline.description}</p>
              )}
              {deadline.notify_email && (
                <p className="text-xs text-blue-500 mt-0.5">Email reminder</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UrgencyBadge days={days} />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => toggleNotifyEmail(deadline.id, deadline.notify_email)}
              title={deadline.notify_email ? "Disable email reminder" : "Enable email reminder"}
            >
              {deadline.notify_email ? (
                <Bell className="w-4 h-4 text-blue-500" />
              ) : (
                <BellOff className="w-4 h-4 text-gray-300" />
              )}
            </Button>
            {!deadline.is_completed && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-gray-400 h-7"
                onClick={() => toggleComplete(deadline.id, false)}
              >
                Mark done
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deadline Tracker</h1>
          <p className="text-gray-500 mt-1">Critical dates you can&apos;t afford to miss.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add deadline
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
        <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Email reminders are sent 3 days and 1 day before each deadline.
        </p>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">
            You have {overdue.length} overdue deadline{overdue.length !== 1 ? "s" : ""}. Take action as soon as possible.
          </p>
        </div>
      )}

      {deadlines.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No deadlines tracked yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-4">
              Add important dates like COBRA election windows, insurance appeal deadlines, and benefits enrollment periods.
            </p>
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Add your first deadline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="list">
          <TabsList className="mb-6">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Upcoming ({upcoming.length})
                  </h2>
                  <div className="space-y-2">
                    {upcoming.map((deadline) => renderDeadlineCard(deadline))}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Completed ({completed.length})
                  </h2>
                  <div className="space-y-2 opacity-60">
                    {completed.map((deadline) => (
                      <Card key={deadline.id}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <CardTitle className="text-sm font-medium line-through text-gray-400">
                              {deadline.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => toggleNotifyEmail(deadline.id, deadline.notify_email)}
                              title={deadline.notify_email ? "Disable email reminder" : "Enable email reminder"}
                            >
                              {deadline.notify_email ? (
                                <Bell className="w-4 h-4 text-blue-500" />
                              ) : (
                                <BellOff className="w-4 h-4 text-gray-300" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {monthName} {currentYear}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-0">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="h-14" />;
                    }
                    const dayDeadlines = getDeadlinesForDay(day);
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = selectedDate === dateStr;
                    const isToday = (() => {
                      const now = new Date();
                      return day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
                    })();

                    return (
                      <div
                        key={`day-${day}`}
                        className={`h-14 flex flex-col items-center justify-start pt-1 border border-gray-100 rounded cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                        } ${isToday ? "ring-1 ring-blue-400" : ""}`}
                        onClick={() => {
                          if (dayDeadlines.length > 0) {
                            setSelectedDate(isSelected ? null : dateStr);
                          }
                        }}
                      >
                        <span className={`text-sm ${isToday ? "font-bold text-blue-600" : "text-gray-700"}`}>
                          {day}
                        </span>
                        {dayDeadlines.length > 0 && (
                          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                            {dayDeadlines.map((dl) => {
                              const days = getDaysUntil(dl.date);
                              return (
                                <span
                                  key={dl.id}
                                  className={`w-1.5 h-1.5 rounded-full ${getCalendarDotColor(days)}`}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedDate && selectedDeadlines.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Deadlines for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    {selectedDeadlines.map((deadline) => renderDeadlineCard(deadline))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a deadline</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. COBRA election deadline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add deadline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
