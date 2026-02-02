"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, Home, Calendar, FileText, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ApplicationDetails {
  id: string;
  status: string;
  listing: {
    id: string;
    title: string;
    address: string | null;
    city: string | null;
    area: string | null;
    postalCode: string | null;
    price: number;
    minTerm?: number;
    landlord?: {
      phone: string | null;
      company: string | null;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    };
  };
  tenant: {
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  appointment: {
    id: string;
    slot: {
      startAt: string;
      endAt: string;
    } | null;
  } | null;
  steps: Array<{
    stepKey: string;
    isComplete: boolean;
    updatedAt: string;
  }>;
  answers: Record<string, any>;
  consents: Array<{
    type: string;
    textVersion: string;
    acceptedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const STEP_LABELS: Record<string, string> = {
  identity: "Identité",
  address: "Adresse",
  status: "Statut",
  income: "Revenus",
  occupants: "Occupants",
  references: "Références",
  documents: "Documents",
  consents: "Consentements",
};

const CONSENT_LABELS: Record<string, string> = {
  CREDIT_CHECK: "Vérification de crédit",
  DATA_SHARING: "Partage de données",
  REFERENCES_CONTACT: "Contact des références",
};

export default function LandlordApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [landlordInfo, setLandlordInfo] = useState({
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
    parkingDetails: "",
    storage: false,
    storageDetails: "",
  });
  const [leaseTerms, setLeaseTerms] = useState({
    utilities: "",
    pets: false,
    petsDetails: "",
    smoking: false,
    repairs: "",
    rules: "",
  });
  const [additionalConditions, setAdditionalConditions] = useState("");

  const applicationId = params.id as string;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
      return;
    }

    if (user && user.role === "LANDLORD") {
      fetchApplicationDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, applicationId]);

  // Pré-remplir les informations du propriétaire quand l'application est chargée
  useEffect(() => {
    if (application && user && application.listing?.landlord) {
      const landlord = application.listing.landlord;
      const landlordUser = landlord.user;
      
      setLandlordInfo({
        name: user.name || landlordUser?.name || landlord.company || "",
        address: application.listing.address || "",
        city: application.listing.city || "",
        postalCode: application.listing.postalCode || "",
        phone: landlord.phone || "",
        email: user.email || landlordUser?.email || "",
      });
    }
  }, [application, user]);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/landlord/applications/${applicationId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du chargement de la candidature");
      }
      const data = await response.json();
      setApplication(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement de la candidature:", err);
      setError(err.message || "Erreur lors du chargement de la candidature");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!application) return;
    
    // Validate landlord info (section 1)
    if (!landlordInfo.name || !landlordInfo.address || !landlordInfo.city) {
      setError("Veuillez remplir tous les champs obligatoires de la section 1 (Locateur)");
      return;
    }

    // Validate property info (section 3)
    if (!propertyInfo.address || !propertyInfo.city) {
      setError("Veuillez remplir tous les champs obligatoires de la section 3 (Description du logement)");
      return;
    }

    // Validate start date
    if (!startDate) {
      setError("Veuillez sélectionner une date de début de loyer");
      return;
    }

    const selectedDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError("La date de début ne peut pas être dans le passé");
      return;
    }

    setProcessingId(application.id);
    setError(null);
    
    try {
      const response = await fetch(`/api/applications/${application.id}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          landlordInfo: {
            name: landlordInfo.name,
            address: landlordInfo.address,
            city: landlordInfo.city,
            postalCode: landlordInfo.postalCode,
            phone: landlordInfo.phone,
            email: landlordInfo.email,
          },
          propertyInfo: {
            address: propertyInfo.address,
            city: propertyInfo.city,
            postalCode: propertyInfo.postalCode,
            type: propertyInfo.type,
            rooms: propertyInfo.rooms,
            heating: propertyInfo.heating,
            parking: propertyInfo.parking,
            parkingDetails: propertyInfo.parkingDetails,
            storage: propertyInfo.storage,
            storageDetails: propertyInfo.storageDetails,
          },
          leaseTerms: {
            utilities: leaseTerms.utilities,
            pets: leaseTerms.pets,
            petsDetails: leaseTerms.petsDetails,
            smoking: leaseTerms.smoking,
            repairs: leaseTerms.repairs,
            rules: leaseTerms.rules,
          },
          additionalConditions: additionalConditions,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'acceptation");
      }

      setApplication({ ...application, status: "ACCEPTED" });
      setShowAcceptDialog(false);
      setStartDate("");
      
      // Refresh application details to get lease info
      fetchApplicationDetails();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'acceptation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!confirm("Êtes-vous sûr de vouloir rejeter cette candidature ?")) {
      return;
    }

    setProcessingId(application.id);
    try {
      const response = await fetch(`/api/applications/${application.id}/reject`, {
        method: "PATCH",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du rejet");
      }

      setApplication({ ...application, status: "REJECTED" });
    } catch (err: any) {
      setError(err.message || "Erreur lors du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-600 text-white">Acceptée</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600 text-white">Rejetée</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-blue-600 text-white">Soumise</Badge>;
      case "DRAFT":
        return <Badge className="bg-gray-500 text-white">Brouillon</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">{status}</Badge>;
    }
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

  if (!application) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button variant="outline" onClick={() => router.push("/landlord/applications")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux candidatures
              </Button>
              {error && (
                <p className="mt-6 text-red-600">
                  {error}
                </p>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  const visitDate =
    application.appointment?.slot?.startAt
      ? new Date(application.appointment.slot.startAt).toLocaleString("fr-FR")
      : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => router.push("/landlord/applications")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux candidatures
              </Button>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                  {renderStatusBadge(application.status)}
                  <span className="text-sm text-gray-500">
                    Reçue le{" "}
                    {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {application.status === "SUBMITTED" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setShowAcceptDialog(true)}
                        disabled={processingId === application.id}
                      >
                        {processingId === application.id ? (
                          "Traitement..."
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accepter
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={processingId === application.id}
                      >
                        {processingId === application.id ? (
                          "Traitement..."
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/landlord/messages")}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contacter
                  </Button>
                </div>
              </div>
            </div>

            {/* Résumé principal */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Candidature pour {application.listing.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-gray-700 flex items-center gap-2">
                      <Home className="h-4 w-4 text-violet-600" />
                      <span>
                        {application.listing.address ||
                          `${application.listing.area || ""} ${
                            application.listing.city || ""
                          }`.trim()}
                      </span>
                    </p>
                    <p className="text-gray-700 mt-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-violet-600" />
                      <span>
                        {application.tenant.user.name ||
                          application.tenant.user.email}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Email : {application.tenant.user.email}
                    </p>
                    {visitDate && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-violet-600" />
                        <span>Visite le {visitDate}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/listings/${application.listing.id}`}>
                      <Button variant="outline" size="sm">
                        Voir l'annonce
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identité */}
            {application.answers.identity && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identité</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nom complet</p>
                    <p className="font-medium text-gray-900">
                      {application.answers.identity.legalName || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date de naissance</p>
                    <p className="font-medium text-gray-900">
                      {application.answers.identity.dateOfBirth || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-900">
                      {application.answers.identity.phone || "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adresse actuelle */}
            {application.answers.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adresse actuelle</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium text-gray-900">
                    {application.answers.address.currentAddress || "—"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Statut & revenus */}
            {(application.answers.status || application.answers.income) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Situation & revenus</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  {application.answers.status && (
                    <>
                      <div>
                        <p className="text-gray-500">Statut</p>
                        <p className="font-medium text-gray-900">
                          {application.answers.status.status || "—"}
                        </p>
                      </div>
                      {application.answers.status.employerName && (
                        <div>
                          <p className="text-gray-500">Employeur</p>
                          <p className="font-medium text-gray-900">
                            {application.answers.status.employerName}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {application.answers.income && (
                    <>
                      {application.answers.income.monthlyIncome && (
                        <div>
                          <p className="text-gray-500">Revenu mensuel estimé</p>
                          <p className="font-medium text-gray-900">
                            {application.answers.income.monthlyIncome} $
                          </p>
                        </div>
                      )}
                      {application.answers.income.otherIncome && (
                        <div>
                          <p className="text-gray-500">Autres revenus</p>
                          <p className="font-medium text-gray-900">
                            {application.answers.income.otherIncome}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Occupants */}
            {application.answers.occupants && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Occupants</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {Array.isArray(application.answers.occupants.occupants) &&
                  application.answers.occupants.occupants.length > 0 ? (
                    <div className="space-y-2">
                      {application.answers.occupants.occupants.map(
                        (occ: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {occ.name || "Occupant"}
                              </p>
                              <p className="text-xs text-gray-600">
                                Relation : {occ.relationship || "—"}
                              </p>
                            </div>
                            {occ.age && (
                              <span className="text-xs font-semibold text-gray-700 bg-white rounded-full px-3 py-1 border">
                                {occ.age} ans
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucun autre occupant déclaré.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Références */}
            {application.answers.references && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Références</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {Array.isArray(application.answers.references.references) &&
                  application.answers.references.references.length > 0 ? (
                    <div className="space-y-2">
                      {application.answers.references.references.map(
                        (ref: any, index: number) => (
                          <div
                            key={index}
                            className="rounded-lg border bg-gray-50 px-3 py-2"
                          >
                            <p className="font-medium text-gray-900">
                              {ref.name || "Référence"}
                            </p>
                            <p className="text-xs text-gray-600">
                              Relation : {ref.relationship || "—"}
                            </p>
                            {(ref.email || ref.phone) && (
                              <p className="text-xs text-gray-600 mt-1">
                                {ref.email && <>Email : {ref.email}</>}{" "}
                                {ref.phone && (
                                  <>
                                    {ref.email && " • "}Téléphone : {ref.phone}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Aucune référence supplémentaire fournie.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents requis */}
            {application.answers.documents && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  {(() => {
                    const docsAnswer = application.answers.documents;
                    const rawDocs =
                      docsAnswer.documentsReady || docsAnswer;
                    const entries =
                      rawDocs && typeof rawDocs === "object"
                        ? Object.entries(rawDocs)
                        : [];

                    const enabledDocs = entries.filter(
                      ([, value]) => value === true
                    );

                    const files = Array.isArray(docsAnswer.files)
                      ? docsAnswer.files
                      : [];

                    return (
                      <>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            Documents prévus
                          </p>
                          {enabledDocs.length === 0 ? (
                            <p className="text-gray-500">
                              Aucun document particulier indiqué.
                            </p>
                          ) : (
                            <ul className="list-disc list-inside space-y-1">
                              {enabledDocs.map(([label]) => (
                                <li key={label} className="text-gray-800">
                                  {label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {files.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">
                              Fichiers téléversés
                            </p>
                            <ul className="space-y-1">
                              {files.map(
                                (
                                  file: { url: string; name?: string },
                                  index: number
                                ) => (
                                  <li key={index}>
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-violet-600 underline"
                                    >
                                      {file.name || `Document ${index + 1}`}
                                    </a>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Autres données brutes (étapes techniques éventuelles) */}
            {Object.entries(application.answers).some(
              ([key]) =>
                ![
                  "identity",
                  "address",
                  "status",
                  "income",
                  "occupants",
                  "references",
                  "documents",
                  "consents",
                ].includes(key)
            ) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Autres informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {Object.entries(application.answers)
                    .filter(
                      ([key]) =>
                        ![
                          "identity",
                          "address",
                          "status",
                          "income",
                          "occupants",
                          "references",
                        ].includes(key)
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="font-semibold text-gray-800 mb-1">
                          {STEP_LABELS[key] || key}
                        </p>
                        <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Consentements */}
            {application.consents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consentements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {application.consents.map((consent) => (
                    <div
                      key={consent.type}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {CONSENT_LABELS[consent.type] || consent.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          Version : {consent.textVersion}
                        </p>
                      </div>
                      <span className="text-xs text-gray-600">
                        Accepté le{" "}
                        {new Date(consent.acceptedAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Dialog pour accepter avec informations propriétaire et date de début */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Accepter la candidature</DialogTitle>
            <DialogDescription>
              Veuillez remplir vos informations (section 1 du bail TAL) et définir la date de début du loyer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Section 1: Informations du locateur (propriétaire) - pré-remplie, non modifiable */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Section 1 - Locateur (Propriétaire)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ces informations sont pré-remplies depuis votre compte et ne peuvent pas être modifiées.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="landlord-name" className="mb-2 block">
                    Nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="landlord-name"
                    value={landlordInfo.name}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="landlord-email" className="mb-2 block">
                    Courriel
                  </Label>
                  <Input
                    id="landlord-email"
                    type="email"
                    value={landlordInfo.email}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="landlord-phone" className="mb-2 block">
                    Téléphone
                  </Label>
                  <Input
                    id="landlord-phone"
                    type="tel"
                    value={landlordInfo.phone}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="landlord-address" className="mb-2 block">
                    Adresse <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="landlord-address"
                    value={landlordInfo.address}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="landlord-city" className="mb-2 block">
                    Ville <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="landlord-city"
                    value={landlordInfo.city}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="landlord-postalCode" className="mb-2 block">
                    Code postal
                  </Label>
                  <Input
                    id="landlord-postalCode"
                    value={landlordInfo.postalCode}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="A1A 1A1"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Description du logement */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4">Section 3 - Description du logement</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="property-address" className="mb-2 block">
                    Adresse du logement <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="property-address"
                    value={propertyInfo.address}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="property-city" className="mb-2 block">
                    Ville <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="property-city"
                    value={propertyInfo.city}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="property-postalCode" className="mb-2 block">
                    Code postal
                  </Label>
                  <Input
                    id="property-postalCode"
                    value={propertyInfo.postalCode}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, postalCode: e.target.value })}
                    placeholder="A1A 1A1"
                  />
                </div>
                <div>
                  <Label htmlFor="property-type" className="mb-2 block">
                    Type de logement
                  </Label>
                  <Input
                    id="property-type"
                    value={propertyInfo.type}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, type: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="property-rooms" className="mb-2 block">
                    Nombre de pièces
                  </Label>
                  <Input
                    id="property-rooms"
                    value={propertyInfo.rooms}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, rooms: e.target.value })}
                    placeholder="Ex: 3 chambres, 1 salle de bain"
                  />
                </div>
                <div>
                  <Label htmlFor="property-heating" className="mb-2 block">
                    Système de chauffage
                  </Label>
                  <Input
                    id="property-heating"
                    value={propertyInfo.heating}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, heating: e.target.value })}
                    placeholder="Ex: Électrique, Gaz, etc."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="property-parking"
                    checked={propertyInfo.parking}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, parking: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="property-parking" className="cursor-pointer">
                    Stationnement inclus
                  </Label>
                </div>
                {propertyInfo.parking && (
                  <div className="md:col-span-2">
                    <Label htmlFor="property-parkingDetails" className="mb-2 block">
                      Détails du stationnement
                    </Label>
                    <Input
                      id="property-parkingDetails"
                      value={propertyInfo.parkingDetails}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, parkingDetails: e.target.value })}
                      placeholder="Ex: Place numérotée #12, extérieur"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="property-storage"
                    checked={propertyInfo.storage}
                    onChange={(e) => setPropertyInfo({ ...propertyInfo, storage: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="property-storage" className="cursor-pointer">
                    Entreposage inclus
                  </Label>
                </div>
                {propertyInfo.storage && (
                  <div className="md:col-span-2">
                    <Label htmlFor="property-storageDetails" className="mb-2 block">
                      Détails de l'entreposage
                    </Label>
                    <Input
                      id="property-storageDetails"
                      value={propertyInfo.storageDetails}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, storageDetails: e.target.value })}
                      placeholder="Ex: Caveau au sous-sol"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Durée et conditions du bail */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4">Section 4 - Conditions du bail</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lease-utilities" className="mb-2 block">
                    Utilités incluses
                  </Label>
                  <Input
                    id="lease-utilities"
                    value={leaseTerms.utilities}
                    onChange={(e) => setLeaseTerms({ ...leaseTerms, utilities: e.target.value })}
                    placeholder="Ex: Électricité, Eau, Chauffage"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lease-pets"
                    checked={leaseTerms.pets}
                    onChange={(e) => setLeaseTerms({ ...leaseTerms, pets: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="lease-pets" className="cursor-pointer">
                    Animaux domestiques autorisés
                  </Label>
                </div>
                {leaseTerms.pets && (
                  <div>
                    <Label htmlFor="lease-petsDetails" className="mb-2 block">
                      Détails (type, nombre, conditions)
                    </Label>
                    <Input
                      id="lease-petsDetails"
                      value={leaseTerms.petsDetails}
                      onChange={(e) => setLeaseTerms({ ...leaseTerms, petsDetails: e.target.value })}
                      placeholder="Ex: 1 chat, pas de chien"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lease-smoking"
                    checked={leaseTerms.smoking}
                    onChange={(e) => setLeaseTerms({ ...leaseTerms, smoking: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="lease-smoking" className="cursor-pointer">
                    Fumeur autorisé
                  </Label>
                </div>
                <div>
                  <Label htmlFor="lease-repairs" className="mb-2 block">
                    Responsabilité des réparations
                  </Label>
                  <textarea
                    id="lease-repairs"
                    value={leaseTerms.repairs}
                    onChange={(e) => setLeaseTerms({ ...leaseTerms, repairs: e.target.value })}
                    placeholder="Ex: Locataire responsable des réparations mineures, propriétaire pour les réparations majeures"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <Label htmlFor="lease-rules" className="mb-2 block">
                    Règles de vie et règlements
                  </Label>
                  <textarea
                    id="lease-rules"
                    value={leaseTerms.rules}
                    onChange={(e) => setLeaseTerms({ ...leaseTerms, rules: e.target.value })}
                    placeholder="Ex: Heures de silence (22h-7h), nombre de visiteurs, etc."
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Conditions particulières */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4">Section 5 - Conditions particulières</h3>
              <div>
                <Label htmlFor="additional-conditions" className="mb-2 block">
                  Autres conditions ou clauses particulières
                </Label>
                <textarea
                  id="additional-conditions"
                  value={additionalConditions}
                  onChange={(e) => setAdditionalConditions(e.target.value)}
                  placeholder="Toute autre condition particulière non couverte ci-dessus"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Date de début */}
            <div>
              <Label htmlFor="startDate" className="mb-2 block">
                Date de début du loyer <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Le bail sera d'une durée de {application?.listing?.minTerm ?? 12} mois à partir de cette date.
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAcceptDialog(false);
                setStartDate("");
                setError(null);
              }}
              disabled={processingId === application?.id}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!startDate || !landlordInfo.name || !landlordInfo.address || !landlordInfo.city || !propertyInfo.address || !propertyInfo.city || processingId === application?.id}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {processingId === application?.id ? (
                "Traitement..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accepter et créer le bail
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


