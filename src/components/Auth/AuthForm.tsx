import React, { useState } from 'react';
import { CheckSquare, Eye, EyeOff, Globe, Mail, User, Chrome, Zap } from 'lucide-react';
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

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center neon-glow">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-orbitron font-bold cyber-text-glow mb-4 glitch" data-text="NEXUS SYSTEM">
            NEXUS SYSTEM
          </h1>
          <p className="text-purple-400 font-rajdhani text-lg">
            {language === 'ar' 
              ? (isSignUp ? 'إنشاء حساب جديد' : 'تسجيل دخول النظام') 
              : (isSignUp ? 'INITIALIZE NEW USER' : 'SYSTEM ACCESS REQUIRED')
            }
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="cyber-btn flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <Globe className="w-4 h-4" />
            <span className="font-rajdhani">{language === 'ar' ? 'ENGLISH' : 'العربية'}</span>
          </button>
        </div>

        {/* Auth Form */}
        <div className="cyber-card rounded-2xl p-8 relative">
          <div className="absolute inset-0 animated-border rounded-2xl"></div>
          
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full cyber-btn flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 mb-6 relative z-10"
          >
            <Chrome className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-rajdhani font-medium">
              {language === 'ar' 
                ? 'تسجيل الدخول بـ GOOGLE' 
                : 'GOOGLE ACCESS PROTOCOL'
              }
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 cyber-card text-purple-400 font-rajdhani">
                {language === 'ar' ? 'أو' : 'OR'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {isSignUp && (
              <div>
                <label htmlFor="name" className={`block text-sm font-rajdhani font-medium text-cyan-400 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar' ? 'الاسم الكامل' : 'USER IDENTIFIER'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg font-rajdhani"
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter user identifier'}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-rajdhani font-medium text-cyan-400 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'البريد الإلكتروني' : 'EMAIL PROTOCOL'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg font-rajdhani"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter email address'}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-rajdhani font-medium text-cyan-400 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar' ? 'كلمة المرور' : 'ACCESS CODE'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input w-full px-4 py-3 pr-12 rounded-lg font-rajdhani"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter access code'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-purple-400 mt-1 font-rajdhani">
                  {language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Minimum 6 characters required'}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 cyber-card border border-red-500/50 rounded-lg">
                <p className={`text-sm text-red-400 font-rajdhani ${language === 'ar' ? 'text-right' : ''}`}>
                  ERROR: {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cyber-btn bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-lg font-rajdhani font-medium hover:neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (language === 'ar' ? 'جاري المعالجة...' : 'PROCESSING...')
                : (language === 'ar' 
                    ? (isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول')
                    : (isSignUp ? 'INITIALIZE USER' : 'ACCESS SYSTEM')
                  )
              }
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center relative z-10">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearError();
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-cyan-400 hover:text-purple-400 font-rajdhani font-medium transition-colors"
            >
              {language === 'ar' 
                ? (isSignUp ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً')
                : (isSignUp ? 'EXISTING USER? ACCESS SYSTEM' : 'NEW USER? INITIALIZE ACCOUNT')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};