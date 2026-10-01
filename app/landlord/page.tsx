"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { markClass } from "@/lib/location-pipeline";

type LocationCard = {
  id: string;
  title: string;
  address: string | null;
  city: string;
  rent: number;
  tenant: { name: string | null; email: string } | null;
  pipeline: {
    current: string;
    steps: { key: string; label: string; state: string }[];
  };
};

export default function LandlordHomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<LocationCard[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    rent: "",
    bedrooms: "2",
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/signin");
    if (user && user.role !== "LANDLORD") router.push("/tenant");
  }, [user, isLoading, router]);

  const load = async () => {
    const res = await fetch("/api/landlord/locations");
    if (res.ok) {
      const data = await res.json();
      setLocations(data.locations || []);
    }
  };

  useEffect(() => {
    if (user?.role === "LANDLORD") load();
  }, [user]);

  const createLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/landlord/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          postalCode: form.postalCode || undefined,
          rent: Number(form.rent),
          bedrooms: Number(form.bedrooms),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Impossible de créer le logement");
        return;
      }
      router.push(`/landlord/locations/${data.location.id}`);
    } catch {
      setError("Impossible de créer le logement");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-16 text-center text-neutral-500">Chargement...</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-light text-neutral-900 tracking-tight">Mes locations</h1>
              <p className="text-lg text-neutral-600 mt-2 font-light">
                Un logement. Puis la suite.
              </p>
            </div>
            <button onClick={() => setOpenForm((v) => !v)} className="btn-ink">
              {openForm ? "Fermer" : "Ajouter"}
            </button>
          </div>

          {openForm && (
            <form onSubmit={createLocation} className="sheet p-5 mb-6 grid sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Adresse"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="field"
              />
              <input
                required
                placeholder="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="field"
              />
              <input
                placeholder="Code postal"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="field"
              />
              <input
                required
                type="number"
                min="1"
                placeholder="Loyer mensuel"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
                className="field"
              />
              <select
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="field"
              >
                <option value="0">Studio</option>
                <option value="1">1 1/2</option>
                <option value="2">2 1/2</option>
                <option value="3">3 1/2</option>
                <option value="4">4 1/2 +</option>
              </select>
              <button type="submit" disabled={saving} className="btn-ink">
                {saving ? "Création..." : "Créer le logement"}
              </button>
              {error && <p className="sm:col-span-2 text-sm text-red-700">{error}</p>}
            </form>
          )}

          {locations.length === 0 && !openForm && (
            <div className="sheet p-8 text-neutral-600 font-light">
              <p>Aucun logement pour l’instant.</p>
              <button onClick={() => setOpenForm(true)} className="mt-3 underline text-neutral-900">
                Ajouter
              </button>
            </div>
          )}

          <div className="space-y-4">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/landlord/locations/${location.id}`}
                className="block sheet p-5 hover:border-neutral-300 hover:shadow-sm transition-all"
              >
                <h2 className="text-xl font-medium text-neutral-900">{location.title}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {location.address}, {location.city} · {location.rent}$ / mois
                </p>
                <p className="text-sm mt-2">
                  {location.tenant
                    ? `Locataire : ${location.tenant.name || location.tenant.email}`
                    : "Aucun locataire invité"}
                </p>
                <div className="mt-3">
                  {location.pipeline.steps.map((step) => (
                    <span key={step.key} className={markClass(step.state)}>
                      {step.label}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
