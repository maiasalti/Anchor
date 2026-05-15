import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Shield, ArrowRight, BookOpen, Pill, FileSearch, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Anchor" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-lg">Anchor</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          Built for cancer patients and caregivers
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Focus on healing.
          <br />
          <span className="text-blue-600">We handle the paperwork.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          After a cancer diagnosis, everything feels overwhelming. Anchor
          gives you a personalized action plan, translates confusing medical reports,
          and keeps track of critical deadlines — so nothing falls through the cracks.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline">
              See how it works
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Anchor works</h2>
            <p className="text-lg text-gray-500">
              Three steps to get your administrative life under control.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell us about your situation",
                description:
                  "Complete a 4-step intake form covering your diagnosis, employer, and insurance. Takes about 5 minutes.",
              },
              {
                step: "02",
                title: "Get your personalized plan",
                description:
                  "Anchor analyzes your situation and generates a prioritized checklist of actions, deadlines, and benefits.",
              },
              {
                step: "03",
                title: "Take action with confidence",
                description:
                  "Work through your checklist, generate documents, and track deadlines — all in one organized hub.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything in one place</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Prioritized Action Checklist",
                description:
                  "Know exactly what to do and when. Urgent tasks and critical deadlines are surfaced immediately so nothing falls through the cracks.",
              },
              {
                icon: BookOpen,
                title: "Journal & Side Effect Tracking",
                description:
                  "Track your emotional journey and monitor side effects over time. AI-powered insights help you communicate better with your care team.",
              },
              {
                icon: FileSearch,
                title: "Report Translator",
                description:
                  "Paste any medical report or lab result and get a clear, empathetic explanation in plain language — with questions to ask your doctor.",
              },
              {
                icon: Pill,
                title: "Medication & Meal Planning",
                description:
                  "Manage your medications, track interactions, and get personalized meal plans tailored to your treatment and side effects.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="max-w-sm mx-auto">
            <Card className="border-2 border-blue-600 shadow-lg">
              <CardHeader className="text-center pb-2">
                <Badge className="w-fit mx-auto mb-2">Full access</Badge>
                <CardTitle className="text-4xl font-bold">
                  $3
                  <span className="text-lg font-normal text-gray-500">/month</span>
                </CardTitle>
                <p className="text-gray-500 text-sm">Everything you need to navigate cancer's paperwork</p>
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
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <div className="pt-4">
                  <Link href="/signup" className="w-full block">
                    <Button className="w-full" size="lg">
                      Get started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Your data is private and never sold.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</Link>
            <Link href="/disclaimer" className="text-sm text-gray-400 hover:text-gray-600">Medical Disclaimer</Link>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Anchor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
