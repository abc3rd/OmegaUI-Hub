import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage after mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load Google Analytics script
    if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-2EGS8K0W4L';
      document.head.appendChild(script);
    }

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-2EGS8K0W4L');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #ea00ea, #2699fe)' 
            : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-white" />
        ) : (
          <Moon className="h-5 w-5 text-white" />
        )}
      </button>
      {children}
    </>
  );
}