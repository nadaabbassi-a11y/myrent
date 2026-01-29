"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { FileText, Clock, CheckCircle, XCircle, MessageSquare, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  message: string | null;
  listing: {
    id: string;
    title: string;
    price: number;
    city: string;
    area: string | null;
    bedrooms: number;
    bathrooms: number;
  };
  lease: {
    id: string;
    signedAt: string | null;
  } | null;
  messageThread: {
    id: string;
    messages: Array<{
      id: string;
      content: string;
      createdAt: string;
    }>;
  } | null;
}

export default function ApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguageContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user && user.role === "TENANT") {
      fetchApplications();
    }
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tenant/applications");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des candidatures");
      }

      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError("Erreur lors du chargement des candidatures");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            {t("applications.status.pending")}
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("applications.status.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            {t("applications.status.rejected")}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">{t("common.loading")}</div>
          </div>
        </main>
      </>
    );
  }

  if (!user || user.role !== "TENANT") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t("applications.title")}</h1>
              <Link href="/listings">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                  <Home className="h-4 w-4 mr-2" />
                  {t("dashboard.tenant.searchListing")}
                </Button>
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("applications.noApplications")}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t("applications.noApplicationsDesc")}
                  </p>
                  <Link href="/listings">
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                      {t("applications.browseListings")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {application.listing.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>{application.listing.city}{application.listing.area ? `, ${application.listing.area}` : ""}</span>
                            <span>{application.listing.bedrooms} ch.</span>
                            <span>{application.listing.bathrooms} sdb</span>
                            <span className="font-semibold text-violet-600">
                              {application.listing.price.toLocaleString('fr-CA')} $ / mois
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(application.status)}
                            {application.createdAt && (
                              <span className="text-sm text-gray-500">
                                {t("applications.appliedOn")}{" "}
                                {format(new Date(application.createdAt), "d MMM yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Link href={`/tenant/applications/${application.id}`}>
                          <Button variant="outline" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("applications.viewDetails")}
                          </Button>
                        </Link>
                        {application.messageThread && (
                          <Link href={`/tenant/messages?thread=${application.messageThread.id}`}>
                            <Button variant="outline" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              {t("navbar.messages")}
                              {application.messageThread.messages.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs">
                                  {application.messageThread.messages.length}
                                </span>
                              )}
                            </Button>
                          </Link>
                        )}
                        {application.status === "approved" && application.lease && (
                          <Link href={`/tenant/leases/${application.lease.id}`}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Voir le contrat
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

