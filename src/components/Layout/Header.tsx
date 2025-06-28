import React from 'react';
import { Bell, Search, ChevronDown, Moon, Sun } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Good morning, {user?.name?.split(' ')[0]}!
          </h2>
          <div className="hidden md:block">
            <p className="text-sm text-gray-500" dir="rtl">
              صباح الخير، {user?.name?.split(' ')[0]}!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, workouts..."
              className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Account Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900">{currentAccount}</p>
                <p className="text-xs text-gray-500">{users.length} members</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentAccount}</p>
                  <p className="text-xs text-gray-500">Switch between users</p>
                </div>
                <div className="p-2">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${user?.id === u.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                        }`}
                    >
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={u.avatar}
                        alt={u.name}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>
                      {user?.id === u.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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