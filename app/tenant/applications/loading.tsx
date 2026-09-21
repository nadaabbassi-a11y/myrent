'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-ink mx-auto mb-4" />
          <p className="text-ink-muted">Chargement de vos candidatures...</p>
        </div>
      </div>
  );
}

