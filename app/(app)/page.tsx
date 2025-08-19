"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard as main entry point
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to Dashboard...</h1>
        <p className="text-gray-500">Please wait while we redirect you to the dashboard.</p>
      </div>
    </div>
  );
}