import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Crown, 
  Settings, 
  Mail, 
  Calendar, 
  Shield, 
  Activity,
  Search,
  Filter,
  Trash2,
  Edit3,
  UserCheck,
  UserX,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Eye,
  Ban,
  RefreshCw,
  Download,
  Upload,
  Database,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService, User, UserStats } from '../services/authService';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Only show this page if user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="cyber-card rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-orbitron font-bold text-red-400 mb-2">ACCESS DENIED</h2>
          <p className="text-purple-400 font-rajdhani">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      showMessage('error', 'Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await authService.getUserStats();
      setUserStats(stats);
    } catch (error: any) {
      console.error('Failed to load user stats:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      showMessage('error', 'Cannot delete your own account');
      return;
    }

    try {
      setActionLoading(userId);
      await authService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
      showMessage('success', 'User deleted successfully');
      loadUserStats();
    } catch (error: any) {
      showMessage('error', 'Failed to delete user: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'member') => {
    if (userId === currentUser?.id) {
      showMessage('error', 'Cannot change your own role');
      return;
    }

    try {
      setActionLoading(userId);
      const newRole = currentRole === 'admin' ? 'member' : 'admin';
      await authService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showMessage('success', `User role updated to ${newRole}`);
      loadUserStats();
    } catch (error: any) {
      showMessage('error', 'Failed to update user role: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser?.id) {
      showMessage('error', 'Cannot change your own status');
      return;
    }

    try {
      setActionLoading(userId);
      const newStatus = !currentStatus;
      await authService.toggleUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
      showMessage('success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      loadUserStats();
    } catch (error: any) {
      showMessage('error', 'Failed to update user status: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created At', 'Last Login', 'Login Count'].join(','),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '',
        user.loginCount || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text="USER MANAGEMENT SYSTEM">
              USER MANAGEMENT SYSTEM
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              ADMIN CONTROL PANEL • STATUS: OPERATIONAL
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              TOTAL USERS: {userStats?.totalUsers || 0} • ACTIVE: {userStats?.activeUsers || 0}
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">نظام إدارة المستخدمين</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">إجمالي المستخدمين: {userStats?.totalUsers || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <div className="w-20 lg:w-24 h-20 lg:h-24 cyber-card rounded-full flex items-center justify-center neon-glow">
                <UsersIcon className="w-10 lg:w-12 h-10 lg:h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={exportUsers}
                className="cyber-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:neon-glow transition-all duration-300 flex items-center space-x-2"
              >
                <Download className="w-4 lg:w-5 h-4 lg:h-5" />
                <span className="font-rajdhani font-medium hidden sm:inline">EXPORT</span>
              </button>
              <button 
                onClick={loadUsers}
                className="cyber-btn bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:neon-glow transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 lg:w-5 h-4 lg:h-5" />
                <span className="font-rajdhani font-medium hidden sm:inline">REFRESH</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`cyber-card rounded-xl p-4 border ${
          message.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'
        } relative`}>
          <div className="flex items-center space-x-3 relative z-10">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <p className={`font-rajdhani ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
          {[
            { name: 'Total Users', nameAr: 'إجمالي المستخدمين', value: userStats.totalUsers, icon: UsersIcon, color: 'from-blue-400 to-cyan-600' },
            { name: 'Active Users', nameAr: 'المستخدمون النشطون', value: userStats.activeUsers, icon: UserCheck, color: 'from-green-400 to-emerald-600' },
            { name: 'Admins', nameAr: 'المديرون', value: userStats.adminUsers, icon: Crown, color: 'from-yellow-400 to-orange-600' },
            { name: 'New This Week', nameAr: 'جديد هذا الأسبوع', value: userStats.newUsersThisWeek, icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
            { name: 'Total Logins', nameAr: 'إجمالي تسجيلات الدخول', value: userStats.totalLogins, icon: Activity, color: 'from-indigo-400 to-purple-600' }
          ].map((stat, index) => (
            <div key={stat.name} className="cyber-card rounded-lg lg:rounded-xl p-3 lg:p-6 relative overflow-hidden group hover:neon-glow transition-all duration-300">
              <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
                <div className="mb-2 lg:mb-0">
                  <p className="text-xs lg:text-sm font-rajdhani font-medium text-purple-400 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-xs text-cyan-400 mt-1 font-rajdhani hidden lg:block" dir="rtl">{stat.nameAr}</p>
                </div>
                <div className={`w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center relative mb-2 lg:mb-0 neon-glow`}>
                  <stat.icon className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
                </div>
              </div>
              <div className="mt-2 lg:mt-4 relative z-10">
                <p className="text-xl lg:text-3xl font-orbitron font-bold text-cyan-400 neon-text">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 relative z-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              placeholder="SEARCH USERS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cyber-input pl-10 pr-4 py-2 lg:py-3 w-full rounded-lg font-rajdhani placeholder:text-purple-400/50"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'member')}
            className="cyber-input px-4 py-2 lg:py-3 rounded-lg font-rajdhani"
          >
            <option value="all">ALL ROLES</option>
            <option value="admin">ADMIN</option>
            <option value="member">MEMBER</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="cyber-input px-4 py-2 lg:py-3 rounded-lg font-rajdhani"
          >
            <option value="all">ALL STATUS</option>
            <option value="active">ACTIVE</option>
            <option value="inactive">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <h3 className="text-lg lg:text-xl font-orbitron font-semibold text-cyan-400 neon-text mb-4 lg:mb-6 relative z-10">USER REGISTRY</h3>
        
        {loading ? (
          <div className="text-center py-12 relative z-10">
            <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto mb-4 animate-spin" />
            <p className="text-purple-400 font-rajdhani">Loading user data...</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {filteredUsers.map((user) => (
              <div key={user.id} className="cyber-card rounded-lg p-4 lg:p-6 relative hover:neon-glow transition-all duration-300">
                <div className="absolute inset-0 animated-border rounded-lg"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        className="w-12 lg:w-16 h-12 lg:h-16 rounded-full object-cover border-2 neon-border"
                        src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                        alt={user.name}
                      />
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                        user.isActive ? 'bg-green-400' : 'bg-red-400'
                      } animate-pulse`}></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-orbitron font-medium text-cyan-400 neon-text">{user.name?.toUpperCase()}</h4>
                        {user.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                        {user.id === currentUser?.id && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full font-rajdhani">YOU</span>}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-purple-400 mt-1 font-rajdhani">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4" />
                          <span>{user.loginCount || 0} logins</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-rajdhani font-medium border ${
                      user.role === 'admin' 
                        ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' 
                        : 'bg-blue-900/30 text-blue-400 border-blue-500/50'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-rajdhani font-medium border ${
                      user.isActive 
                        ? 'bg-green-900/30 text-green-400 border-green-500/50'
                        : 'bg-red-900/30 text-red-400 border-red-500/50'
                    }`}>
                      {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    
                    {user.id !== currentUser?.id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          disabled={actionLoading === user.id}
                          className="cyber-btn p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-lg disabled:opacity-50"
                          title={`Make ${user.role === 'admin' ? 'Member' : 'Admin'}`}
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Crown className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive || false)}
                          disabled={actionLoading === user.id}
                          className={`cyber-btn p-2 transition-colors rounded-lg disabled:opacity-50 ${
                            user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : user.isActive ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          disabled={actionLoading === user.id}
                          className="cyber-btn p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <UsersIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-orbitron font-medium text-cyan-400 mb-2">NO USERS FOUND</h3>
                <p className="text-purple-400 font-rajdhani">No users match your current filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-2xl p-6 w-full max-w-md relative">
            <div className="absolute inset-0 animated-border rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-xl font-orbitron font-semibold text-red-400">CONFIRM DELETION</h2>
              </div>
              
              <p className="text-purple-400 font-rajdhani mb-6">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 cyber-btn px-4 py-3 text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-900/20 transition-all font-rajdhani font-medium"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  disabled={actionLoading === showDeleteConfirm}
                  className="flex-1 cyber-btn bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg hover:neon-glow transition-all font-rajdhani font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {actionLoading === showDeleteConfirm ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>DELETING...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>DELETE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};