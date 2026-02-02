"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Calendar, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  application: {
    listing: {
      title: string;
      address: string | null;
      city: string;
    };
  };
}

function PaymentForm({ leaseId, onSuccess }: { leaseId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Élément de carte introuvable");
      setIsProcessing(false);
      return;
    }

    try {
      // Créer la méthode de paiement
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || "Erreur lors de la création de la méthode de paiement");
      }

      // Configurer le paiement récurrent
      const response = await fetch(`/api/leases/${leaseId}/setup-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la configuration du paiement");
      }

      // Si on a un clientSecret, confirmer le paiement
      if (data.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);

        if (confirmError) {
          throw new Error(confirmError.message || "Erreur lors de la confirmation du paiement");
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="card-element">Carte de crédit</Label>
        <div className="mt-2 p-4 border rounded-lg bg-white">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Configuration en cours...
          </>
        ) : (
          "Configurer le paiement récurrent"
        )}
      </Button>
    </form>
  );
}

export default function LeaseSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const applicationId = params.id as string; // En fait c'est l'applicationId dans l'URL
  const [lease, setLease] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPaymentSetup, setIsPaymentSetup] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user && user.role === "TENANT") {
      fetchLease();
    }
  }, [user, authLoading, router, applicationId]);

  const fetchLease = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      
      // Vérifier que l'application est ACCEPTED
      if (data.status !== "ACCEPTED") {
        setError("La candidature doit être acceptée pour configurer le bail");
        return;
      }
      
      if (data.lease) {
        setLease({
          id: data.lease.id,
          startDate: data.lease.startDate,
          endDate: data.lease.endDate,
          monthlyRent: data.lease.monthlyRent,
          deposit: data.lease.deposit,
          application: {
            listing: {
              title: data.listing?.title || "Logement",
              address: data.listing?.address || null,
              city: data.listing?.city || "",
            },
          },
        });
        setIsPaymentSetup(!!data.lease.stripeSubscriptionId);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeLease = async () => {
    if (!startDate) {
      setError("Veuillez sélectionner une date de début");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const response = await fetch("/api/leases/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du bail");
      }

      // Mettre à jour le lease avec les données retournées
      if (data.lease) {
        setLease({
          id: data.lease.id,
          startDate: data.lease.startDate,
          endDate: data.lease.endDate,
          monthlyRent: data.lease.monthlyRent,
          deposit: data.lease.deposit,
          application: data.lease.application,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du bail");
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentSetup(true);
    setTimeout(() => {
      router.push("/tenant/applications");
    }, 2000);
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </main>
      </>
    );
  }

  if (!user || user.role !== "TENANT") {
    return null;
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Configuration du bail
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!lease ? (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-600" />
                  Étape 1 : Date de début du loyer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="startDate">
                    Date de début du loyer <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={minDate}
                    className="mt-2"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sélectionnez la date à partir de laquelle le loyer commencera à être facturé.
                  </p>
                </div>

                <Button
                  onClick={handleInitializeLease}
                  disabled={!startDate || isInitializing}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création du bail...
                    </>
                  ) : (
                    "Créer le bail"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : isPaymentSetup ? (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Paiement récurrent configuré avec succès !</p>
                    <p className="text-sm mt-1">Redirection en cours...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-violet-600" />
                    Résumé du bail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Logement:</span>
                    <span className="font-semibold">
                      {lease.application.listing.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de début:</span>
                    <span className="font-semibold">
                      {format(new Date(lease.startDate), "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de fin:</span>
                    <span className="font-semibold">
                      {format(new Date(lease.endDate), "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loyer mensuel:</span>
                    <span className="font-semibold text-violet-600">
                      {lease.monthlyRent.toLocaleString("fr-CA")} $ CAD
                    </span>
                  </div>
                  {lease.deposit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dépôt:</span>
                      <span className="font-semibold">
                        {lease.deposit.toLocaleString("fr-CA")} $ CAD
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-violet-600" />
                    Étape 2 : Configuration du paiement récurrent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Configurez votre paiement récurrent mensuel. Le loyer sera automatiquement
                    prélevé chaque mois à partir de la date de début.
                  </p>
                  <Elements stripe={stripePromise}>
                    <PaymentForm leaseId={lease.id} onSuccess={handlePaymentSuccess} />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

