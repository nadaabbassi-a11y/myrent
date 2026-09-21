"use client";

import { Suspense } from "react";
import { MessagesInbox } from "@/components/messages-inbox";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <>
          <div className="py-10">
            <div className="container mx-auto px-4">
              <div className="text-center">Chargement...</div>
            </div>
          </div>
        </>
      }
    >
      <MessagesInbox />
    </Suspense>
  );
}
