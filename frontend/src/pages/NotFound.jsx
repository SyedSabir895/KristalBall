import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="animate-fade-in py-20 text-center">
      <p className="text-5xl font-semibold text-army-700">404</p>
      <p className="mt-2 text-stone-600">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to dashboard</Link>
    </div>
  );
}
