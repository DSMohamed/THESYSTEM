import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Close navigation on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when navigation is open on mobile
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isNavOpen]);

  return (
    <div className="flex h-screen cyber-bg relative overflow-hidden">
      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Desktop Navigation - Always visible on desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <Navigation 
          isOpen={true} 
          onClose={() => {}}
          onToggle={() => {}}
        />
      </div>

      {/* Mobile Navigation - Overlay on mobile */}
      <div className="lg:hidden">
        <Navigation 
          isOpen={isNavOpen} 
          onClose={() => setIsNavOpen(false)}
          onToggle={() => setIsNavOpen(!isNavOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <Header onMenuToggle={() => setIsNavOpen(!isNavOpen)} />
        <main className="flex-1 overflow-y-auto cyber-grid">
          <div className="p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};