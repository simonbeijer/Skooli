'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-6xl font-bold mb-4">500</h1>
      <h2 className="text-2xl mb-8">Something Went Wrong!</h2>
      <p className="text-lg text-center mb-8">
        We apologize for the inconvenience. Please try again later.
      </p>
      <button
        onClick={() => reset()} // Attempt to recover by trying to re-render the segment
        className="text-blue-500 hover:underline mt-4"
      >
        Try again
      </button>
    </div>
  );
}