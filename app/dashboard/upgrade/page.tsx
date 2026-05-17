import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function UpgradePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your plan is ready
          </h1>
          <p className="text-muted-foreground">
            Subscribe to unlock your personalized action checklist, report translator,
            journal, and deadline tracker.
          </p>
        </div>

        <Card className="border-2 border-primary shadow-lg mb-6">
          <CardHeader className="text-center pb-2">
            <Badge className="w-fit mx-auto mb-2">Full access</Badge>
            <CardTitle className="text-4xl font-bold">
              $3
              <span className="text-lg font-normal text-muted-foreground">/month</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Personalized action checklist",
              "Report translator (plain-English explanations)",
              "Journal & side effect tracking",
              "Medication & meal planning",
              "Deadline tracker with reminders",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <form action="/api/stripe/checkout" method="POST">
          <Button type="submit" size="lg" className="w-full mb-3">
            Subscribe — $3/month
          </Button>
        </form>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
