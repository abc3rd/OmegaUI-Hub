import { useEffect } from 'react';

export function useHead({ title, description, canonical, ogImage, structuredData }) {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tag
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic meta tags
    if (description) {
      setMetaTag('meta[name="description"]', 'name', 'description', description);
    }

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // OpenGraph tags
    if (title) {
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    }
    if (description) {
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    }
    if (canonical) {
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);
    }
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    }

    // Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    if (title) {
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    }
    if (description) {
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    // Robots
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index,follow');

    // Structured Data (JSON-LD)
    if (structuredData) {
      let scriptTag = document.querySelector('#structured-data-ucp');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'structured-data-ucp';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, canonical, ogImage, structuredData]);
}

export function useGoogleAnalytics(trackingId) {
  useEffect(() => {
    // Check if gtag script already exists
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${trackingId}"]`)) {
      return; // Already loaded
    }

    // Add gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', trackingId);
  }, [trackingId]);
}