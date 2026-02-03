"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, FileText, AlertCircle, CheckCircle, DollarSign, Calendar, Home, User, Phone, Mail, MapPin } from "lucide-react";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  documentId: string | null;
  pdfUrl: string | null;
  finalizedAt: string | null;
  tenantSignature?: {
    id: string;
    signerEmail: string;
    signerName: string | null;
    initials: string | null;
    signedAt: string;
    consentGiven: boolean;
  } | null;
  ownerSignature?: {
    id: string;
    signerEmail: string;
    signerName: string | null;
    initials: string | null;
    signedAt: string;
    consentGiven: boolean;
  } | null;
  application: {
    listing: {
      title: string;
      address: string | null;
      city: string;
      postalCode: string | null;
      bedrooms: number;
      bathrooms: number;
    };
    tenant: {
      id: string;
      phone: string | null;
      user: {
        name: string | null;
        email: string;
      };
    };
  };
}

export default function LandlordLeaseSignPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const [signatureConsent, setSignatureConsent] = useState(false);
  const [ownerInitials, setOwnerInitials] = useState("");

  useEffect(() => {
    if (!authLoading && user?.role === "LANDLORD") {
      fetchLease();
    } else if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, leaseId, router]);

  const fetchLease = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/landlord/leases/${leaseId}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Erreur lors du chargement du bail" }));
        throw new Error(data.error || "Erreur lors du chargement du bail");
      }

      const data = await response.json();

      if (!data.lease) {
        throw new Error("Bail introuvable");
      }

      setLease(data.lease);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du bail");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!lease) return;

    if (!signatureConsent) {
      setError("Vous devez cocher la case pour confirmer votre signature");
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      const response = await fetch(`/api/leases/${leaseId}/sign-owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consentGiven: signatureConsent,
          initials: ownerInitials.trim().toUpperCase() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la signature");
      }

      // Recharger les données du bail
      await fetchLease();

      // Si les deux ont signé, proposer la finalisation
      if (data.status === 'FINALIZED') {
        await handleFinalize();
      } else if (data.status === 'OWNER_SIGNED') {
        // Le bail est maintenant signé par le propriétaire, la page de suivi s'affichera automatiquement
        // Pas besoin de redirection, le rechargement des données suffit
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la signature");
    } finally {
      setIsSigning(false);
    }
  };

  const handleFinalize = async () => {
    if (!lease) return;

    setIsSigning(true);
    setError(null);

    try {
      const response = await fetch(`/api/leases/${leaseId}/finalize`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la finalisation");
      }

      await fetchLease();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la finalisation");
    } finally {
      setIsSigning(false);
    }
  };

  const renderLeaseStatus = () => {
    if (!lease) return null;
    
    if (lease.status === 'FINALIZED' && lease.pdfUrl) {
      return (
        <Card className="border-2 border-green-200 bg-green-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-green-700">
              <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-2">Bail finalisé</p>
                <div className="space-y-1 text-sm mb-4">
                  {lease.documentId && (
                    <p>
                      <strong>Identifiant du document :</strong> {lease.documentId}
                    </p>
                  )}
                  {lease.finalizedAt && (
                    <p>
                      <strong>Finalisé le :</strong> {format(new Date(lease.finalizedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  )}
                </div>
                <a
                  href={`/api/leases/${leaseId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2"
                >
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Télécharger le PDF finalisé
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (lease.status === 'TENANT_SIGNED' || lease.status === 'OWNER_SIGNED') {
      return (
        <Card className="border-2 border-yellow-200 bg-yellow-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-yellow-700">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-2">
                  {lease.status === 'TENANT_SIGNED' ? 'En attente de votre signature' : 'En attente de la signature du locataire'}
                </p>
                {lease.tenantSignature && (
                  <p className="text-sm mb-1">
                    Locataire signé le {format(new Date(lease.tenantSignature.signedAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
                {lease.ownerSignature && (
                  <p className="text-sm mb-1">
                    Vous avez signé le {format(new Date(lease.ownerSignature.signedAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
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

  if (!user || user.role !== "LANDLORD") {
    return null;
  }

  if (!lease) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-red-700">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Bail introuvable</p>
                    {error && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Calculer le solde à payer par le locataire
  const totalBalance = lease.deposit + lease.monthlyRent;

  // Fonction pour afficher la page de suivi
  const renderTrackingPage = () => {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8 text-violet-600" />
                Suivi du bail
              </h1>
              <p className="text-gray-600">
                Bail pour : {lease.application.listing.title}
              </p>
            </div>

            {renderLeaseStatus()}

            {/* Section Solde à payer */}
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <DollarSign className="h-5 w-5" />
                  Solde à payer par le locataire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Dépôt de garantie</span>
                      <span className="font-semibold text-gray-900">
                        {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Premier loyer mensuel</span>
                      <span className="font-semibold text-gray-900">
                        {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-blue-900">Total à payer</span>
                        <span className="text-2xl font-bold text-blue-900">
                          {totalBalance.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note :</strong> Le locataire doit payer ce montant avant le début du bail ({format(new Date(lease.startDate), "d MMMM yyyy", { locale: fr })}).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Informations de location */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-violet-600" />
                  Informations de location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Informations du logement */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-violet-600" />
                      Logement
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[100px]">Titre :</span>
                        <span className="text-gray-900">{lease.application.listing.title}</span>
                      </div>
                      {lease.application.listing.address && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-700 min-w-[100px]">Adresse :</span>
                          <span className="text-gray-900">{lease.application.listing.address}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[100px]">Ville :</span>
                        <span className="text-gray-900">
                          {lease.application.listing.city}
                          {lease.application.listing.postalCode && `, ${lease.application.listing.postalCode}`}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[100px]">Type :</span>
                        <span className="text-gray-900">
                          {lease.application.listing.bedrooms} chambre(s), {lease.application.listing.bathrooms} salle(s) de bain
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informations du locataire */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-violet-600" />
                      Locataire
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[100px]">Nom :</span>
                        <span className="text-gray-900">
                          {lease.application.tenant.user.name || 'Non renseigné'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[100px]">Email :</span>
                        <span className="text-gray-900">{lease.application.tenant.user.email}</span>
                      </div>
                      {lease.application.tenant.phone && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-700 min-w-[100px]">Téléphone :</span>
                          <span className="text-gray-900">{lease.application.tenant.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Dates et conditions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-600" />
                  Dates et conditions du bail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date de début</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(new Date(lease.startDate), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date de fin</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(new Date(lease.endDate), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Loyer mensuel</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {lease.monthlyRent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Dépôt de garantie</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {lease.deposit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bouton retour */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.push('/landlord/leases')}
              >
                Retour à la liste des baux
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  };

  // Si le bail est finalisé, afficher la page de suivi
  if (lease.status === 'FINALIZED' && lease.pdfUrl) {
    return renderTrackingPage();
  }

  // Si le propriétaire a signé, afficher la page de suivi
  if (lease.ownerSignature && (lease.status === 'OWNER_SIGNED' || lease.status === 'FINALIZED')) {
    return renderTrackingPage();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-violet-600" />
              Signature du bail - Propriétaire
            </h1>
            <p className="text-gray-600">
              Bail pour : {lease.application.listing.title}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Locataire : {lease.application.tenant.user.name || lease.application.tenant.user.email}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {renderLeaseStatus()}

          {/* Ne pas afficher le formulaire si déjà signé par le propriétaire */}
          {lease.ownerSignature && lease.status !== 'FINALIZED' ? (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-blue-700">
                  Vous avez déjà signé ce bail. En attente de la signature du locataire.
                </p>
              </CardContent>
            </Card>
          ) : !lease.ownerSignature ? (
            <Card className="border-2 border-violet-200 bg-violet-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Signature du propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important :</strong> En signant ce bail, vous reconnaissez avoir lu et accepté toutes les conditions. 
                    Ce document a la même valeur qu'un bail signé physiquement selon la réglementation du TAL.
                  </p>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Checkbox
                        id="signature-consent"
                        checked={signatureConsent}
                        onCheckedChange={(checked) => setSignatureConsent(checked === true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="signature-consent" className="text-sm font-medium cursor-pointer">
                          Je confirme avoir lu et accepté toutes les conditions du bail
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          En cochant cette case, vous reconnaissez avoir lu et accepté toutes les conditions 
                          énoncées dans ce bail de logement.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Label htmlFor="owner-initials" className="text-sm font-medium mb-2 block">
                        Initiales du propriétaire (optionnel)
                      </Label>
                      <Input
                        id="owner-initials"
                        type="text"
                        value={ownerInitials}
                        onChange={(e) => setOwnerInitials(e.target.value.toUpperCase())}
                        placeholder="Ex: M.D."
                        maxLength={10}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Entrez vos initiales (optionnel)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Informations de signature</p>
                      <p className="text-sm font-semibold mb-3">{user?.name || user?.email || 'Utilisateur'}</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>
                          <strong>Date :</strong> {format(new Date(), "d MMMM yyyy", { locale: fr })}
                        </p>
                        <p>
                          <strong>Heure :</strong> {format(new Date(), "HH:mm:ss", { locale: fr })} (UTC)
                        </p>
                        <p>
                          <strong>Identité :</strong> {user?.email || 'N/A'} (ID: {user?.id?.substring(0, 8) || 'N/A'}...)
                        </p>
                        {ownerInitials && (
                          <p>
                            <strong>Initiales :</strong> {ownerInitials.toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      <p className="mb-2">Preuve légale de signature :</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Date et heure enregistrées automatiquement</li>
                        <li>Identité du signataire vérifiée</li>
                        <li>Initiales enregistrées (si fournies)</li>
                        <li>Document horodaté et sécurisé</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Boutons d'action */}
          {!lease.ownerSignature && (
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Retour
              </Button>
              <Button
                onClick={handleSign}
                disabled={isSigning || !signatureConsent}
                className="bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signature en cours...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Signer le bail
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

