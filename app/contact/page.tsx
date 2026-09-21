"use client";

import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <PublicShell>
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-ink-muted hover:text-ink mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-2xl font-semibold text-ink mb-2">Contact</h1>
        <p className="text-sm text-ink-muted mb-8">
          Écrivez-nous — nous répondons sous 24 h ouvrables.
        </p>

        <div className="surface-card p-6 mb-8 text-sm text-ink-muted space-y-1">
          <p><span className="font-medium text-ink">Courriel :</span> support@myrent.com</p>
          <p><span className="font-medium text-ink">Horaires :</span> Lun–Ven, 9h–18h</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Nom</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Courriel</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Sujet</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 focus:border-ink focus:ring-1 focus:ring-ink outline-none resize-none"
            />
          </div>
          <Button type="submit" className="w-full bg-ink hover:bg-ink/90">
            Envoyer
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-muted">
          Consultez aussi la{" "}
          <Link href="/faq" className="text-ink underline underline-offset-2">
            FAQ
          </Link>
          .
        </p>
      </div>
    </PublicShell>
  );
}
