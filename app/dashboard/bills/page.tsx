"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Receipt, Plus, AlertTriangle, Pencil, Trash2, Info, ChevronDown } from "lucide-react";
import { useUser } from "@/components/user-provider";
import type { MedicalBill } from "@/types/database";

const EMPTY_BILL = {
  provider: "",
  description: "",
  billed_amount: "",
  insurance_paid: "",
  out_of_pocket: "",
  date_of_service: "",
  date_billed: "",
  status: "unpaid",
  eob_notes: "",
};

const STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  disputed: "bg-orange-100 text-orange-800",
  in_review: "bg-blue-100 text-blue-800",
};

const STATUS_CYCLE = ["unpaid", "in_review", "disputed", "paid"];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function BillsPage() {
  const { userId } = useUser();
  const [bills, setBills] = useState<MedicalBill[]>([]);
  const [form, setForm] = useState(EMPTY_BILL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Deductible / OOP max tracking
  const [deductible, setDeductible] = useState("");
  const [deductibleInput, setDeductibleInput] = useState("");
  const [oopMax, setOopMax] = useState("");
  const [oopMaxInput, setOopMaxInput] = useState("");

  // Tip card state
  const [tipOpen, setTipOpen] = useState(false);

  useEffect(() => {
    loadBills();
    // Load saved deductible and OOP max from localStorage
    const savedDeductible = localStorage.getItem("anchor-deductible");
    const savedOopMax = localStorage.getItem("anchor-oop-max");
    if (savedDeductible) {
      setDeductible(savedDeductible);
      setDeductibleInput(savedDeductible);
    }
    if (savedOopMax) {
      setOopMax(savedOopMax);
      setOopMaxInput(savedOopMax);
    }
  }, []);

  async function loadBills() {
    const supabase = createClient();
    const { data } = await supabase
      .from("medical_bills")
      .select("*")
      .order("date_of_service", { ascending: false });
    if (data) setBills(data);
  }

  async function handleSave() {
    if (!form.provider.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      provider: form.provider,
      description: form.description || null,
      billed_amount: parseFloat(form.billed_amount) || 0,
      insurance_paid: parseFloat(form.insurance_paid) || 0,
      out_of_pocket: parseFloat(form.out_of_pocket) || 0,
      date_of_service: form.date_of_service || null,
      date_billed: form.date_billed || null,
      status: form.status,
      eob_notes: form.eob_notes || null,
    };

    if (editingId) {
      await supabase.from("medical_bills").update(payload).eq("id", editingId);
    } else {
      await supabase.from("medical_bills").insert({
        ...payload,
        user_id: userId,
      });
    }

    setForm(EMPTY_BILL);
    setEditingId(null);
    setDialogOpen(false);
    setSaving(false);
    loadBills();
  }

  function handleEdit(bill: MedicalBill) {
    setEditingId(bill.id);
    setForm({
      provider: bill.provider ?? "",
      description: bill.description ?? "",
      billed_amount: String(bill.billed_amount ?? ""),
      insurance_paid: String(bill.insurance_paid ?? ""),
      out_of_pocket: String(bill.out_of_pocket ?? ""),
      date_of_service: bill.date_of_service ?? "",
      date_billed: bill.date_billed ?? "",
      status: bill.status ?? "unpaid",
      eob_notes: bill.eob_notes ?? "",
    });
    setDialogOpen(true);
  }

  async function handleDelete(bill: MedicalBill) {
    if (!window.confirm("Delete this bill?")) return;
    const supabase = createClient();
    await supabase.from("medical_bills").delete().eq("id", bill.id);
    loadBills();
  }

  async function cycleStatus(bill: MedicalBill) {
    const idx = STATUS_CYCLE.indexOf(bill.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    const supabase = createClient();
    await supabase.from("medical_bills").update({ status: next }).eq("id", bill.id);
    loadBills();
  }

  function hasDiscrepancy(bill: MedicalBill) {
    const expected = bill.billed_amount - bill.insurance_paid;
    return Math.abs(expected - bill.out_of_pocket) > 0.01 && bill.insurance_paid > 0;
  }

  function handleSetDeductible() {
    localStorage.setItem("anchor-deductible", deductibleInput);
    setDeductible(deductibleInput);
  }

  function handleSetOopMax() {
    localStorage.setItem("anchor-oop-max", oopMaxInput);
    setOopMax(oopMaxInput);
  }

  const totalBilled = bills.reduce((s, b) => s + Number(b.billed_amount), 0);
  const totalInsurance = bills.reduce((s, b) => s + Number(b.insurance_paid), 0);
  const totalOop = bills.reduce((s, b) => s + Number(b.out_of_pocket), 0);

  const deductibleNum = parseFloat(deductible) || 0;
  const oopMaxNum = parseFloat(oopMax) || 0;
  const deductibleProgress = deductibleNum > 0 ? Math.min((totalOop / deductibleNum) * 100, 100) : 0;
  const oopMaxProgress = oopMaxNum > 0 ? Math.min((totalOop / oopMaxNum) * 100, 100) : 0;

  const filtered = tab === "all" ? bills : bills.filter((b) => b.status === tab);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Bill Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Track medical bills, insurance payments, and out-of-pocket costs.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setForm(EMPTY_BILL);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Medical Bill" : "Add Medical Bill"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label>Provider *</Label>
                <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Hospital or doctor name" />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g., Chemotherapy session #3" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Billed ($)</Label>
                  <Input type="number" value={form.billed_amount} onChange={(e) => setForm({ ...form, billed_amount: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <Label>Insurance ($)</Label>
                  <Input type="number" value={form.insurance_paid} onChange={(e) => setForm({ ...form, insurance_paid: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <Label>Out of Pocket ($)</Label>
                  <Input type="number" value={form.out_of_pocket} onChange={(e) => setForm({ ...form, out_of_pocket: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Date of Service</Label>
                  <Input type="date" value={form.date_of_service} onChange={(e) => setForm({ ...form, date_of_service: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Date Billed</Label>
                  <Input type="date" value={form.date_billed} onChange={(e) => setForm({ ...form, date_billed: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>EOB Notes</Label>
                <Textarea value={form.eob_notes} onChange={(e) => setForm({ ...form, eob_notes: e.target.value })} placeholder="Notes from explanation of benefits..." rows={2} />
              </div>
              <Button onClick={handleSave} disabled={saving || !form.provider.trim()} className="w-full">
                {saving ? "Saving..." : editingId ? "Update Bill" : "Add Bill"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deductible & OOP Max Tracking */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Deductible</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={deductibleInput}
                onChange={(e) => setDeductibleInput(e.target.value)}
                placeholder="e.g., 3000"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSetDeductible}>Set</Button>
            </div>
            {deductibleNum > 0 && (
              <div className="space-y-1">
                <Progress value={deductibleProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalOop)} of {formatCurrency(deductibleNum)} ({Math.round(deductibleProgress)}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Out-of-Pocket Maximum</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={oopMaxInput}
                onChange={(e) => setOopMaxInput(e.target.value)}
                placeholder="e.g., 8000"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSetOopMax}>Set</Button>
            </div>
            {oopMaxNum > 0 && (
              <div className="space-y-1">
                <Progress value={oopMaxProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalOop)} of {formatCurrency(oopMaxNum)} ({Math.round(oopMaxProgress)}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Running totals */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Billed</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Insurance Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalInsurance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Out of Pocket</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalOop)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({bills.length})</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid ({bills.filter((b) => b.status === "unpaid").length})</TabsTrigger>
          <TabsTrigger value="disputed">Disputed ({bills.filter((b) => b.status === "disputed").length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({bills.filter((b) => b.status === "paid").length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-3 mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No bills in this category.</p>
          ) : (
            filtered.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{bill.provider}</h3>
                        <button onClick={() => cycleStatus(bill)}>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[bill.status] ?? "bg-muted"}`}>
                            {bill.status.replace("_", " ")}
                          </span>
                        </button>
                        {hasDiscrepancy(bill) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Discrepancy
                          </Badge>
                        )}
                      </div>
                      {bill.description && <p className="text-sm text-muted-foreground">{bill.description}</p>}
                      {bill.date_of_service && (
                        <p className="text-xs text-muted-foreground">
                          Service: {new Date(bill.date_of_service).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right text-sm space-y-0.5">
                        <p>Billed: <span className="font-medium">{formatCurrency(Number(bill.billed_amount))}</span></p>
                        <p className="text-green-600">Insurance: {formatCurrency(Number(bill.insurance_paid))}</p>
                        <p className="text-red-600">You owe: {formatCurrency(Number(bill.out_of_pocket))}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors"
                          title="Edit bill"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill)}
                          className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete bill"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Itemized bill tip */}
      <Collapsible open={tipOpen} onOpenChange={setTipOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Tip: Requesting an Itemized Bill</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${tipOpen ? "rotate-180" : ""}`} />
              </CardContent>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-muted-foreground">
                Did you know? You can request an itemized bill from any provider. Itemized bills often reveal billing errors and can be used to negotiate lower charges. This is one of the most effective ways to reduce medical costs.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
