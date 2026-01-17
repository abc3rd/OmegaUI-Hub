import { useEffect } from 'react';

export default function GoogleAnalytics({ trackingId }) {
  useEffect(() => {
    if (!trackingId) return;

    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector(`script[src*="gtag/js?id=${trackingId}"]`);
    if (existingScript) return;

    // Add gtag.js script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', trackingId);

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount as GA should persist across navigation
    };
  }, [trackingId]);

  return null;
}