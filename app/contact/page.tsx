"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PageHero, MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, ArrowLeft, Send } from "lucide-react";
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
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <PageHero image={MARKETING_IMAGES.auth} size="compact">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-neutral-900 tracking-tight mb-3">
            Support à votre écoute
          </h1>
          <p className="text-neutral-600 font-light max-w-lg">
            Notre équipe est disponible pour vous aider à chaque étape
          </p>
        </PageHero>

        <section className="py-14 md:py-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              <div className="rounded-xl border border-neutral-200 bg-stone-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-neutral-700" />
                  <h2 className="font-medium text-neutral-900">Contactez-nous</h2>
                </div>
                <p className="text-neutral-600 text-sm mb-4">
                  Envoyez-nous un message et nous vous répondrons dans les 24 heures.
                </p>
                <div className="space-y-1 text-sm text-neutral-500">
                  <p>
                    <span className="text-neutral-700">Email :</span> support@myrent.com
                  </p>
                  <p>
                    <span className="text-neutral-700">Téléphone :</span> 1-800-MYRENT
                  </p>
                  <p>
                    <span className="text-neutral-700">Horaires :</span> Lun-Ven, 9h-18h
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-stone-50 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-neutral-700" />
                  <h2 className="font-medium text-neutral-900">FAQ</h2>
                </div>
                <p className="text-neutral-600 text-sm mb-4">
                  Consultez nos questions fréquemment posées pour des réponses rapides.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center w-full border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  Voir la FAQ
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8">
              <h2 className="text-lg font-medium text-neutral-900 mb-6">
                Envoyez-nous un message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Nom complet
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Sujet
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="h-11 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-none text-neutral-900 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="h-4 w-4" />
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
