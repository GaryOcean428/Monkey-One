import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthContext } from './AuthProvider';
import { Button } from '../ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">You must be logged in to view this page.</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => <Navigate to="/login" state={{ from: location }} replace />}>
              Go Back to Login
            </Button>
            <Button onClick={() => <Navigate to="/support" />}>Contact Support</Button>
            <Button onClick={() => <Navigate to="/auth/callback" />}>Retry Authentication</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
