import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useLocation, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }) {
  const location = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/register', 
    '/forgot-password', 
    '/choose-account-type', 
    '/recipient-portal', 
    '/donor-portal',
    '/donor-proximity-alerts',
    '/donorproximityalerts',
    '/home',
    '/scan',
    '/scanqr',
    '/viewprofile/',
    '/profile/',
    '/qr/',
    '/resource-map',
    '/resourcemap',
    '/shared-resources',
    '/proximity-alerts'
  ];
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (error || !user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
}