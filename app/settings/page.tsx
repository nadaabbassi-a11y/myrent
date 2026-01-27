"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Settings, User, Mail, Lock, Bell, Shield, Trash2, Save, ArrowLeft, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        notifications: true,
      });
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      // TODO: Implémenter l'API pour mettre à jour les paramètres
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Veuillez entrer votre mot de passe pour confirmer la suppression");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError("Une erreur est survenue. Veuillez réessayer.");
        setIsDeleting(false);
        return;
      }

      if (!response.ok) {
        let errorMessage = data?.error || "Erreur lors de la suppression du compte";
        if (data?.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((err: any) => 
            `${err.path?.join('.') || 'champ'}: ${err.message}`
          ).join(', ');
          if (validationErrors) {
            errorMessage = `Erreur de validation: ${validationErrors}`;
          }
        }
        setError(errorMessage);
        setIsDeleting(false);
        return;
      }

      // Déconnexion et redirection
      // Le cookie sera supprimé automatiquement côté serveur
      window.location.href = "/auth/signin?deleted=true";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du compte";
      setError(errorMessage);
      setIsDeleting(false);
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-violet-600" />
              Paramètres du compte
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                Paramètres mis à jour avec succès !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-violet-600" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mot de passe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-violet-600" />
                    Mot de passe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-violet-600" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Recevoir des notifications par email
                    </span>
                  </label>
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Shield className="h-5 w-5" />
                    Zone de danger
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">Supprimer mon compte</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Cette action est irréversible. Toutes vos données (profil, annonces, candidatures, messages) seront définitivement supprimées.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Modal de confirmation de suppression */}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="max-w-md w-full border-2 border-red-300">
                    <CardHeader className="bg-red-50 border-b border-red-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Confirmer la suppression
                        </CardTitle>
                        <button
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeletePassword("");
                            setError(null);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-semibold mb-2">
                          ⚠️ Attention : Cette action est irréversible
                        </p>
                        <p className="text-sm text-red-700">
                          Toutes vos données seront définitivement supprimées :
                        </p>
                        <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                          <li>Votre profil</li>
                          <li>Toutes vos annonces (si propriétaire)</li>
                          <li>Toutes vos candidatures (si locataire)</li>
                          <li>Tous vos messages</li>
                          <li>Toutes vos données personnelles</li>
                        </ul>
                      </div>

                      <div>
                        <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Entrez votre mot de passe pour confirmer
                        </label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Votre mot de passe"
                          className="border-red-200 focus:border-red-400"
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeletePassword("");
                            setError(null);
                          }}
                          disabled={isDeleting}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !deletePassword}
                        >
                          {isDeleting ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Suppression...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer définitivement
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Link href="/">
                  <Button type="button" variant="ghost">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}


