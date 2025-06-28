import React, { useState } from 'react';
import { Plus, Filter, Search, CheckCircle2, Circle, Trash2, Edit3, Zap, Target, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask, Task } from '../contexts/TaskContext';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { getUserTasks, addTask, updateTask, deleteTask } = useTask();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [category, setCategory] = useState<'all' | 'general' | 'workout' | 'personal'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const userTasks = getUserTasks(user?.id || '');
  
  const filteredTasks = userTasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.completed) || 
      (filter === 'pending' && !task.completed);
    
    const matchesCategory = category === 'all' || task.category === category;
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTask = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as 'low' | 'medium' | 'high',
      category: formData.get('category') as 'general' | 'workout' | 'personal',
      dueDate: formData.get('dueDate') as string,
      completed: false,
      userId: user?.id || ''
    };

    addTask(newTask);
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const toggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed });
  };

  const completedTasks = userTasks.filter(task => task.completed).length;
  const totalTasks = userTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text="TASK MANAGEMENT SYSTEM">
              TASK MANAGEMENT SYSTEM
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              OPERATIONS CENTER • STATUS: ACTIVE
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              COMPLETION RATE: {completionRate}% • PENDING: {totalTasks - completedTasks}
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">نظام إدارة المهام</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">معدل الإنجاز: {completionRate}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <div className="w-20 lg:w-24 h-20 lg:h-24 cyber-card rounded-full flex items-center justify-center neon-glow">
                <Target className="w-10 lg:w-12 h-10 lg:h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="cyber-btn bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:neon-glow transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="font-rajdhani font-medium">ADD TASK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          { name: 'Total Tasks', nameAr: 'إجمالي المهام', value: totalTasks, icon: Target, color: 'from-cyan-400 to-blue-600' },
          { name: 'Completed', nameAr: 'مكتملة', value: completedTasks, icon: CheckCircle2, color: 'from-green-400 to-emerald-600' },
          { name: 'Pending', nameAr: 'معلقة', value: totalTasks - completedTasks, icon: Clock, color: 'from-yellow-400 to-orange-600' },
          { name: 'Success Rate', nameAr: 'معدل النجاح', value: `${completionRate}%`, icon: Zap, color: 'from-purple-500 to-pink-600' }
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

      {/* Filters */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 relative z-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              placeholder="SEARCH OPERATIONS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cyber-input pl-10 pr-4 py-2 lg:py-3 w-full rounded-lg font-rajdhani placeholder:text-purple-400/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
            className="cyber-input px-4 py-2 lg:py-3 rounded-lg font-rajdhani"
          >
            <option value="all">ALL STATUS</option>
            <option value="pending">PENDING</option>
            <option value="completed">COMPLETED</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | 'general' | 'workout' | 'personal')}
            className="cyber-input px-4 py-2 lg:py-3 rounded-lg font-rajdhani"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="general">GENERAL</option>
            <option value="workout">WORKOUT</option>
            <option value="personal">PERSONAL</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 lg:space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="cyber-card rounded-xl p-4 lg:p-6 relative hover:neon-glow transition-all duration-300">
            <div className="absolute inset-0 animated-border rounded-xl"></div>
            
            <div className="flex items-start space-x-4 relative z-10">
              <button
                onClick={() => toggleTask(task.id, !task.completed)}
                className="mt-1 flex-shrink-0 cyber-btn p-2 rounded-lg transition-all duration-300"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 neon-text" />
                ) : (
                  <Circle className="w-5 h-5 text-cyan-400 hover:text-green-400 transition-colors" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-orbitron font-medium text-base lg:text-lg ${task.completed ? 'text-gray-500 line-through' : 'text-cyan-400 neon-text'}`}>
                      {task.title.toUpperCase()}
                    </h3>
                    {task.description && (
                      <p className={`text-sm mt-1 font-rajdhani ${task.completed ? 'text-gray-400' : 'text-purple-300'}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      <span className={`px-3 py-1 text-xs font-rajdhani font-medium rounded-full border ${
                        task.priority === 'high' ? 'bg-red-900/30 text-red-400 border-red-500/50' :
                        task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' :
                        'bg-gray-900/30 text-gray-400 border-gray-500/50'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 text-xs font-rajdhani font-medium bg-blue-900/30 text-blue-400 border border-blue-500/50 rounded-full">
                        {task.category.toUpperCase()}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-purple-400 font-rajdhani">
                          DUE: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="cyber-btn p-2 rounded-lg text-cyan-400 hover:text-blue-400 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="cyber-btn p-2 rounded-lg text-cyan-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 cyber-card rounded-xl">
            <Target className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-orbitron font-medium text-cyan-400 mb-2">NO OPERATIONS FOUND</h3>
            <p className="text-purple-400 font-rajdhani">Initialize your first task to begin operations!</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-2xl p-6 w-full max-w-md relative">
            <div className="absolute inset-0 animated-border rounded-2xl"></div>
            
            <h2 className="text-xl font-orbitron font-semibold text-cyan-400 mb-6 relative z-10 neon-text">INITIALIZE NEW TASK</h2>
            
            <form onSubmit={handleAddTask} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Task Identifier
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="Enter operation name"
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="Optional mission details"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    name="category"
                    className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  >
                    <option value="general">GENERAL</option>
                    <option value="workout">WORKOUT</option>
                    <option value="personal">PERSONAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Target Date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 cyber-btn px-4 py-3 text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-900/20 transition-all font-rajdhani font-medium"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 cyber-btn bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:neon-glow transition-all font-rajdhani font-medium"
                >
                  INITIALIZE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};