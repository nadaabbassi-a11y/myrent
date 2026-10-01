"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { markClass } from "@/lib/location-pipeline";

type LocationDetail = {
  id: string;
  title: string;
  address: string | null;
  city: string;
  rent: number;
  deposit: number;
  pipeline: { current: string; steps: { key: string; label: string; state: string }[] };
  invitations: { email: string; token: string }[];
  application: {
    id: string;
    status: string;
    tenant: { name: string | null; email: string };
    steps: { stepKey: string; isComplete: boolean }[];
    creditCheck: {
      status: string;
      bureau: string | null;
      score: number | null;
      resultSummary: string | null;
      notes: string | null;
    } | null;
    lease: {
      id: string;
      status: string;
      monthlyRent: number;
      payments: { id: string; amount: number; type: string; status: string; dueDate: string | null; paidAt: string | null }[];
    } | null;
    messages: { id: string; content: string; createdAt: string; sender: { name: string | null; role: string } }[];
  } | null;
};

export default function LandlordLocationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const id = params.id as string;
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [credit, setCredit] = useState({
    status: "CLEAR",
    bureau: "Equifax",
    score: "",
    resultSummary: "",
    notes: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/landlord/locations/${id}`);
    if (res.ok) {
      const data = await res.json();
      setLocation(data.location);
      if (data.location.application?.creditCheck) {
        const c = data.location.application.creditCheck;
        setCredit({
          status: ["CLEAR", "CONCERN", "FAILED", "IN_REVIEW"].includes(c.status) ? c.status : "CLEAR",
          bureau: c.bureau || "Equifax",
          score: c.score ? String(c.score) : "",
          resultSummary: c.resultSummary || "",
          notes: c.notes || "",
        });
      }
    }
  };

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/signin");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === "LANDLORD") load();
  }, [user, id]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/landlord/locations/${id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || "Invitation impossible");
      return;
    }
    if (data.inviteUrl) {
      setInviteUrl(`${window.location.origin}${data.inviteUrl}`);
      setNotice("Lien d’invitation prêt à envoyer au locataire.");
    } else {
      setNotice("Le locataire a déjà un compte. Le dossier est ouvert.");
    }
    setEmail("");
    load();
  };

  const saveCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location?.application) return;
    const res = await fetch(`/api/applications/${location.application.id}/credit-check`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: credit.status,
        bureau: credit.bureau,
        score: credit.score ? Number(credit.score) : undefined,
        resultSummary: credit.resultSummary,
        notes: credit.notes,
      }),
    });
    const data = await res.json();
    setNotice(res.ok ? "Enquête de crédit enregistrée." : data.error);
    if (res.ok) load();
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/landlord/locations/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(paymentAmount), type: "rent", markPaid: true }),
    });
    const data = await res.json();
    setNotice(res.ok ? "Paiement enregistré." : data.error);
    if (res.ok) {
      setPaymentAmount("");
      load();
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/locations/${id}/messages`, {
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

  if (isLoading || !location) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-16 text-center text-neutral-500">Chargement...</main>
      </>
    );
  }

  const app = location.application;
  const completedSteps = app?.steps.filter((s) => s.isComplete).length ?? 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-6 py-12 max-w-3xl space-y-6">
          <Link href="/landlord" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Mes locations
          </Link>
          <div>
            <h1 className="text-3xl font-light text-neutral-900 tracking-tight">{location.title}</h1>
            <p className="text-neutral-600 mt-1 font-light">
              {location.address}, {location.city} · {location.rent}$ / mois
            </p>
          </div>

          <div>
            {location.pipeline.steps.map((step) => (
              <span key={step.key} className={markClass(step.state)}>
                {step.label}
              </span>
            ))}
          </div>

          {notice && <p className="text-sm sheet px-4 py-3">{notice}</p>}

          <section className="sheet p-6 space-y-4">
            <h2 className="text-xl font-medium text-neutral-900">1. Locataire et dossier</h2>
            {app ? (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600">
                  {app.tenant.name || app.tenant.email} · dossier {app.status.toLowerCase()} · {completedSteps}/{app.steps.length || 8} étapes
                </p>
                <Link href={`/landlord/applications/${app.id}`} className="btn-ink">
                  Voir le dossier
                </Link>
              </div>
            ) : (
              <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2">
                <input
                  required
                  type="email"
                  placeholder="Email du locataire"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field flex-1"
                />
                <button className="btn-ink">Inviter</button>
              </form>
            )}
            {inviteUrl && (
              <p className="text-xs text-neutral-600 break-all">
                Lien à envoyer : {inviteUrl}
              </p>
            )}
            {location.invitations[0] && !inviteUrl && (
              <p className="text-xs text-neutral-600 break-all">
                Invitation en cours : {typeof window !== "undefined" ? window.location.origin : ""}/invite/{location.invitations[0].token}
              </p>
            )}
          </section>

          <section className="sheet p-6 space-y-4">
            <h2 className="text-xl font-medium text-neutral-900">2. Enquête de crédit</h2>
            <p className="text-sm text-neutral-600">
              Equifax, TransUnion, ou un autre rapport. Vous notez le résultat.
            </p>
            {app ? (
              <form onSubmit={saveCredit} className="grid sm:grid-cols-2 gap-3">
                <select
                  value={credit.status}
                  onChange={(e) => setCredit({ ...credit, status: e.target.value })}
                  className="field"
                >
                  <option value="IN_REVIEW">En cours</option>
                  <option value="CLEAR">Dossier clair</option>
                  <option value="CONCERN">Réserves</option>
                  <option value="FAILED">Refusé</option>
                </select>
                <input
                  placeholder="Bureau (Equifax, TransUnion…)"
                  value={credit.bureau}
                  onChange={(e) => setCredit({ ...credit, bureau: e.target.value })}
                  className="field"
                />
                <input
                  type="number"
                  placeholder="Cote (optionnel)"
                  value={credit.score}
                  onChange={(e) => setCredit({ ...credit, score: e.target.value })}
                  className="field"
                />
                <input
                  placeholder="Résumé"
                  value={credit.resultSummary}
                  onChange={(e) => setCredit({ ...credit, resultSummary: e.target.value })}
                  className="field"
                />
                <textarea
                  placeholder="Notes internes"
                  value={credit.notes}
                  onChange={(e) => setCredit({ ...credit, notes: e.target.value })}
                  className="field sm:col-span-2 h-auto min-h-[80px] py-2"
                />
                <button className="btn-ink">Enregistrer l’enquête</button>
              </form>
            ) : (
              <p className="text-sm text-neutral-500">Invitez d’abord.</p>
            )}
          </section>

          <section className="sheet p-6 space-y-3">
            <h2 className="text-xl font-medium text-neutral-900">3. Bail</h2>
            {app?.lease ? (
              <Link href={`/landlord/leases/${app.lease.id}`} className="btn-ink">
                Ouvrir le bail ({app.lease.status.toLowerCase()})
              </Link>
            ) : app && (app.status === "SUBMITTED" || app.status === "ACCEPTED") ? (
              <Link href={`/landlord/applications/${app.id}`} className="btn-ink">
                Accepter le dossier et préparer le bail
              </Link>
            ) : (
              <p className="text-sm text-neutral-500">Le bail vient après le dossier.</p>
            )}
          </section>

          <section className="sheet p-6 space-y-4">
            <h2 className="text-xl font-medium text-neutral-900">4. Paiements</h2>
            {app?.lease ? (
              <>
                <ul className="text-sm space-y-2">
                  {(app.lease.payments || []).map((p) => (
                    <li key={p.id} className="flex justify-between border-b border-neutral-200 pb-2">
                      <span>
                        {p.type} · {p.amount}$
                      </span>
                      <span className={p.status === "paid" ? "text-emerald-700" : "text-neutral-600"}>
                        {p.status === "paid" ? "Payé" : "En attente"}
                      </span>
                    </li>
                  ))}
                  {app.lease.payments.length === 0 && <li className="text-neutral-500">Aucun paiement pour l’instant.</li>}
                </ul>
                <form onSubmit={recordPayment} className="flex gap-2">
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Montant"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="field flex-1"
                  />
                  <button className="btn-ink">Marquer payé</button>
                </form>
              </>
            ) : (
              <p className="text-sm text-neutral-500">Les paiements viennent après le bail.</p>
            )}
          </section>

          <section className="sheet p-6 space-y-4">
            <h2 className="text-xl font-medium text-neutral-900">5. Messages</h2>
            <div className="space-y-2 max-h-56 overflow-auto">
              {(app?.messages || []).length === 0 && <p className="text-sm text-neutral-500">Aucun message.</p>}
              {(app?.messages || []).map((m) => (
                <p key={m.id} className="text-sm border-l-2 border-neutral-200 pl-3">
                  <span className="text-neutral-500">{m.sender.name || m.sender.role} — </span>
                  {m.content}
                </p>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrire au locataire"
                className="field flex-1"
              />
              <button className="btn-line">Envoyer</button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
