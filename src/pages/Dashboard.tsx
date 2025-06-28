import React from 'react';
import { CheckCircle2, Clock, TrendingUp, Calendar, Dumbbell, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserTasks, getUserWorkouts } = useTask();

  const userTasks = getUserTasks(user?.id || '');
  const userWorkouts = getUserWorkouts(user?.id || '');
  
  const completedTasks = userTasks.filter(task => task.completed).length;
  const totalTasks = userTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      name: 'Tasks Completed',
      nameAr: 'المهام المكتملة',
      value: `${completedTasks}/${totalTasks}`,
      change: `${completionRate}%`,
      changeType: 'positive',
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Workouts This Week',
      nameAr: 'التمارين هذا الأسبوع',
      value: userWorkouts.length.toString(),
      change: '+2 from last week',
      changeType: 'positive',
      icon: Dumbbell,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Active Streak',
      nameAr: 'الإنجاز المتتالي',
      value: '7 days',
      change: 'Keep it up!',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Journal Entries',
      nameAr: 'المذكرات',
      value: '12',
      change: '+3 this week',
      changeType: 'positive',
      icon: BookOpen,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const recentTasks = userTasks.slice(0, 5);
  const upcomingTasks = userTasks.filter(task => !task.completed && task.dueDate).slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-blue-100 text-lg">
              You have {userTasks.filter(t => !t.completed).length} pending tasks today
            </p>
            <div className="mt-4" dir="rtl">
              <h2 className="text-xl font-semibold">مرحباً بعودتك، {user?.name?.split(' ')[0]}!</h2>
              <p className="text-blue-100">لديك {userTasks.filter(t => !t.completed).length} مهام معلقة اليوم</p>
            </div>
          </div>
          <div className="hidden md:block">
            <Calendar className="w-24 h-24 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xs text-gray-400 mt-1" dir="rtl">{stat.nameAr}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <span className="text-sm text-gray-500" dir="rtl">المهام الحديثة</span>
          </div>
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  task.completed ? 'bg-green-500' : 
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">{task.category}</p>
                </div>
                {task.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            <span className="text-sm text-gray-500" dir="rtl">المهام القادمة</span>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.dueDate}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Add Task', nameAr: 'إضافة مهمة', icon: CheckCircle2, color: 'bg-blue-500' },
            { name: 'Log Workout', nameAr: 'تسجيل تمرين', icon: Dumbbell, color: 'bg-green-500' },
            { name: 'Write Journal', nameAr: 'كتابة مذكرة', icon: BookOpen, color: 'bg-purple-500' },
            { name: 'Chat with AI', nameAr: 'محادثة الذكي', icon: Users, color: 'bg-orange-500' }
          ].map((action) => (
            <button
              key={action.name}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.name}</span>
              <span className="text-xs text-gray-500 mt-1" dir="rtl">{action.nameAr}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};