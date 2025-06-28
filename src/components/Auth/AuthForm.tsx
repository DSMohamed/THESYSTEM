import React, { useState } from 'react';
import { CheckSquare, Eye, EyeOff, Globe, Mail, User, Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  const { signIn, signUp, signInWithGoogle, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error is handled by the context
    }
  };

  const demoUsers = [
    { email: 'demo@example.com', name: 'Demo User (Try this!)' },
    { email: 'sarah@example.com', name: 'Sarah Johnson (Demo)' },
    { email: 'ahmed@example.com', name: 'أحمد محمد (Demo)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'ar' 
              ? (isSignUp ? 'إنشاء حساب جديد' : 'مرحباً بك') 
              : (isSignUp ? 'Create Account' : 'Welcome to DailyFlow')
            }
          </h1>
          <p className="text-gray-600">
            {language === 'ar' 
              ? (isSignUp ? 'أنشئ حسابك لإدارة مهامك اليومية' : 'سجل دخولك لإدارة مهامك اليومية')
              : (isSignUp ? 'Create your account to manage daily tasks' : 'Sign in to manage your daily tasks')
            }
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <Chrome className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">
              {language === 'ar' 
                ? 'تسجيل الدخول بـ Google' 
                : 'Continue with Google'
              }
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {language === 'ar' ? 'أو' : 'or'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className={`text-sm text-red-700 ${language === 'ar' ? 'text-right' : ''}`}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                : (language === 'ar' 
                    ? (isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول')
                    : (isSignUp ? 'Create Account' : 'Sign In')
                  )
              }
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearError();
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {language === 'ar' 
                ? (isSignUp ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً')
                : (isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up')
              }
            </button>
          </div>

          {/* Demo Users (only for sign in) */}
          {!isSignUp && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className={`text-sm text-gray-600 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'المستخدمون التجريبيون:' : 'Demo Users:'}
              </p>
              <div className="space-y-2">
                {demoUsers.map((user, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setEmail(user.email);
                      setPassword('demo123');
                      clearError();
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${
                      language === 'ar' ? 'text-right' : ''
                    }`}
                  >
                    {user.name} - {user.email}
                  </button>
                ))}
              </div>
              <p className={`text-xs text-gray-500 mt-2 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'كلمة المرور: demo123' : 'Password: demo123'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};