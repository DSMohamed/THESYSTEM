import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Dumbbell, BookOpen, MessageCircle, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, nameAr: 'لوحة التحكم' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, nameAr: 'المهام' },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell, nameAr: 'التمارين' },
  { name: 'Journal', href: '/journal', icon: BookOpen, nameAr: 'المذكرات' },
  { name: 'AI Assistant', href: '/chat', icon: MessageCircle, nameAr: 'المساعد الذكي' },
  { name: 'Users', href: '/users', icon: Users, nameAr: 'المستخدمون' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Filter navigation: only show 'Users' for admin
  const filteredNavigation = navigation.filter(item => item.name !== 'Users' || user?.role === 'admin');

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">DailyFlow</h1>
            <p className="text-xs text-gray-500">Task Manager</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
            alt={user?.name}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
              />
              <span className="flex-1">{item.name}</span>
              <span className="text-xs text-gray-400 ml-2" dir="rtl">
                {item.nameAr}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          Settings
          <span className="text-xs text-gray-400 ml-auto" dir="rtl">الإعدادات</span>
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-500" />
          Sign Out
          <span className="text-xs text-red-400 ml-auto" dir="rtl">تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
};