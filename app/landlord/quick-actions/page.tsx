"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { FileText, UserPlus, CheckCircle, AlertCircle, Loader2, ArrowRight, Zap, Calendar, DollarSign, Mail, Hash, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickActionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"direct-application" | "lease-from-app" | "manual-lease">("direct-application");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // État pour application directe
  const [directAppListingId, setDirectAppListingId] = useState("");
  const [directAppTenantEmail, setDirectAppTenantEmail] = useState("");

  // État pour bail depuis application
  const [leaseFromAppId, setLeaseFromAppId] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState("");
  const [leaseEndDate, setLeaseEndDate] = useState("");
  const [leaseMonthlyRent, setLeaseMonthlyRent] = useState("");
  const [leaseDeposit, setLeaseDeposit] = useState("");
  const [leaseTerms, setLeaseTerms] = useState("");

  // État pour bail manuel
  const [manualLeaseListingId, setManualLeaseListingId] = useState("");
  const [manualLeaseTenantEmail, setManualLeaseTenantEmail] = useState("");
  const [manualLeaseStartDate, setManualLeaseStartDate] = useState("");
  const [manualLeaseEndDate, setManualLeaseEndDate] = useState("");
  const [manualLeaseMonthlyRent, setManualLeaseMonthlyRent] = useState("");
  const [manualLeaseDeposit, setManualLeaseDeposit] = useState("");
  const [manualLeaseTerms, setManualLeaseTerms] = useState("");

  const handleDirectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/applications/create-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: directAppListingId,
          tenantEmail: directAppTenantEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'application");
      }

      // Si une invitation a été envoyée
      if (data.invitationSent) {
        setSuccess(data.message || "Un email d'invitation a été envoyé au locataire. Il pourra créer son compte et accéder directement à la candidature.");
      } else {
        setSuccess(`Application créée avec succès ! Le locataire peut maintenant postuler via : ${data.application.applicationUrl}`);
      }
      
      setDirectAppListingId("");
      setDirectAppTenantEmail("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaseFromApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/leases/create-from-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: leaseFromAppId,
          startDate: new Date(leaseStartDate).toISOString(),
          endDate: new Date(leaseEndDate).toISOString(),
          monthlyRent: parseFloat(leaseMonthlyRent),
          deposit: parseFloat(leaseDeposit),
          terms: leaseTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du bail");
      }

      setSuccess(`Bail créé avec succès ! Vous pouvez le gérer ici : ${data.lease.leaseUrl}`);
      // Reset form
      setLeaseFromAppId("");
      setLeaseStartDate("");
      setLeaseEndDate("");
      setLeaseMonthlyRent("");
      setLeaseDeposit("");
      setLeaseTerms("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du bail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/leases/create-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: manualLeaseListingId,
          tenantEmail: manualLeaseTenantEmail,
          startDate: new Date(manualLeaseStartDate).toISOString(),
          endDate: new Date(manualLeaseEndDate).toISOString(),
          monthlyRent: parseFloat(manualLeaseMonthlyRent),
          deposit: parseFloat(manualLeaseDeposit),
          terms: manualLeaseTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du bail");
      }

      setSuccess(`Bail créé avec succès ! Accédez à la gestion de loyer : ${data.lease.rentManagementUrl}`);
      // Reset form
      setManualLeaseListingId("");
      setManualLeaseTenantEmail("");
      setManualLeaseStartDate("");
      setManualLeaseEndDate("");
      setManualLeaseMonthlyRent("");
      setManualLeaseDeposit("");
      setManualLeaseTerms("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du bail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "direct-application" as const, label: "Application directe", icon: UserPlus, description: "Pour les annonces externes où la visite a déjà eu lieu" },
    { id: "lease-from-app" as const, label: "Bail depuis application", icon: FileCheck, description: "Créer un bail après avoir accepté une candidature" },
    { id: "manual-lease" as const, label: "Bail manuel", icon: FileText, description: "Importer ou créer un bail sans processus complet" },
  ];

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return <div>Chargement...</div>;
  }

  if (!user || user.role !== "LANDLORD") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-light text-neutral-900 mb-1">
                  Actions rapides
                </h1>
                <p className="text-lg text-neutral-500 font-light">
                  Créez des applications ou des baux directement, sans passer par toutes les étapes
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-neutral-200"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 rounded-xl font-light transition-all duration-200 ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-lg"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-500"}`} />
                    <span className="text-sm">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-light">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-light">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Application directe */}
          <AnimatePresence mode="wait">
            {activeTab === "direct-application" && (
              <motion.div
                key="direct-application"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-neutral-200 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b border-neutral-200 pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <UserPlus className="h-5 w-5 text-blue-600" />
                      </div>
                      Application directe (sans visite)
                    </CardTitle>
                    <CardDescription className="text-base font-light text-neutral-600 mt-2">
                      Pour les annonces externes (Facebook Marketplace, etc.) où la visite a déjà eu lieu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleDirectApplication} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="listingId" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          ID de l'annonce
                        </Label>
                        <Input
                          id="listingId"
                          value={directAppListingId}
                          onChange={(e) => setDirectAppListingId(e.target.value)}
                          placeholder="Ex: cml5ohvx30005xrn0ssab1758"
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenantEmail" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email du locataire
                        </Label>
                        <Input
                          id="tenantEmail"
                          type="email"
                          value={directAppTenantEmail}
                          onChange={(e) => setDirectAppTenantEmail(e.target.value)}
                          placeholder="locataire@example.com"
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                        <p className="text-xs text-neutral-500 mt-2 font-light leading-relaxed">
                          Si le locataire n'a pas de compte, un email d'invitation lui sera envoyé pour créer son compte et accéder directement à la candidature.
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-light rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            Créer l'application
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bail depuis application */}
          <AnimatePresence mode="wait">
            {activeTab === "lease-from-app" && (
              <motion.div
                key="lease-from-app"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
              <Card className="border-neutral-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-green-50 to-white border-b border-neutral-200 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl font-light text-neutral-900">
                    <div className="p-2 rounded-lg bg-green-100">
                      <FileCheck className="h-5 w-5 text-green-600" />
                    </div>
                    Créer un bail depuis une application acceptée
                  </CardTitle>
                  <CardDescription className="text-base font-light text-neutral-600 mt-2">
                    Pour créer un bail directement après avoir accepté une candidature
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleLeaseFromApplication} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="appId" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        ID de l'application acceptée
                      </Label>
                      <Input
                        id="appId"
                        value={leaseFromAppId}
                        onChange={(e) => setLeaseFromAppId(e.target.value)}
                        placeholder="Ex: cml5ohvx30005xrn0ssab1758"
                        required
                        className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date de début
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={leaseStartDate}
                          onChange={(e) => setLeaseStartDate(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date de fin
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={leaseEndDate}
                          onChange={(e) => setLeaseEndDate(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyRent" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Loyer mensuel ($)
                        </Label>
                        <Input
                          id="monthlyRent"
                          type="number"
                          step="0.01"
                          value={leaseMonthlyRent}
                          onChange={(e) => setLeaseMonthlyRent(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Caution ($)
                        </Label>
                        <Input
                          id="deposit"
                          type="number"
                          step="0.01"
                          value={leaseDeposit}
                          onChange={(e) => setLeaseDeposit(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="terms" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Conditions du bail
                      </Label>
                      <textarea
                        id="terms"
                        value={leaseTerms}
                        onChange={(e) => setLeaseTerms(e.target.value)}
                        rows={4}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 focus:outline-none font-light resize-none"
                        placeholder="Conditions particulières du bail..."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-light rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          Créer le bail
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bail manuel */}
          <AnimatePresence mode="wait">
            {activeTab === "manual-lease" && (
              <motion.div
                key="manual-lease"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
              <Card className="border-neutral-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-purple-50 to-white border-b border-neutral-200 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl font-light text-neutral-900">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    Créer un bail manuellement
                  </CardTitle>
                  <CardDescription className="text-base font-light text-neutral-600 mt-2">
                    Pour importer un bail existant ou créer un bail sans passer par le processus complet
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleManualLease} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="manualListingId" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        ID de l'annonce
                      </Label>
                      <Input
                        id="manualListingId"
                        value={manualLeaseListingId}
                        onChange={(e) => setManualLeaseListingId(e.target.value)}
                        placeholder="Ex: cml5ohvx30005xrn0ssab1758"
                        required
                        className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualTenantEmail" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email du locataire
                      </Label>
                      <Input
                        id="manualTenantEmail"
                        type="email"
                        value={manualLeaseTenantEmail}
                        onChange={(e) => setManualLeaseTenantEmail(e.target.value)}
                        placeholder="locataire@example.com"
                        required
                        className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manualStartDate" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date de début
                        </Label>
                        <Input
                          id="manualStartDate"
                          type="date"
                          value={manualLeaseStartDate}
                          onChange={(e) => setManualLeaseStartDate(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manualEndDate" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date de fin
                        </Label>
                        <Input
                          id="manualEndDate"
                          type="date"
                          value={manualLeaseEndDate}
                          onChange={(e) => setManualLeaseEndDate(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manualMonthlyRent" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Loyer mensuel ($)
                        </Label>
                        <Input
                          id="manualMonthlyRent"
                          type="number"
                          step="0.01"
                          value={manualLeaseMonthlyRent}
                          onChange={(e) => setManualLeaseMonthlyRent(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manualDeposit" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Caution ($)
                        </Label>
                        <Input
                          id="manualDeposit"
                          type="number"
                          step="0.01"
                          value={manualLeaseDeposit}
                          onChange={(e) => setManualLeaseDeposit(e.target.value)}
                          required
                          className="h-12 rounded-xl border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 font-light"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualTerms" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Conditions du bail
                      </Label>
                      <textarea
                        id="manualTerms"
                        value={manualLeaseTerms}
                        onChange={(e) => setManualLeaseTerms(e.target.value)}
                        rows={4}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 focus:outline-none font-light resize-none"
                        placeholder="Conditions particulières du bail..."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-light rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          Créer le bail
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

