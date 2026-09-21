"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { MessagesInbox } from "@/components/messages-inbox";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
              <div className="text-center">Chargement...</div>
            </div>
          </main>
        </>
      }
    >
      <MessagesInbox />
    </Suspense>
  );
}
