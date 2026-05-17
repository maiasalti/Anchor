"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="WayFlame" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg">WayFlame</span>
          </Link>
        </div>
        <Card>
          {sent ? (
            <>
              <CardHeader>
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  We sent a reset link to <strong>{email}</strong>. Open it to choose a new password.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-3">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Back to sign in
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>
                  Enter your email and we&apos;ll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Remembered it?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
