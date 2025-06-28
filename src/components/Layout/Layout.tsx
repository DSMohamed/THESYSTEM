import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // DIRECT close function - no parameters
  const closeSidebar = () => {
    console.log('Layout closeSidebar called - setting state to false');
    setSidebarOpen(false);
  };

  // DIRECT toggle function
  const toggleSidebar = () => {
    console.log('Layout toggleSidebar called, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  // DIRECT overlay click handler
  const handleOverlayClick = () => {
    console.log('Overlay clicked - closing sidebar');
    setSidebarOpen(false);
  };

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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-75 z-40"
          onClick={handleOverlayClick}
          onTouchStart={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        w-64 flex-shrink-0 h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full lg:w-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden absolute top-4 left-4 z-60">
          <button
            type="button"
            onClick={toggleSidebar}
            onMouseDown={toggleSidebar}
            className="cyber-btn p-3 rounded-lg neon-glow transition-all duration-300 text-cyan-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-purple-900/50 border border-cyan-400/50"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            style={{ 
              zIndex: 9999,
              position: 'relative',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <Header />
        <main className="flex-1 overflow-y-auto cyber-grid">
          <div className="p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};