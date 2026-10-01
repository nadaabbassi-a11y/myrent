"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { markClass } from "@/lib/location-pipeline";

const STEP_NUMBERS: Record<string, number> = {
  identity: 1,
  address: 2,
  status: 3,
  income: 4,
  occupants: 5,
  references: 6,
  documents: 7,
  consents: 8,
};

type TenantLocation = {
  id: string;
  applicationId: string;
  title: string;
  address: string | null;
  city: string;
  rent: number;
  status: string;
  firstIncompleteStep: string;
  pipeline: { steps: { key: string; label: string; state: string }[] };
  creditCheck: { status: string } | null;
  lease: { id: string; status: string } | null;
  payments: { id: string; amount: number; type: string; status: string }[];
  messages: { id: string; content: string; sender: { name: string | null; role: string } }[];
};

export default function TenantHomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<TenantLocation[]>([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/signin");
    if (user && user.role !== "TENANT") router.push("/landlord");
  }, [user, isLoading, router]);

  const load = async () => {
    const res = await fetch("/api/tenant/locations");
    if (res.ok) {
      const data = await res.json();
      setLocations(data.locations || []);
    }
  };

  useEffect(() => {
    if (user?.role === "TENANT") load();
  }, [user]);

  const sendMessage = async (locationId: string, e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/locations/${locationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error);
      return;
    }
    setMessage("");
    load();
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-16 text-center text-neutral-500">Chargement...</main>
      </>
    );
  }

  const location = locations[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-6 py-12 max-w-3xl space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-neutral-900 tracking-tight">Ma location</h1>
            <p className="text-lg text-neutral-600 mt-2 font-light">
              Le dossier. Ensuite le bail.
            </p>
          </div>

          {!location && (
            <div className="sheet p-8 text-neutral-600 font-light">
              Rien pour le moment. Attendez l’invitation du propriétaire.
            </div>
          )}

          {location && (
            <>
              <div className="sheet p-6">
                <h2 className="text-xl font-medium text-neutral-900">{location.title}</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {location.address}, {location.city} · {location.rent}$ / mois
                </p>
                <div className="mt-3">
                  {location.pipeline.steps.map((step) => (
                    <span key={step.key} className={markClass(step.state)}>
                      {step.label}
                    </span>
                  ))}
                </div>
              </div>

              <section className="sheet p-6 space-y-3">
                <h2 className="text-xl font-medium text-neutral-900">1. Remplir le dossier</h2>
                <p className="text-sm text-neutral-600 font-light">
                  Identité, revenus, références, documents.
                </p>
                <Link
                  href={`/apply/${location.applicationId}/step-${STEP_NUMBERS[location.firstIncompleteStep] || 1}`}
                  className="btn-ink"
                >
                  {location.status === "DRAFT" ? "Continuer le dossier" : "Revoir le dossier"}
                </Link>
              </section>

              <section className="sheet p-6 space-y-2">
                <h2 className="text-xl font-medium text-neutral-900">2. Enquête de crédit</h2>
                <p className="text-sm text-neutral-600 font-light">
                  Le consentement est à la dernière étape. Statut :{" "}
                  <em>{location.creditCheck?.status || "en attente"}</em>.
                </p>
              </section>

              <section className="sheet p-6 space-y-3">
                <h2 className="text-xl font-medium text-neutral-900">3. Signer le bail</h2>
                {location.lease ? (
                  <Link href={`/tenant/leases/${location.lease.id}`} className="btn-ink">
                    Ouvrir le bail
                  </Link>
                ) : (
                  <p className="text-sm text-neutral-500 font-light">Le bail vient après.</p>
                )}
              </section>

              <section className="sheet p-6 space-y-3">
                <h2 className="text-xl font-medium text-neutral-900">4. Paiements</h2>
                {location.payments.length === 0 && (
                  <p className="text-sm text-neutral-500">Aucun paiement pour l’instant.</p>
                )}
                <ul className="text-sm space-y-2">
                  {location.payments.map((p) => (
                    <li key={p.id} className="flex justify-between border-b border-neutral-200 pb-2">
                      <span>{p.type} · {p.amount}$</span>
                      <span>{p.status === "paid" ? "Payé" : "À payer"}</span>
                    </li>
                  ))}
                </ul>
                {location.payments.some((p) => p.status !== "paid") && (
                  <Link href="/tenant/payments" className="underline text-sm">
                    Voir les paiements
                  </Link>
                )}
              </section>

              <section className="sheet p-6 space-y-3">
                <h2 className="text-xl font-medium text-neutral-900">5. Messages</h2>
                {notice && <p className="text-sm text-red-700">{notice}</p>}
                <div className="space-y-2">
                  {location.messages.map((m) => (
                    <p key={m.id} className="text-sm border-l-2 border-neutral-200 pl-3">
                      <span className="text-neutral-500">{m.sender.name || m.sender.role} — </span>
                      {m.content}
                    </p>
                  ))}
                </div>
                <form onSubmit={(e) => sendMessage(location.id, e)} className="flex gap-2">
                  <input
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrire au propriétaire"
                    className="field flex-1"
                  />
                  <button className="btn-line">Envoyer</button>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
