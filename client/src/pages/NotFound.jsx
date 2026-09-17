import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-mist">
      <p className="font-display text-6xl font-semibold text-signal">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-mist">Page not found</h1>
      <p className="mt-2 text-mist-dim">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to Home</Link>
    </div>
  );
}
