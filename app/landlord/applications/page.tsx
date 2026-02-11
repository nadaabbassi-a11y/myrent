"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, MapPin, Mail, Calendar, FileText, User, Home, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Application {
  id: string;
  status: string;
  listing: {
    id: string;
    title: string;
    price: number;
    address: string | null;
  };
  tenant: {
    user: {
      name: string | null;
      email: string;
    };
  };
  appointment?: {
    slot?: {
      startAt: string;
      endAt: string;
    } | null;
  } | null;
  steps?: Array<{
    stepKey: string;
    isComplete: boolean;
  }>;
  consents?: Array<{
    type: string;
    acceptedAt: string;
  }>;
  createdAt: string;
}

export default function LandlordApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "LANDLORD")) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD") {
      fetchApplications();
    }
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupérer les listings du landlord
      const listingsResponse = await fetch("/api/landlord/listings", {
        cache: 'no-store',
      });
      
      if (!listingsResponse.ok) {
        throw new Error("Erreur lors du chargement des annonces");
      }

      const listingsData = await listingsResponse.json();
      const listingIds = listingsData.listings?.map((l: any) => l.id) || [];

      if (listingIds.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      // Récupérer les applications pour ces listings
      const applicationsResponse = await fetch("/api/landlord/applications", {
        cache: 'no-store',
      });

      if (!applicationsResponse.ok) {
        throw new Error("Erreur lors du chargement des candidatures");
      }

      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData.applications || []);
    } catch (err) {
      setError("Erreur lors du chargement des candidatures");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="bg-green-500 text-white border-0 rounded-full px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Acceptée</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500 text-white border-0 rounded-full px-3 py-1">
            <XCircle className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Rejetée</span>
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className="bg-blue-500 text-white border-0 rounded-full px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Soumise</span>
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-neutral-500 text-white border-0 rounded-full px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">Brouillon</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 text-white border-0 rounded-full px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            <span className="text-xs font-medium">{status}</span>
          </Badge>
        );
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

  const sortedApplications = [...applications].sort((a, b) => {
    if (a.status === "SUBMITTED" && b.status !== "SUBMITTED") return -1;
    if (a.status !== "SUBMITTED" && b.status === "SUBMITTED") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pendingCount = applications.filter(a => a.status === "SUBMITTED").length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-light">Retour au tableau de bord</span>
            </Link>

            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-neutral-900">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-neutral-900 mb-1">Candidatures</h1>
                  <p className="text-neutral-500 text-sm font-light">
                    Gérez les candidatures de vos locataires
                  </p>
                </div>
              </div>
              {pendingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {pendingCount} candidature{pendingCount > 1 ? 's' : ''} en attente de réponse
                  </span>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-light">{error}</span>
              </motion.div>
            )}

            {applications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl">
                  <CardContent className="p-16 text-center">
                    <Users className="h-20 w-20 text-neutral-300 mx-auto mb-6" />
                    <h3 className="text-xl font-light text-neutral-900 mb-2">Aucune candidature</h3>
                    <p className="text-neutral-500 text-sm font-light mb-4">
                      Les candidatures des locataires pour vos annonces apparaîtront ici.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {sortedApplications.map((application, index) => {
                    const isPending = application.status === "SUBMITTED";
                    const completedSteps = (application.steps || []).filter(s => s.isComplete).length;
                    const totalSteps = (application.steps || []).length;
                    const consentsCount = (application.consents || []).length;
                    
                    return (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={`border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden ${
                            isPending 
                              ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50/50 to-white" 
                              : "hover:border-neutral-300"
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                              {/* Avatar */}
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-light ${
                                isPending 
                                  ? "bg-blue-100 text-blue-700" 
                                  : "bg-neutral-100 text-neutral-600"
                              }`}>
                                {application.listing.title.charAt(0).toUpperCase()}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                      <h3 className={`text-xl font-light ${
                                        isPending ? "text-blue-900" : "text-neutral-900"
                                      }`}>
                                        {application.listing.title}
                                      </h3>
                                      {getStatusBadge(application.status)}
                                      {isPending && (
                                        <Badge className="bg-orange-500 text-white border-0 rounded-full px-3 py-1 animate-pulse">
                                          <AlertCircle className="h-3 w-3 mr-1.5" />
                                          <span className="text-xs font-medium">Action requise</span>
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Tenant Info */}
                                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <User className="h-4 w-4" />
                                        <span className="font-light">
                                          {application.tenant.user.name || application.tenant.user.email}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Mail className="h-4 w-4" />
                                        <span className="font-light">{application.tenant.user.email}</span>
                                      </div>
                                    </div>

                                    {/* Address */}
                                    {application.listing.address && (
                                      <div className="flex items-start gap-2 text-sm text-neutral-600 mb-3">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span className="font-light line-clamp-2">{application.listing.address}</span>
                                      </div>
                                    )}

                                    {/* Visit Date */}
                                    {application.appointment?.slot && (
                                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-light">
                                          Visite: {format(new Date(application.appointment.slot.startAt), "d MMM yyyy", { locale: fr })}
                                        </span>
                                      </div>
                                    )}

                                    {/* Progress */}
                                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-neutral-50 rounded-xl">
                                      <div>
                                        <p className="text-xs text-neutral-500 font-medium mb-1">Étapes complétées</p>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-neutral-900 rounded-full transition-all"
                                              style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                                            />
                                          </div>
                                          <span className="text-xs font-medium text-neutral-700">
                                            {completedSteps}/{totalSteps}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-neutral-500 font-medium mb-1">Consentements</p>
                                        <p className="text-sm font-light text-neutral-900">
                                          {consentsCount} accepté{consentsCount > 1 ? 's' : ''}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Date */}
                                    <p className="text-xs text-neutral-400 mt-4 font-light">
                                      Reçue le {format(new Date(application.createdAt), "d MMM yyyy", { locale: fr })}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Link href={`/landlord/applications/${application.id}`}>
                                      <Button 
                                        className={`h-11 px-6 rounded-xl font-light transition-all ${
                                          isPending 
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl" 
                                            : "bg-neutral-900 hover:bg-neutral-800 text-white"
                                        }`}
                                      >
                                        {isPending ? (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Consulter
                                          </>
                                        ) : (
                                          <>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Voir
                                          </>
                                        )}
                                      </Button>
                                    </Link>
                                    <Link href={`/listings/${application.listing.id}`}>
                                      <Button 
                                        variant="outline" 
                                        className="h-11 px-6 rounded-xl font-light border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                                      >
                                        <Home className="h-4 w-4 mr-2" />
                                        Annonce
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}

