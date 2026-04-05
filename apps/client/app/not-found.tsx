import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center p-5">
        <h1 className="display-1 fw-bold text-primary mb-4">404</h1>
        <h2 className="h3 mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/feed" className="btn btn-primary btn-lg">
          Go to Feed
        </Link>
      </div>
    </div>
  );
}
