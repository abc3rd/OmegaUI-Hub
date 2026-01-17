import React from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <style>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            animation: gradient 6s ease infinite;
          }
        `}</style>
        <Navigation />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}