"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UtensilsCrossed, Loader2, Droplets, Pill, Check, X, Trash2 } from "lucide-react";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Kosher",
  "Halal",
  "Low-sodium",
  "Diabetic-friendly",
] as const;

type MealPlan = {
  foods_to_eat: { title: string; items: { name: string; benefit: string }[] };
  foods_to_avoid: { title: string; items: { name: string; reason: string }[] };
  hydration_tips: { title: string; tips: string[] };
  supplements_to_discuss: { title: string; items: { name: string; note: string }[] };
  sample_meals: { title: string; meals: { meal: string; description: string }[] };
  disclaimer: string;
};

type SavedPlan = {
  id: string;
  created_at: string;
  plan: MealPlan;
  dietary_restrictions: string[];
};

export default function MealPlanningPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [otherRestrictions, setOtherRestrictions] = useState("");
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  const loadSavedPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/meal-planning", { method: "GET" });
      const data = await res.json();
      if (data.plans) setSavedPlans(data.plans);
    } catch {
      // ignore load errors
    }
  }, []);

  useEffect(() => {
    loadSavedPlans();
  }, [loadSavedPlans]);

  function toggleRestriction(restriction: string) {
    setDietaryRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  }

  async function generatePlan() {
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/ai/meal-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietary_restrictions: dietaryRestrictions,
          other_restrictions: otherRestrictions,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
        loadSavedPlans();
      }
    } finally {
      setLoading(false);
    }
  }

  async function deletePlan(id: string) {
    try {
      await fetch("/api/ai/meal-planning", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setSavedPlans((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore delete errors
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            Meal Planning
          </h1>
          <p className="text-muted-foreground mt-1">Nutrition guidance tailored to your treatment.</p>
        </div>
      </div>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dietary Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIETARY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={dietaryRestrictions.includes(option)}
                  onCheckedChange={() => toggleRestriction(option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="other-restrictions">
              Other allergies or restrictions
            </label>
            <input
              id="other-restrictions"
              type="text"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g., No shellfish, tree nut allergy..."
              value={otherRestrictions}
              onChange={(e) => setOtherRestrictions(e.target.value)}
            />
          </div>
          <Button onClick={generatePlan} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Meal Plan"
            )}
          </Button>
        </CardContent>
      </Card>

      {!plan && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Click &quot;Generate Meal Plan&quot; for personalized nutrition advice.</p>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="space-y-6">
          {/* Foods to Eat */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {plan.foods_to_eat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.foods_to_eat.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">{item.name}</Badge>
                    <span className="text-sm text-muted-foreground">{item.benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Foods to Avoid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                {plan.foods_to_avoid.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.foods_to_avoid.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="destructive" className="mt-0.5 flex-shrink-0">{item.name}</Badge>
                    <span className="text-sm text-muted-foreground">{item.reason}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Meals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{plan.sample_meals.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.sample_meals.meals.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <span className="text-sm font-medium w-24 flex-shrink-0 capitalize">{m.meal}</span>
                    <span className="text-sm text-muted-foreground">{m.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hydration Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                {plan.hydration_tips.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.hydration_tips.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Supplements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-500" />
                {plan.supplements_to_discuss.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plan.supplements_to_discuss.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm font-medium">{item.name}:</span>
                    <span className="text-sm text-muted-foreground">{item.note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {plan.disclaimer && (
            <p className="text-xs text-muted-foreground italic">{plan.disclaimer}</p>
          )}
        </div>
      )}

      {/* Saved Plans */}
      {savedPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedPlans.map((sp) => (
                <div
                  key={sp.id}
                  className="flex items-center justify-between border rounded-md px-4 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">
                      {new Date(sp.created_at).toLocaleDateString()}
                    </span>
                    {sp.dietary_restrictions?.length > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        ({sp.dietary_restrictions.join(", ")})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlan(sp.plan)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlan(sp.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
