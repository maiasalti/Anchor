"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Loader2, AlertTriangle, Lightbulb, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import Link from "next/link";

type CostEstimate = {
  procedure_name: string;
  with_insurance_low: number;
  with_insurance_high: number;
  without_insurance_low: number;
  without_insurance_high: number;
  in_network_note: string;
  negotiation_tips: string[];
  additional_costs: string[];
  disclaimer: string;
};

type SavedEstimate = {
  id: string;
  procedure_name: string;
  estimate: CostEstimate;
  created_at: string;
};

type Profile = {
  insurance_type: string | null;
  insurance_provider: string | null;
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function CostEstimatorPage() {
  const { userId } = useUser();
  const [procedure, setProcedure] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pastEstimates, setPastEstimates] = useState<SavedEstimate[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("insurance_type, insurance_provider")
        .eq("id", userId)
        .single();
      if (profileData) setProfile(profileData);

      const { data: estimates } = await supabase
        .from("cost_estimates")
        .select("id, procedure_name, estimate, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (estimates) setPastEstimates(estimates);
    }
    load();
  }, []);

  async function handleEstimate() {
    if (!procedure.trim()) return;
    setLoading(true);
    setEstimate(null);
    try {
      const res = await fetch("/api/ai/cost-estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedure_name: procedure }),
      });
      const data = await res.json();
      if (data.estimate) setEstimate(data.estimate);
      if (data.saved) setPastEstimates((prev) => [data.saved, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("cost_estimates").delete().eq("id", id);
    if (!error) {
      setPastEstimates((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Cost Estimator
        </h1>
        <p className="text-muted-foreground mt-1">
          Get estimated costs for medical procedures and treatments.
        </p>
      </div>

      {profile !== null && (
        <div className="rounded-md border px-4 py-3 text-sm">
          {profile.insurance_type ? (
            <p>
              Estimates based on your <span className="font-medium">{profile.insurance_type}</span> insurance
              {profile.insurance_provider ? ` (${profile.insurance_provider})` : ""}
            </p>
          ) : (
            <p>
              No insurance info on file.{" "}
              <Link href="/dashboard/settings" className="text-primary underline">
                Go to Settings
              </Link>{" "}
              to add your insurance details.
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estimate a Procedure</CardTitle>
          <CardDescription>Enter the name of a procedure or treatment to get cost ranges.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Procedure or treatment name</Label>
            <Input
              placeholder="e.g., Chemotherapy infusion, PET scan, Mastectomy, Radiation therapy"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEstimate()}
            />
          </div>
          <Button onClick={handleEstimate} disabled={loading || !procedure.trim()}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Estimating...
              </>
            ) : (
              "Estimate Cost"
            )}
          </Button>
        </CardContent>
      </Card>

      {estimate && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{estimate.procedure_name}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">With Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(estimate.with_insurance_low)} – {formatCurrency(estimate.with_insurance_high)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Without Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(estimate.without_insurance_low)} – {formatCurrency(estimate.without_insurance_high)}
                </p>
              </CardContent>
            </Card>
          </div>

          {estimate.in_network_note && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">In-Network vs. Out-of-Network:</span>{" "}
                  {estimate.in_network_note}
                </p>
              </CardContent>
            </Card>
          )}

          {estimate.negotiation_tips?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Cost Reduction Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {estimate.negotiation_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs mt-0.5 flex-shrink-0">{i + 1}</Badge>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {estimate.additional_costs?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Additional Costs to Consider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {estimate.additional_costs.map((cost, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {cost}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {estimate.disclaimer && (
            <p className="text-xs text-muted-foreground italic">{estimate.disclaimer}</p>
          )}
        </div>
      )}

      {pastEstimates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Past Estimates</h2>
          <div className="space-y-2">
            {pastEstimates.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => setEstimate(item.estimate)}
                  >
                    <p className="font-medium truncate">{item.procedure_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()} &middot;{" "}
                      {formatCurrency(item.estimate.with_insurance_low)} – {formatCurrency(item.estimate.with_insurance_high)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
