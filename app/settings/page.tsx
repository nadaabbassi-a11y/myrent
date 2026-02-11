"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Settings, User, Mail, Lock, Bell, Shield, Trash2, Save, ArrowLeft, AlertTriangle, X, CheckCircle, AlertCircle, Camera, Upload, XCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user, isLoading: authLoading, checkSession } = useAuth();
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      setProfileImage(user.image || null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload l'image
    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      setProfileImage(data.imageUrl);
      setImagePreview(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Rafraîchir les données utilisateur
      await checkSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload de l'image");
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
      // Réinitialiser l'input
      e.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    setIsUploadingImage(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile-image", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      setProfileImage(null);
      setImagePreview(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Rafraîchir les données utilisateur
      await checkSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression de l'image");
    } finally {
      setIsUploadingImage(false);
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
        <main className="min-h-screen bg-neutral-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4"></div>
              <p className="text-neutral-600 font-light">Chargement...</p>
            </div>
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
      <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors font-light text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>

            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-xl bg-neutral-900">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-light text-neutral-900 mb-1">
                  Paramètres du compte
                </h1>
                <p className="text-neutral-500 text-sm font-light">
                  Gérez vos informations personnelles et préférences
                </p>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-light">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-light">Paramètres mis à jour avec succès !</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo de profil */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-neutral-200 bg-neutral-50/50">
                    <CardTitle className="flex items-center gap-3 text-lg font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <Camera className="h-4 w-4 text-neutral-600" />
                      </div>
                      Photo de profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-neutral-200">
                          <AvatarImage src={imagePreview || profileImage || undefined} alt={user?.name || "Profil"} />
                          <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xl font-light">
                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isUploadingImage}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 px-4 rounded-xl font-light border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                              disabled={isUploadingImage}
                              asChild
                            >
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                {profileImage ? "Changer la photo" : "Ajouter une photo"}
                              </span>
                            </Button>
                          </label>
                          {profileImage && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleDeleteImage}
                              disabled={isUploadingImage}
                              className="h-10 px-4 rounded-xl font-light border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-light">
                          Formats acceptés : JPG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Informations personnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-neutral-200 bg-neutral-50/50">
                    <CardTitle className="flex items-center gap-3 text-lg font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <User className="h-4 w-4 text-neutral-600" />
                      </div>
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Nom complet
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Votre nom"
                        className="h-12 rounded-xl border-2 border-neutral-200 focus:border-neutral-400 font-light"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-neutral-500" />
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="h-12 rounded-xl bg-neutral-100 border-2 border-neutral-200 text-neutral-500 font-light"
                      />
                      <p className="text-xs text-neutral-400 font-light">L'email ne peut pas être modifié</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Mot de passe */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-neutral-200 bg-neutral-50/50">
                    <CardTitle className="flex items-center gap-3 text-lg font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <Lock className="h-4 w-4 text-neutral-600" />
                      </div>
                      Mot de passe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-12 rounded-xl border-2 border-neutral-200 focus:border-neutral-400 font-light"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="••••••••"
                        minLength={6}
                        className="h-12 rounded-xl border-2 border-neutral-200 focus:border-neutral-400 font-light"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-12 rounded-xl border-2 border-neutral-200 focus:border-neutral-400 font-light"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-neutral-200 bg-neutral-50/50">
                    <CardTitle className="flex items-center gap-3 text-lg font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <Bell className="h-4 w-4 text-neutral-600" />
                      </div>
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 mb-1">
                          Recevoir des notifications par email
                        </p>
                        <p className="text-xs text-neutral-500 font-light">
                          Restez informé des mises à jour importantes
                        </p>
                      </div>
                      <Switch
                        checked={formData.notifications}
                        onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sécurité */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-red-200 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-red-200 bg-red-50/50">
                    <CardTitle className="flex items-center gap-3 text-lg font-light text-red-600">
                      <div className="p-2 rounded-lg bg-red-100">
                        <Shield className="h-4 w-4 text-red-600" />
                      </div>
                      Zone de danger
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl">
                      <h3 className="font-medium text-red-900 mb-2 text-base">Supprimer mon compte</h3>
                      <p className="text-sm text-red-700 mb-4 font-light leading-relaxed">
                        Cette action est irréversible. Toutes vos données (profil, annonces, candidatures, messages) seront définitivement supprimées.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4 text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400 rounded-xl font-light"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Modal de confirmation de suppression */}
              <AnimatePresence>
                {showDeleteModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword("");
                      setError(null);
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Card className="max-w-md w-full border-2 border-red-300 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-red-50 border-b border-red-200">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-red-600 font-light">
                              <AlertTriangle className="h-5 w-5" />
                              Confirmer la suppression
                            </CardTitle>
                            <button
                              onClick={() => {
                                setShowDeleteModal(false);
                                setDeletePassword("");
                                setError(null);
                              }}
                              className="text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-800 font-medium mb-2">
                              ⚠️ Attention : Cette action est irréversible
                            </p>
                            <p className="text-sm text-red-700 mb-2 font-light">
                              Toutes vos données seront définitivement supprimées :
                            </p>
                            <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1 font-light">
                              <li>Votre profil</li>
                              <li>Toutes vos annonces (si propriétaire)</li>
                              <li>Toutes vos candidatures (si locataire)</li>
                              <li>Tous vos messages</li>
                              <li>Toutes vos données personnelles</li>
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="deletePassword" className="block text-sm font-medium text-neutral-700 mb-2">
                              Entrez votre mot de passe pour confirmer
                            </label>
                            <Input
                              id="deletePassword"
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              placeholder="Votre mot de passe"
                              className="h-12 rounded-xl border-2 border-red-200 focus:border-red-400 font-light"
                            />
                          </div>

                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
                              >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="font-light">{error}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex gap-3 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 h-11 rounded-xl font-light border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
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
                              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all"
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
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-end gap-4 pt-4"
              >
                <Link href="/">
                  <Button type="button" variant="ghost" className="h-11 px-6 rounded-xl font-light">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all"
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
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    </>
  );
}


