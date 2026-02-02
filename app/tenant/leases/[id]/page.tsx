"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FileText, Calendar, DollarSign, Home, User, Phone, Mail, MapPin, AlertCircle, CheckCircle } from "lucide-react";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  terms: string;
  landlordInfo?: any; // JSON avec les informations du propriétaire (section 1 TAL) - non modifiable
  propertyInfo?: any; // JSON avec les informations du logement (section 3 TAL) - non modifiable
  leaseTerms?: any; // JSON avec les conditions du bail (section 4 TAL) - non modifiable
  additionalConditions?: string | null; // Conditions particulières (section 5 TAL) - non modifiable
  status: string;
  documentId: string | null;
  pdfUrl: string | null;
  finalizedAt: string | null;
  signedAt: string | null;
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
      id: string;
      title: string;
      address: string | null;
      city: string;
      area: string | null;
      postalCode: string | null;
      bedrooms: number;
      bathrooms: number;
      description: string;
      landlord?: {
        user?: {
          id: string;
          name: string | null;
          email: string;
        };
        phone: string | null;
        company: string | null;
      };
    };
    tenant: {
      id: string;
      phone: string | null;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    };
    answers?: Array<{
      stepKey: string;
      data: any;
    }>;
  };
  annexDocuments?: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    version: number;
    tenantSignature?: {
      id: string;
      signerEmail: string;
      signerName: string | null;
      signedAt: string;
    } | null;
    ownerSignature?: {
      id: string;
      signerEmail: string;
      signerName: string | null;
      signedAt: string;
    } | null;
  }>;
}

