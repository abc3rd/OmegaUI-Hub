import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from '../Layout';

// Lazy load all pages
const Home = lazy(() => import('./Home'));
const Hub = lazy(() => import('./OmegaHub'));
const Feedback = lazy(() => import('./Feedback'));
const UCP = lazy(() => import('./UCP'));
const AppDetail = lazy(() => import('./AppDetail'));
const NotFound = lazy(() => import('./NotFound'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-[#EA00EA] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function Pages() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/ucp" element={<UCP />} />
            <Route path="/app/:id" element={<AppDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}