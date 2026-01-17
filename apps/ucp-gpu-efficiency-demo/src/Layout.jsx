import { useEffect } from 'react';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    // Load Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-2EGS8K0W4L';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-2EGS8K0W4L');
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup if needed
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return <>{children}</>;
}