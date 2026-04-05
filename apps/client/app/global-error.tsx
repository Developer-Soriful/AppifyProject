"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center p-5">
            <h1 className="display-1 fw-bold text-danger mb-4">Error</h1>
            <h2 className="h3 mb-3">Something went wrong</h2>
            <p className="text-muted mb-4">
              {error.message || "An unexpected error occurred"}
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button onClick={reset} className="btn btn-primary btn-lg">
                Try Again
              </button>
              <Link href="/feed" className="btn btn-outline-secondary btn-lg">
                Go to Feed
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
