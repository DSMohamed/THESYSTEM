import React from 'react';
import { Bell, Search, ChevronDown, Moon, Sun, Wifi, Battery, Signal, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Get the best available avatar
  const getDisplayAvatar = () => {
    if (user?.id) {
      const localAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (localAvatar) {
        return localAvatar;
      }
    }
    return user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="cyber-card border-b-2 neon-border-purple px-3 sm:px-4 lg:px-6 py-3 lg:py-4 relative">
      <div className="absolute inset-0 holographic opacity-10"></div>
      
      <div className="flex items-center justify-between relative z-10">
        {/* Left side - Welcome text */}
        <div className="flex items-center space-x-3 lg:space-x-6 flex-1 min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base lg:text-xl font-orbitron font-bold cyber-text-glow truncate">
              WELCOME, {user?.name?.split(' ')[0]?.toUpperCase()}
            </h2>
            <p className="text-xs lg:text-sm text-purple-400 font-rajdhani hidden sm:block">
              SYSTEM STATUS: ONLINE • {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="hidden xl:block" dir="rtl">
            <p className="text-sm text-cyan-400 font-rajdhani neon-text">
              مرحباً، {user?.name?.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* System Status Indicators - Hidden on mobile */}
          <div className="hidden xl:flex items-center space-x-3 px-4 py-2 cyber-card rounded-lg">
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-rajdhani">ONLINE</span>
            </div>
            <div className="flex items-center space-x-1">
              <Signal className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-rajdhani">STRONG</span>
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-rajdhani">98%</span>
            </div>
          </div>

          {/* Search - Hidden on small mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              placeholder="SEARCH..."
              className="cyber-input pl-10 pr-4 py-2 w-32 lg:w-64 text-sm rounded-lg font-rajdhani placeholder:text-purple-400/50"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 lg:p-3 text-purple-400 hover:text-cyan-400 hover:bg-purple-900/20 rounded-lg transition-all duration-300 relative cyber-btn">
            <Bell className="h-4 lg:h-5 w-4 lg:w-5" />
            <div className="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-red-500 rounded-full animate-pulse"></div>
          </button>

          {/* Dark Mode Toggle - Hidden on small mobile */}
          <button
            className="hidden sm:block p-2 lg:p-3 text-purple-400 hover:text-cyan-400 hover:bg-purple-900/20 rounded-lg transition-all duration-300 cyber-btn"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 lg:h-5 w-4 lg:w-5" /> : <Moon className="h-4 lg:h-5 w-4 lg:w-5" />}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1 lg:space-x-3 p-2 lg:p-3 text-sm cyber-card rounded-lg hover:neon-glow transition-all duration-300"
            >
              <div className="text-left hidden lg:block">
                <p className="font-orbitron font-medium text-cyan-400 text-xs">USER PROFILE</p>
                <p className="text-xs text-purple-400 font-rajdhani">{user?.role?.toUpperCase()}</p>
              </div>
              <div className="w-6 lg:w-8 h-6 lg:h-8 rounded-full overflow-hidden border neon-border">
                <img
                  className="w-full h-full object-cover"
                  src={getDisplayAvatar()}
                  alt={user?.name}
                />
              </div>
              <ChevronDown className="h-3 lg:h-4 w-3 lg:w-4 text-purple-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 lg:w-72 cyber-card rounded-lg neon-border z-50">
                <div className="p-4 border-b border-purple-500/30">
                  <p className="text-sm font-orbitron font-medium text-cyan-400">USER PROFILE</p>
                  <p className="text-xs text-purple-400 font-rajdhani">Account management</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg cyber-card neon-border text-cyan-400">
                    <div className="relative">
                      <img
                        className="w-8 h-8 rounded-full object-cover border neon-border"
                        src={getDisplayAvatar()}
                        alt={user?.name}
                      />
                      <div className="absolute -top-1 -right-1 status-indicator"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-rajdhani font-medium truncate">{user?.name?.toUpperCase()}</p>
                      <p className="text-xs text-purple-400 font-rajdhani">{user?.role?.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full mt-3 cyber-btn px-4 py-2 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-900/20 transition-all font-rajdhani font-medium"
                  >
                    SIGN OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};