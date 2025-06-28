import React from 'react';
import { Users as UsersIcon, UserPlus, Crown, Settings, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Users: React.FC = () => {
  const { users, user: currentUser, switchUser, currentAccount } = useAuth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage account members and permissions</p>
          <p className="text-sm text-gray-500 mt-1" dir="rtl">إدارة أعضاء الحساب والصلاحيات</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
          <UserPlus className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Account Info */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">{currentAccount}</h2>
            <p className="text-blue-100">Shared family account for task and fitness management</p>
            <div className="mt-3" dir="rtl">
              <p className="text-blue-100">حساب عائلي مشترك لإدارة المهام واللياقة البدنية</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-blue-100">Active Members</div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Account Members</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                    {user.id === currentUser?.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                      {user.role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined Jan 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                  
                  {user.id === currentUser?.id ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Current User
                    </span>
                  ) : (
                    <button
                      onClick={() => switchUser(user.id)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      Switch To
                    </button>
                  )}
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* User Stats */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">5</div>
                  <div className="text-xs text-gray-500">Workouts</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">8</div>
                  <div className="text-xs text-gray-500">Journal</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">95%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Permissions</h3>
          <div className="space-y-3">
            {[
              'Create and edit tasks',
              'Log workout sessions',
              'Access personal journal',
              'Use AI assistant',
              'View other members\' progress',
              'Manage account settings'
            ].map((permission, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{permission}</span>
                <div className="flex space-x-2">
                  <span className="text-xs text-green-600">✓ Admin</span>
                  <span className="text-xs text-blue-600">✓ Member</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Share workout progress</p>
                <p className="text-xs text-gray-500">Allow other members to see your fitness stats</p>
              </div>
              <button className="w-10 h-6 bg-blue-500 rounded-full relative transition-colors">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Private journal entries</p>
                <p className="text-xs text-gray-500">Keep journal entries completely private</p>
              </div>
              <button className="w-10 h-6 bg-blue-500 rounded-full relative transition-colors">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Task notifications</p>
                <p className="text-xs text-gray-500">Get notified about task updates</p>
              </div>
              <button className="w-10 h-6 bg-gray-300 rounded-full relative transition-colors">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};