export default function LeaseSignPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Champs du formulaire TAL
  const [landlordInfo, setLandlordInfo] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  const [tenantInfo, setTenantInfo] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  const [propertyInfo, setPropertyInfo] = useState({
    address: "",
    city: "",
    postalCode: "",
    type: "Appartement",
    rooms: "",
    heating: "",
    parking: false,
    storage: false,
    parkingDetails: "",
    storageDetails: "",
  });

  const [leaseTerms, setLeaseTerms] = useState({
    startDate: "",
    endDate: "",
    rent: "",
    deposit: "",
    paymentDate: "1",
    utilities: "",
    pets: false,
    petsDetails: "",
    smoking: false,
    repairs: "",
    rules: "",
    otherConditions: "",
  });

  // État pour la signature
  const [signatureConsent, setSignatureConsent] = useState(false);
  const [tenantInitials, setTenantInitials] = useState("");

  useEffect(() => {
    console.log('[LeaseSignPage] useEffect déclenché:', { authLoading, user: user?.id, role: user?.role, leaseId });
    
    if (!authLoading) {
      if (!user) {
        console.log('[LeaseSignPage] Pas d\'utilisateur, redirection vers signin');
        router.push("/auth/signin");
        return;
      }
      
      if (user.role !== "TENANT") {
        console.log('[LeaseSignPage] Utilisateur n\'est pas TENANT, rôle:', user.role);
        return;
      }
      
      if (leaseId) {
        console.log('[LeaseSignPage] Chargement du bail:', leaseId);
        fetchLease();
      } else {
        console.error('[LeaseSignPage] leaseId manquant');
        setError("ID du bail manquant");
        setIsLoading(false);
      }
    }
  }, [user, authLoading, leaseId, router]);

  const fetchLease = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!leaseId) {
        throw new Error("ID du bail manquant");
      }
      
      console.log('[fetchLease] Chargement du bail:', leaseId);
      
      // Timeout de sécurité pour éviter un chargement infini
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 secondes
      
      const response = await fetch(`/api/leases/${leaseId}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(errorData.error || "Erreur lors du chargement du bail");
      }
      
      const data = await response.json();
      console.log('[fetchLease] Données reçues:', data);

      if (!data.lease) {
        throw new Error("Bail introuvable");
      }

      setLease(data.lease);

      // Pré-remplir les champs avec les données existantes
      if (data.lease) {
        setLeaseTerms({
          startDate: format(new Date(data.lease.startDate), "yyyy-MM-dd"),
          endDate: format(new Date(data.lease.endDate), "yyyy-MM-dd"),
          rent: data.lease.monthlyRent.toString(),
          deposit: data.lease.deposit.toString(),
          paymentDate: "1",
          utilities: "",
          pets: false,
          petsDetails: "",
          smoking: false,
          repairs: "",
          rules: "",
          otherConditions: "",
        });

        // Récupérer les infos du locataire depuis l'application
        if (data.lease.application?.tenant?.user) {
          const tenantUser = data.lease.application.tenant.user;
          const tenantProfile = data.lease.application.tenant;
          
          // Récupérer l'adresse depuis les réponses de candidature
          const addressAnswer = data.lease.application.answers?.find((a: any) => a.stepKey === 'address');
          const identityAnswer = data.lease.application.answers?.find((a: any) => a.stepKey === 'identity');
          
          const addressData = addressAnswer?.data || {};
          const identityData = identityAnswer?.data || {};
          
          setTenantInfo({
            name: tenantUser.name || identityData.legalName || "",
            address: addressData.currentAddress || addressData.address || "",
            city: addressData.city || "",
            postalCode: addressData.postalCode || addressData.postal || "",
            phone: tenantProfile.phone || identityData.phone || "",
            email: tenantUser.email || "",
          });
        }

        // Récupérer les infos du propriétaire depuis landlordInfo (pré-remplies lors de l'acceptation)
        // ou depuis le listing si landlordInfo n'existe pas encore
        if (data.lease.landlordInfo) {
          // Utiliser les informations pré-remplies par le propriétaire
          try {
            const landlordInfoData = typeof data.lease.landlordInfo === 'string' 
              ? JSON.parse(data.lease.landlordInfo) 
              : data.lease.landlordInfo;
            
            setLandlordInfo({
              name: landlordInfoData.name || "",
              address: landlordInfoData.address || "",
              city: landlordInfoData.city || "",
              postalCode: landlordInfoData.postalCode || "",
              phone: landlordInfoData.phone || "",
              email: landlordInfoData.email || "",
            });
          } catch (e) {
            console.error("Erreur lors du parsing de landlordInfo:", e);
            // Fallback sur les informations du listing
            if (data.lease.application?.listing?.landlord) {
              const landlord = data.lease.application.listing.landlord;
              const landlordUser = landlord.user;
              
              setLandlordInfo({
                name: landlordUser.name || landlord.company || "",
                address: data.lease.application.listing.address || "",
                city: data.lease.application.listing.city || "",
                postalCode: data.lease.application.listing.postalCode || "",
                phone: landlord.phone || "",
                email: landlordUser.email || "",
              });
            }
          }
        } else if (data.lease.application?.listing?.landlord) {
          // Fallback sur les informations du listing si landlordInfo n'existe pas
          const landlord = data.lease.application.listing.landlord;
          const landlordUser = landlord.user;
          
          setLandlordInfo({
            name: landlordUser.name || landlord.company || "",
            address: data.lease.application.listing.address || "",
            city: data.lease.application.listing.city || "",
            postalCode: data.lease.application.listing.postalCode || "",
            phone: landlord.phone || "",
            email: landlordUser.email || "",
          });
        }

        // Récupérer les infos du logement depuis propertyInfo (pré-remplies lors de l'acceptation)
        // ou depuis le listing si propertyInfo n'existe pas encore
        if (data.lease.propertyInfo) {
          try {
            const propertyInfoData = typeof data.lease.propertyInfo === 'string' 
              ? JSON.parse(data.lease.propertyInfo) 
              : data.lease.propertyInfo;
            
            setPropertyInfo({
              address: propertyInfoData.address || "",
              city: propertyInfoData.city || "",
              postalCode: propertyInfoData.postalCode || "",
              type: propertyInfoData.type || "Appartement",
              rooms: propertyInfoData.rooms || "",
              heating: propertyInfoData.heating || "",
              parking: propertyInfoData.parking || false,
              parkingDetails: propertyInfoData.parkingDetails || "",
              storage: propertyInfoData.storage || false,
              storageDetails: propertyInfoData.storageDetails || "",
            });
          } catch (e) {
            console.error("Erreur lors du parsing de propertyInfo:", e);
            // Fallback sur les informations du listing
            if (data.lease.application?.listing) {
              const listing = data.lease.application.listing;
              setPropertyInfo({
                address: listing.address || "",
                city: listing.city || "",
                postalCode: listing.postalCode || "",
                type: "Appartement",
                rooms: `${listing.bedrooms} chambres, ${listing.bathrooms} salle(s) de bain`,
                heating: "",
                parking: false,
                storage: false,
                parkingDetails: "",
                storageDetails: "",
              });
            }
          }
        } else if (data.lease.application?.listing) {
          // Fallback sur les informations du listing si propertyInfo n'existe pas
          const listing = data.lease.application.listing;
          setPropertyInfo({
            address: listing.address || "",
            city: listing.city || "",
            postalCode: listing.postalCode || "",
            type: "Appartement",
            rooms: `${listing.bedrooms} chambres, ${listing.bathrooms} salle(s) de bain`,
            heating: "",
            parking: false,
            storage: false,
            parkingDetails: "",
            storageDetails: "",
          });
        }

        // Récupérer les conditions du bail depuis leaseTerms (pré-remplies lors de l'acceptation)
        if (data.lease.leaseTerms) {
          try {
            const leaseTermsData = typeof data.lease.leaseTerms === 'string' 
              ? JSON.parse(data.lease.leaseTerms) 
              : data.lease.leaseTerms;
            
            setLeaseTerms({
              startDate: format(new Date(data.lease.startDate), "yyyy-MM-dd"),
              endDate: format(new Date(data.lease.endDate), "yyyy-MM-dd"),
              rent: data.lease.monthlyRent.toString(),
              deposit: data.lease.deposit.toString(),
              paymentDate: "1", // Par défaut
              utilities: leaseTermsData.utilities || "",
              pets: leaseTermsData.pets || false,
              petsDetails: leaseTermsData.petsDetails || "",
              smoking: leaseTermsData.smoking || false,
              repairs: leaseTermsData.repairs || "",
              rules: leaseTermsData.rules || "",
              otherConditions: data.lease.additionalConditions || "",
            });
          } catch (e) {
            console.error("Erreur lors du parsing de leaseTerms:", e);
            // Fallback sur les valeurs par défaut
            setLeaseTerms({
              startDate: format(new Date(data.lease.startDate), "yyyy-MM-dd"),
              endDate: format(new Date(data.lease.endDate), "yyyy-MM-dd"),
              rent: data.lease.monthlyRent.toString(),
              deposit: data.lease.deposit.toString(),
              paymentDate: "1",
              utilities: "",
              pets: false,
              petsDetails: "",
              smoking: false,
              repairs: "",
              rules: "",
              otherConditions: data.lease.additionalConditions || "",
            });
          }
        } else {
          // Fallback sur les valeurs par défaut si leaseTerms n'existe pas
          setLeaseTerms({
            startDate: format(new Date(data.lease.startDate), "yyyy-MM-dd"),
            endDate: format(new Date(data.lease.endDate), "yyyy-MM-dd"),
            rent: data.lease.monthlyRent.toString(),
            deposit: data.lease.deposit.toString(),
            paymentDate: "1",
            utilities: "",
            pets: false,
            petsDetails: "",
            smoking: false,
            repairs: "",
            rules: "",
            otherConditions: data.lease.additionalConditions || "",
          });
        }
      }
    } catch (err: any) {
      console.error('[fetchLease] Erreur:', err);
      
      if (err.name === 'AbortError') {
        setError("Le chargement a pris trop de temps. Veuillez réessayer.");
      } else {
        setError(err.message || "Erreur lors du chargement du bail");
      }
      
      setLease(null); // S'assurer que lease est null en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!lease) return;

    // Validation de la signature
    if (!signatureConsent) {
      setError("Vous devez cocher la case pour confirmer votre signature");
      return;
    }

    if (!tenantInitials.trim()) {
      setError("Veuillez entrer vos initiales pour signer le bail");
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      const url = `/api/leases/${leaseId}/sign-tenant`;
      console.log('[handleSign] Appel API:', url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consentGiven: signatureConsent,
          initials: tenantInitials.trim().toUpperCase(),
        }),
      });

      console.log('[handleSign] Réponse reçue, status:', response.status);
      console.log('[handleSign] Content-Type:', response.headers.get("content-type"));

      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[handleSign] Réponse non-JSON reçue (premiers 500 caractères):", text.substring(0, 500));
        console.error("[handleSign] Status:", response.status);
        console.error("[handleSign] URL:", url);
        console.error("[handleSign] LeaseId:", leaseId);
        
        // Essayer de parser comme JSON si possible
        let errorMessage = `Erreur serveur (${response.status})`;
        try {
          const jsonData = JSON.parse(text);
          errorMessage = jsonData.error || errorMessage;
        } catch {
          // Ce n'est pas du JSON, c'est probablement du HTML
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            errorMessage = `Erreur serveur: La route API n'a pas été trouvée ou a retourné une page d'erreur HTML. Vérifiez que le serveur est bien démarré et que la route existe.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[handleSign] Données reçues:', data);
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la signature");
      }

      // Recharger les données du bail
      await fetchLease();

      // Si les deux ont signé, proposer la finalisation
      if (data.status === 'FINALIZED') {
        // Auto-finaliser
        await handleFinalize();
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

      // Recharger les données du bail
      await fetchLease();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la finalisation");
    } finally {
      setIsSigning(false);
    }
  };

  // Afficher le statut du bail
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
                  {lease.status === 'TENANT_SIGNED' ? 'En attente de la signature du propriétaire' : 'En attente de la signature du locataire'}
                </p>
                {lease.tenantSignature && (
                  <p className="text-sm mb-1">
                    Locataire signé le {format(new Date(lease.tenantSignature.signedAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
                {lease.ownerSignature && (
                  <p className="text-sm mb-1">
                    Propriétaire signé le {format(new Date(lease.ownerSignature.signedAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (lease.tenantSignature) {
      return (
        <Card className="border-2 border-blue-200 bg-blue-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-blue-700">
              <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-2">Bail signé par le locataire</p>
                <p className="text-sm">
                  Signé le {format(new Date(lease.tenantSignature.signedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  // Afficher le chargement seulement si on attend vraiment quelque chose
  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-gray-600">Vérification de l'authentification...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement du bail...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!authLoading && !user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Redirection vers la page de connexion...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!authLoading && user && user.role !== "TENANT") {
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
                    <p className="font-semibold mb-2">Accès non autorisé</p>
                    <p className="text-sm text-red-600 mb-4">
                      Vous devez être connecté en tant que locataire pour accéder à cette page.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="mt-4"
                    >
                      Retour à l'accueil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
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
                      <p className="text-sm text-red-600 mb-2">{error}</p>
                    )}
                    <p className="text-sm text-red-600 mb-4">
                      Le bail demandé n'a pas pu être trouvé. Cela peut arriver si :
                    </p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1 mb-4">
                      <li>Le bail n'existe pas encore</li>
                      <li>Vous n'avez pas l'autorisation d'accéder à ce bail</li>
                      <li>L'identifiant du bail est incorrect</li>
                    </ul>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/tenant/applications")}
                      className="mt-4"
                    >
                      Retour aux candidatures
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Si le bail est finalisé, afficher seulement le statut et le lien PDF
  if (lease.status === 'FINALIZED' && lease.pdfUrl) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {renderLeaseStatus()}
          </div>
        </main>
      </>
    );
  }

  // Afficher un message d'erreur si présent
  if (error && !lease) {
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
                    <p className="font-semibold mb-2">Erreur de chargement</p>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        fetchLease();
                      }}
                      className="mt-4"
                    >
                      Réessayer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-violet-600" />
              Bail de logement (TAL)
            </h1>
            <p className="text-gray-600 mb-2">
              Formulaire obligatoire du Tribunal administratif du logement (TAL) du Québec
            </p>
            <p className="text-xs text-gray-500 italic">
              Ce document reprend le contenu du formulaire officiel du Tribunal administratif du logement (TAL).
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {renderLeaseStatus()}

          {/* Ne pas afficher le formulaire si déjà signé par le locataire */}
          {lease.tenantSignature && lease.status !== 'FINALIZED' ? (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-blue-700">
                  Vous avez déjà signé ce bail. En attente de la signature du propriétaire.
                </p>
              </CardContent>
            </Card>
          ) : !lease.tenantSignature ? (
          <div className="space-y-6">
            {/* Section 1: Informations du locateur (non modifiable) */}
            <Card className="border-2 bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-violet-600" />
                  Section 1 - Locateur (Propriétaire)
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Ces informations ont été pré-remplies par le propriétaire et ne peuvent pas être modifiées.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="landlord-name">
                      Nom complet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="landlord-name"
                      value={landlordInfo.name}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlord-phone">Téléphone</Label>
                    <Input
                      id="landlord-phone"
                      type="tel"
                      value={landlordInfo.phone}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlord-email">Courriel</Label>
                    <Input
                      id="landlord-email"
                      type="email"
                      value={landlordInfo.email}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlord-address">
                      Adresse <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="landlord-address"
                      value={landlordInfo.address}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlord-city">
                      Ville <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="landlord-city"
                      value={landlordInfo.city}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlord-postalCode">Code postal</Label>
                    <Input
                      id="landlord-postalCode"
                      value={landlordInfo.postalCode}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="A1A 1A1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Informations du locataire */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-violet-600" />
                  Section 2 - Locataire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenant-name">
                      Nom complet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tenant-name"
                      value={tenantInfo.name}
                      onChange={(e) => setTenantInfo({ ...tenantInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant-phone">Téléphone</Label>
                    <Input
                      id="tenant-phone"
                      type="tel"
                      value={tenantInfo.phone}
                      onChange={(e) => setTenantInfo({ ...tenantInfo, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant-email">Courriel</Label>
                    <Input
                      id="tenant-email"
                      type="email"
                      value={tenantInfo.email}
                      onChange={(e) => setTenantInfo({ ...tenantInfo, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant-address">
                      Adresse <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tenant-address"
                      value={tenantInfo.address}
                      onChange={(e) => setTenantInfo({ ...tenantInfo, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant-city">
                      Ville <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tenant-city"
                      value={tenantInfo.city}
                      onChange={(e) => setTenantInfo({ ...tenantInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant-postalCode">Code postal</Label>
                    <Input
                      id="tenant-postalCode"
                      value={tenantInfo.postalCode}
                      onChange={(e) => setTenantInfo({ ...tenantInfo, postalCode: e.target.value })}
                      placeholder="A1A 1A1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Description du logement (non modifiable) */}
            <Card className="border-2 bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-violet-600" />
                  Section 3 - Description du logement
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Ces informations ont été pré-remplies par le propriétaire et ne peuvent pas être modifiées.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property-address">
                      Adresse du logement <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="property-address"
                      value={propertyInfo.address}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="property-city">
                      Ville <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="property-city"
                      value={propertyInfo.city}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="property-postalCode">Code postal</Label>
                    <Input
                      id="property-postalCode"
                      value={propertyInfo.postalCode}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="A1A 1A1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="property-type">Type de logement</Label>
                    <Input
                      id="property-type"
                      value={propertyInfo.type}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="property-rooms">Nombre de pièces</Label>
                    <Input
                      id="property-rooms"
                      value={propertyInfo.rooms}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="Ex: 3 chambres, 1 salle de bain"
                    />
                  </div>
                  <div>
                    <Label htmlFor="property-heating">Système de chauffage</Label>
                    <Input
                      id="property-heating"
                      value={propertyInfo.heating}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="Ex: Électrique, Gaz, etc."
                    />
                  </div>
                  {propertyInfo.parking && (
                    <div className="md:col-span-2">
                      <Label htmlFor="property-parkingDetails">Détails du stationnement</Label>
                      <Input
                        id="property-parkingDetails"
                        value={propertyInfo.parkingDetails}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  )}
                  {propertyInfo.storage && (
                    <div className="md:col-span-2">
                      <Label htmlFor="property-storageDetails">Détails de l'entreposage</Label>
                      <Input
                        id="property-storageDetails"
                        value={propertyInfo.storageDetails}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Durée et conditions du bail (non modifiable) */}
            <Card className="border-2 bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-600" />
                  Section 4 - Durée et conditions du bail
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Ces informations ont été pré-remplies par le propriétaire et ne peuvent pas être modifiées.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lease-startDate">
                      Date de début du bail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lease-startDate"
                      type="date"
                      value={leaseTerms.startDate}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lease-endDate">
                      Date de fin du bail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lease-endDate"
                      type="date"
                      value={leaseTerms.endDate}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lease-rent">
                      Loyer mensuel (en dollars) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lease-rent"
                      type="number"
                      step="0.01"
                      value={leaseTerms.rent}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lease-paymentDate">
                      Date d'échéance du loyer (jour du mois) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lease-paymentDate"
                      type="number"
                      min="1"
                      max="31"
                      value={leaseTerms.paymentDate}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lease-deposit">
                      Dépôt de garantie (en dollars) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lease-deposit"
                      type="number"
                      step="0.01"
                      value={leaseTerms.deposit}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lease-utilities">Utilités incluses</Label>
                    <Input
                      id="lease-utilities"
                      value={leaseTerms.utilities}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="Ex: Électricité, Eau, Chauffage"
                    />
                  </div>
                </div>
                
                {/* Conditions supplémentaires TAL */}
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Conditions supplémentaires</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lease-pets"
                        checked={leaseTerms.pets}
                        disabled
                        className="rounded"
                      />
                      <Label htmlFor="lease-pets" className={leaseTerms.pets ? "" : "text-gray-400"}>
                        Animaux domestiques autorisés
                      </Label>
                    </div>
                    {leaseTerms.pets && (
                      <div className="md:col-span-2">
                        <Label htmlFor="lease-petsDetails">Détails (type, nombre, conditions)</Label>
                        <Input
                          id="lease-petsDetails"
                          value={leaseTerms.petsDetails}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed"
                          placeholder="Ex: 1 chat, pas de chien"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lease-smoking"
                        checked={leaseTerms.smoking}
                        disabled
                        className="rounded"
                      />
                      <Label htmlFor="lease-smoking" className={leaseTerms.smoking ? "" : "text-gray-400"}>
                        Fumeur autorisé
                      </Label>
                    </div>
                  </div>
                  
                  {leaseTerms.repairs && (
                    <div className="mt-4">
                      <Label htmlFor="lease-repairs">Responsabilité des réparations</Label>
                      <Textarea
                        id="lease-repairs"
                        value={leaseTerms.repairs}
                        readOnly
                        className="min-h-[80px] bg-gray-100 cursor-not-allowed"
                        placeholder="Ex: Locataire responsable des réparations mineures, propriétaire pour les réparations majeures"
                      />
                    </div>
                  )}
                  
                  {leaseTerms.rules && (
                    <div>
                      <Label htmlFor="lease-rules">Règles de vie et règlements</Label>
                      <Textarea
                        id="lease-rules"
                        value={leaseTerms.rules}
                        readOnly
                        className="min-h-[80px] bg-gray-100 cursor-not-allowed"
                        placeholder="Ex: Heures de silence (22h-7h), nombre de visiteurs, etc."
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Conditions particulières (non modifiable) */}
            <Card className="border-2 bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Section 5 - Conditions particulières et clauses additionnelles
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Ces informations ont été pré-remplies par le propriétaire et ne peuvent pas être modifiées.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lease-otherConditions">Autres conditions ou clauses particulières</Label>
                  <Textarea
                    id="lease-otherConditions"
                    value={leaseTerms.otherConditions || ""}
                    readOnly
                    className="min-h-[100px] bg-gray-100 cursor-not-allowed"
                    placeholder={leaseTerms.otherConditions ? "" : "Aucune condition particulière"}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note :</strong> Toutes les conditions doivent être conformes à la réglementation du TAL. 
                    Les clauses abusives ou contraires à la loi sont nulles de plein droit.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Séparation : Bail TAL vs Documents annexes */}
            <div className="my-8 border-t-2 border-gray-300 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents annexes</h2>
              <p className="text-sm text-gray-600 mb-6">
                Les documents suivants sont séparés du bail TAL et peuvent être signés indépendamment.
              </p>
            </div>

            {/* Document annexe 1: Consentement paiement en ligne (optionnel) */}
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Paiement en ligne (optionnel)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  Vous pouvez choisir de configurer le paiement automatique du loyer mensuel via notre système 
                  de paiement sécurisé (Stripe). Cette option est <strong>facultative</strong> et peut être 
                  configurée à tout moment.
                </p>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Note :</strong> Le paiement en ligne est optionnel. Vous pouvez également payer 
                    par d'autres moyens convenus avec le propriétaire.
                  </p>
                  <p className="text-xs text-gray-500">
                    Si vous souhaitez configurer le paiement automatique, vous pourrez le faire après la signature du bail.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Document annexe 2: Consentement vérification de crédit */}
            <Card className="border-2 border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Consentement à la vérification de crédit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  Ce consentement a été donné lors de votre candidature. Il permet au propriétaire 
                  de vérifier votre historique de crédit pour évaluer votre solvabilité.
                </p>
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600">
                    <strong>Statut :</strong> Consentement déjà donné lors de la candidature (étape 8)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Signatures */}
            <Card className="border-2 border-violet-200 bg-violet-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Section 6 - Signatures
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
                      <Label htmlFor="tenant-initials" className="text-sm font-medium mb-2 block">
                        Initiales du locataire <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="tenant-initials"
                        type="text"
                        value={tenantInitials}
                        onChange={(e) => setTenantInitials(e.target.value.toUpperCase())}
                        placeholder="Ex: J.D."
                        maxLength={10}
                        className="max-w-xs"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Entrez vos initiales (ex: J.D. pour Jean Dupont)
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Informations de signature</p>
                      <p className="text-sm font-semibold mb-3">{tenantInfo.name || user.name || user.email}</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>
                          <strong>Date :</strong> {format(new Date(), "d MMMM yyyy", { locale: fr })}
                        </p>
                        <p>
                          <strong>Heure :</strong> {format(new Date(), "HH:mm:ss", { locale: fr })} (UTC)
                        </p>
                        <p>
                          <strong>Identité :</strong> {user.email} (ID: {user.id.substring(0, 8)}...)
                        </p>
                        {tenantInitials && (
                          <p>
                            <strong>Initiales :</strong> {tenantInitials.toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      <p className="mb-2">Preuve légale de signature :</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Date et heure enregistrées automatiquement</li>
                        <li>Identité du signataire vérifiée</li>
                        <li>Initiales enregistrées</li>
                        <li>Document horodaté et sécurisé</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Retour
              </Button>
              <Button
                onClick={handleSign}
                disabled={isSigning || !signatureConsent || !tenantInitials.trim()}
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
          </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

