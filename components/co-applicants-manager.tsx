"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Mail, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface CoApplicant {
  id: string;
  name: string;
  email: string | null;
  role: "CO_TENANT" | "GUARANTOR" | "OTHER";
  status: "PENDING" | "INVITED" | "COMPLETED" | "FILLED_BY_PRIMARY" | "VERIFIED";
  filledByPrimary: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface CoApplicantsManagerProps {
  applicationId: string;
}

export function CoApplicantsManager({ applicationId }: CoApplicantsManagerProps) {
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newCoApplicant, setNewCoApplicant] = useState({
    name: "",
    email: "",
    role: "CO_TENANT" as "CO_TENANT" | "GUARANTOR" | "OTHER",
    fillForThem: false,
  });

  useEffect(() => {
    fetchCoApplicants();
  }, [applicationId]);

  const fetchCoApplicants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications/${applicationId}/co-applicants`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des co-applicants");
      }

      const data = await response.json();
      setCoApplicants(data.coApplicants || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}/co-applicants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoApplicant),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout du co-applicant");
      }

      // Réinitialiser le formulaire
      setNewCoApplicant({
        name: "",
        email: "",
        role: "CO_TENANT",
        fillForThem: false,
      });
      setShowAddDialog(false);
      
      // Recharger la liste
      fetchCoApplicants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (coApplicantId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce co-applicant ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/co-applicants?coApplicantId=${coApplicantId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      fetchCoApplicants();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string, filledByPrimary: boolean) => {
    switch (status) {
      case "COMPLETED":
      case "VERIFIED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complété
          </Badge>
        );
      case "INVITED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Mail className="h-3 w-3 mr-1" />
            Invitation envoyée
          </Badge>
        );
      case "FILLED_BY_PRIMARY":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            En attente de vérification
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CO_TENANT":
        return "Co-locataire";
      case "GUARANTOR":
        return "Garant";
      case "OTHER":
        return "Autre";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-neutral-100">
        <CardContent className="py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-600 font-light">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-neutral-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-light text-neutral-900 mb-2">
              Co-applicants
            </CardTitle>
            <CardDescription className="text-base font-light text-neutral-600">
              Ajoutez des co-locataires ou des garants à votre candidature
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-light"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {coApplicants.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 font-light">
            <UserPlus className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
            <p>Aucun co-applicant ajouté</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter" pour en ajouter un</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coApplicants.map((coApplicant) => (
              <div
                key={coApplicant.id}
                className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-neutral-900">{coApplicant.name}</h4>
                      {getStatusBadge(coApplicant.status, coApplicant.filledByPrimary)}
                      <Badge variant="outline" className="text-xs">
                        {getRoleLabel(coApplicant.role)}
                      </Badge>
                    </div>
                    {coApplicant.email && (
                      <p className="text-sm text-neutral-600 font-light flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {coApplicant.email}
                      </p>
                    )}
                    {coApplicant.filledByPrimary && (
                      <p className="text-xs text-yellow-700 mt-2 font-light">
                        Informations remplies par le locataire principal - En attente de vérification
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(coApplicant.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog pour ajouter un co-applicant */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Ajouter un co-applicant</DialogTitle>
            <DialogDescription className="font-light">
              Ajoutez un co-locataire ou un garant à votre candidature
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCoApplicant} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base font-light">
                Nom complet *
              </Label>
              <Input
                id="name"
                value={newCoApplicant.name}
                onChange={(e) => setNewCoApplicant({ ...newCoApplicant, name: e.target.value })}
                required
                className="mt-2 font-light"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-light">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={newCoApplicant.email}
                onChange={(e) => setNewCoApplicant({ ...newCoApplicant, email: e.target.value })}
                required
                className="mt-2 font-light"
                placeholder="jean@example.com"
              />
              <p className="text-xs text-neutral-500 mt-1 font-light">
                Une invitation sera envoyée à cet email
              </p>
            </div>

            <div>
              <Label htmlFor="role" className="text-base font-light">
                Rôle
              </Label>
              <Select
                value={newCoApplicant.role}
                onValueChange={(value: "CO_TENANT" | "GUARANTOR" | "OTHER") =>
                  setNewCoApplicant({ ...newCoApplicant, role: value })
                }
              >
                <SelectTrigger className="mt-2 font-light">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CO_TENANT">Co-locataire</SelectItem>
                  <SelectItem value="GUARANTOR">Garant</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Option "remplir pour eux" - pas mise en avant */}
            <div className="pt-2 border-t">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCoApplicant.fillForThem}
                  onChange={(e) =>
                    setNewCoApplicant({ ...newCoApplicant, fillForThem: e.target.checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Je remplirai les informations à leur place
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 font-light">
                    Un email de vérification sera quand même envoyé au co-applicant pour valider les informations.
                  </p>
                </div>
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={isAdding}
                className="font-light"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-light"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

