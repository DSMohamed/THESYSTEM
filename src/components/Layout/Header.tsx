import React from 'react';
import { Bell, Search, ChevronDown, Moon, Sun, Wifi, Battery, Signal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, users, switchUser, currentAccount } = useAuth();
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

  return (
    <header className="cyber-card border-b-2 neon-border-purple px-6 py-4 relative">
      <div className="absolute inset-0 holographic opacity-10"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-6">
          <div>
            <h2 className="text-xl font-orbitron font-bold cyber-text-glow">
              WELCOME, {user?.name?.split(' ')[0]?.toUpperCase()}
            </h2>
            <p className="text-sm text-purple-400 font-rajdhani">
              SYSTEM STATUS: ONLINE • {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="hidden md:block" dir="rtl">
            <p className="text-sm text-cyan-400 font-rajdhani neon-text">
              مرحباً، {user?.name?.split(' ')[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* System Status Indicators */}
          <div className="hidden lg:flex items-center space-x-3 px-4 py-2 cyber-card rounded-lg">
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

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              placeholder="SEARCH SYSTEM..."
              className="cyber-input pl-10 pr-4 py-2 w-64 text-sm rounded-lg font-rajdhani placeholder:text-purple-400/50"
            />
          </div>

          {/* Notifications */}
          <button className="p-3 text-purple-400 hover:text-cyan-400 hover:bg-purple-900/20 rounded-lg transition-all duration-300 relative cyber-btn">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </button>

          {/* Dark Mode Toggle */}
          <button
            className="p-3 text-purple-400 hover:text-cyan-400 hover:bg-purple-900/20 rounded-lg transition-all duration-300 cyber-btn"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Account Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-3 text-sm cyber-card rounded-lg hover:neon-glow transition-all duration-300"
            >
              <div className="text-left">
                <p className="font-orbitron font-medium text-cyan-400 text-xs">{currentAccount.toUpperCase()}</p>
                <p className="text-xs text-purple-400 font-rajdhani">{users.length} ACTIVE USERS</p>
              </div>
              <ChevronDown className="h-4 w-4 text-purple-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 cyber-card rounded-lg neon-border z-50">
                <div className="p-4 border-b border-purple-500/30">
                  <p className="text-sm font-orbitron font-medium text-cyan-400">{currentAccount.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 font-rajdhani">USER MANAGEMENT SYSTEM</p>
                </div>
                <div className="p-2">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300 ${
                        user?.id === u.id 
                          ? 'cyber-card neon-border text-cyan-400' 
                          : 'hover:bg-purple-900/20 text-gray-300 hover:text-cyan-400'
                      }`}
                    >
                      <div className="relative">
                        <img
                          className="w-8 h-8 rounded-full object-cover border neon-border"
                          src={u.avatar}
                          alt={u.name}
                        />
                        {user?.id === u.id && (
                          <div className="absolute -top-1 -right-1 status-indicator"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-rajdhani font-medium">{u.name.toUpperCase()}</p>
                        <p className="text-xs text-purple-400 font-rajdhani">{u.role.toUpperCase()}</p>
                      </div>
                      {user?.id === u.id && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};