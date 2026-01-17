import React, { useEffect } from 'react';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    // Load Google Analytics
    const gtagScript = document.createElement('script');
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-SNLF60E7LE';
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    const gtagInline = document.createElement('script');
    gtagInline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-SNLF60E7LE');
    `;
    document.head.appendChild(gtagInline);

    // Load external tracking script
    const trackingScript = document.createElement('script');
    trackingScript.src = 'https://www.omegaui.com/js/external-tracking.js';
    trackingScript.setAttribute('data-tracking-id', 'tk_91d5c83921da484db2a817f11c7d45a7');
    trackingScript.async = true;
    document.head.appendChild(trackingScript);

    return () => {
      // Cleanup scripts on unmount
      if (gtagScript.parentNode) gtagScript.parentNode.removeChild(gtagScript);
      if (gtagInline.parentNode) gtagInline.parentNode.removeChild(gtagInline);
      if (trackingScript.parentNode) trackingScript.parentNode.removeChild(trackingScript);
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}