import React, { useEffect } from 'react';

export default function SEOHead({ 
  title, 
  description, 
  keywords,
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl,
  structuredData,
  appendSiteName = true
}) {
  const fullTitle = title ? (appendSiteName ? `${title} | SynCloud Connect` : title) : 'SynCloud Connect';

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta
    if (description) updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);

    // OpenGraph
    updateMeta('og:title', fullTitle, true);
    if (description) updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    if (ogImage) updateMeta('og:image', ogImage, true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    if (description) updateMeta('twitter:description', description);

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('#structured-data');
      if (!script) {
        script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }
  }, [fullTitle, description, keywords, ogImage, ogType, canonicalUrl, structuredData]);

  return null;
}