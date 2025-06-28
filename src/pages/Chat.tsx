import React, { useState } from 'react';
import { Send, Bot, User, Globe, Volume2, Lightbulb, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGeminiChat } from '../hooks/useGeminiChat';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { messages, isTyping, sendMessage, generateTaskSuggestions, generateWorkoutPlan } = useGeminiChat();
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const messageContent = inputValue;
    setInputValue('');
    await sendMessage(messageContent, language);
  };

  const handleQuickAction = async (action: string) => {
    setInputValue(action);
    await sendMessage(action, language);
  };

  const handleTaskSuggestions = async () => {
    const suggestions = await generateTaskSuggestions(language);
    const suggestionText = language === 'en' 
      ? `Here are some task suggestions for today:\n${suggestions.join('\n')}`
      : `إليك بعض اقتراحات المهام لليوم:\n${suggestions.join('\n')}`;
    
    await sendMessage(suggestionText, language);
  };

  const handleWorkoutPlan = async () => {
    const preferences = {
      level: 'beginner',
      duration: 30,
      equipment: 'bodyweight'
    };
    
    const plan = await generateWorkoutPlan(preferences, language);
    await sendMessage(language === 'en' ? 'Create a workout plan for me' : 'أنشئ لي خطة تمرين', language);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-purple-500/30 cyber-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center neon-glow">
              <Bot className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-orbitron font-semibold cyber-text-glow">AI ASSISTANT</h1>
              <p className="text-xs lg:text-sm text-purple-400 font-rajdhani">Powered by Google Gemini</p>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">مدعوم بـ Google Gemini</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center space-x-2 cyber-btn px-3 py-2 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{language === 'ar' ? 'EN' : 'عر'}</span>
            </button>

            {/* Quick Actions */}
            <button
              onClick={handleTaskSuggestions}
              className="flex items-center space-x-1 cyber-btn px-3 py-2 rounded-lg transition-colors"
              title={language === 'en' ? 'Get task suggestions' : 'احصل على اقتراحات المهام'}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">
                {language === 'en' ? 'Tasks' : 'مهام'}
              </span>
            </button>

            <button
              onClick={handleWorkoutPlan}
              className="flex items-center space-x-1 cyber-btn px-3 py-2 rounded-lg transition-colors"
              title={language === 'en' ? 'Get workout plan' : 'احصل على خطة تمرين'}
            >
              <Dumbbell className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">
                {language === 'en' ? 'Workout' : 'تمرين'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-4 cyber-grid">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-2xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-6 lg:w-8 h-6 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-blue-500 neon-glow' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 neon-glow'
              }`}>
                {message.isUser ? (
                  <User className="w-3 lg:w-4 h-3 lg:h-4 text-white" />
                ) : (
                  <Bot className="w-3 lg:w-4 h-3 lg:h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`px-3 lg:px-4 py-2 lg:py-3 rounded-2xl cyber-card ${
                message.isUser 
                  ? 'bg-blue-500/20 text-cyan-400 neon-border' 
                  : 'text-white shadow-sm border border-purple-500/30'
              }`}>
                <div className={`${message.language === 'ar' ? 'text-right' : 'text-left'}`} dir={message.language === 'ar' ? 'rtl' : 'ltr'}>
                  {message.content.split('\n').map((line, index) => (
                    <p key={index} className={`text-sm lg:text-base ${index > 0 ? 'mt-2' : ''}`}>
                      {line}
                    </p>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${
                  message.isUser ? 'text-blue-200' : 'text-purple-400'
                } ${message.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-2xl">
              <div className="w-6 lg:w-8 h-6 lg:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center neon-glow">
                <Bot className="w-3 lg:w-4 h-3 lg:h-4 text-white" />
              </div>
              <div className="px-3 lg:px-4 py-2 lg:py-3 rounded-2xl cyber-card shadow-sm border border-purple-500/30">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 lg:p-6 cyber-card border-t border-purple-500/30">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 lg:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message...'}
              className={`w-full px-3 lg:px-4 py-2 lg:py-3 pr-10 lg:pr-12 cyber-input rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${
                language === 'ar' ? 'text-right' : 'text-left'
              }`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              disabled={isTyping}
            />
            {inputValue && (
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-cyan-400"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="cyber-btn bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 lg:p-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
          >
            <Send className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>
        </form>

        {/* Quick Actions */}
        <div className="mt-3 lg:mt-4 flex flex-wrap gap-2">
          {language === 'en' ? [
            "Help me plan my workout",
            "What should I focus on today?",
            "Give me motivation",
            "Analyze my progress",
            "Create a daily routine"
          ] : [
            "ساعدني في تخطيط تمريني",
            "على ماذا يجب أن أركز اليوم؟",
            "أعطني الدافع",
            "حلل تقدمي",
            "أنشئ روتيناً يومياً"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(suggestion)}
              disabled={isTyping}
              className="px-2 lg:px-3 py-1 text-xs lg:text-sm cyber-btn rounded-full transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-2 text-center">
          <p className="text-xs text-purple-400 font-rajdhani">
            {isTyping 
              ? (language === 'en' ? 'AI is thinking...' : 'الذكي الاصطناعي يفكر...')
              : (language === 'en' ? 'Powered by Google Gemini AI' : 'مدعوم بـ Google Gemini AI')
            }
          </p>
        </div>
      </div>
    </div>
  );
};