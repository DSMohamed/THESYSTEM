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

  // Close sidebar when clicking outside
  const closeSidebar = () => {
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
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        w-64 flex-shrink-0 h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full lg:w-auto">
        {/* Mobile Menu Button - Positioned over header */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="cyber-btn p-3 rounded-lg neon-glow"
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