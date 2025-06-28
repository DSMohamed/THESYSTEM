import React, { useState } from 'react';
import { Plus, Clock, TrendingUp, Calendar, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask, WorkoutSession } from '../contexts/TaskContext';

export const Workouts: React.FC = () => {
  const { user } = useAuth();
  const { getUserWorkouts, addWorkout } = useTask();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);

  const userWorkouts = getUserWorkouts(user?.id || '');

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = (workout: WorkoutSession) => {
    setCurrentWorkout(workout);
    setIsTimerRunning(true);
    setTimerSeconds(0);
  };

  const handleStopWorkout = () => {
    setIsTimerRunning(false);
    setCurrentWorkout(null);
    setTimerSeconds(0);
  };

  const workoutStats = {
    totalWorkouts: userWorkouts.length,
    totalTime: userWorkouts.reduce((acc, workout) => acc + workout.duration, 0),
    averageTime: userWorkouts.length > 0 ? Math.round(userWorkouts.reduce((acc, workout) => acc + workout.duration, 0) / userWorkouts.length) : 0,
    thisWeek: userWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600 mt-1">Track your fitness journey and progress</p>
          <p className="text-sm text-gray-500 mt-1" dir="rtl">تتبع رحلة اللياقة والتقدم</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workouts</p>
              <p className="text-xs text-gray-400 mt-1" dir="rtl">إجمالي التمارين</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{workoutStats.totalWorkouts}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-xs text-gray-400 mt-1" dir="rtl">إجمالي الوقت</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{workoutStats.totalTime}min</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Time</p>
              <p className="text-xs text-gray-400 mt-1" dir="rtl">متوسط الوقت</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{workoutStats.averageTime}min</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-xs text-gray-400 mt-1" dir="rtl">هذا الأسبوع</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{workoutStats.thisWeek}</p>
        </div>
      </div>

      {/* Active Workout Timer */}
      {currentWorkout && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Active Workout</h3>
              <p className="text-green-100">{currentWorkout.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(timerSeconds)}</div>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleStopWorkout}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Workout History</h3>
        
        <div className="space-y-4">
          {userWorkouts.map((workout) => (
            <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{workout.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(workout.date).toLocaleDateString()} • {workout.duration} minutes
                  </p>
                </div>
                <button
                  onClick={() => handleStartWorkout(workout)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 text-sm">{exercise.name}</h5>
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      <div>Sets: {exercise.sets}</div>
                      <div>Reps: {exercise.reps}</div>
                      {exercise.weight && <div>Weight: {exercise.weight}kg</div>}
                      {exercise.restTime && <div>Rest: {exercise.restTime}s</div>}
                    </div>
                  </div>
                ))}
              </div>

              {workout.notes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{workout.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {userWorkouts.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts recorded yet</h3>
            <p className="text-gray-600">Start logging your workouts to track your progress!</p>
          </div>
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Log New Workout</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              const newWorkout: Omit<WorkoutSession, 'id'> = {
                name: formData.get('name') as string,
                exercises: [
                  {
                    id: '1',
                    name: formData.get('exercise1') as string || 'Push-ups',
                    sets: parseInt(formData.get('sets1') as string) || 3,
                    reps: parseInt(formData.get('reps1') as string) || 10,
                    weight: formData.get('weight1') ? parseInt(formData.get('weight1') as string) : undefined,
                    restTime: formData.get('rest1') ? parseInt(formData.get('rest1') as string) : undefined
                  }
                ],
                duration: parseInt(formData.get('duration') as string) || 30,
                date: formData.get('date') as string || new Date().toISOString().split('T')[0],
                notes: formData.get('notes') as string,
                userId: user?.id || ''
              };

              addWorkout(newWorkout);
              setShowAddForm(false);
              e.currentTarget.reset();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Upper Body Strength"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Exercise Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Exercises</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exercise Name
                    </label>
                    <input
                      name="exercise1"
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Push-ups"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sets</label>
                      <input
                        name="sets1"
                        type="number"
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reps</label>
                      <input
                        name="reps1"
                        type="number"
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        name="weight1"
                        type="number"
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rest (sec)</label>
                      <input
                        name="rest1"
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="How did it feel? Any observations?"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Log Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};