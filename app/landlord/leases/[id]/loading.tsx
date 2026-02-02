import { Navbar } from '@/components/navbar';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du bail...</p>
        </div>
      </div>
    </>
  );
}


