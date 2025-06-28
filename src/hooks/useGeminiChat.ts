import { useState, useCallback, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language: 'en' | 'ar';
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { getUserTasks, getUserWorkouts, addTask, addWorkout } = useTask();

  // Initialize with default messages
  const getDefaultMessages = (): Message[] => [
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant powered by Google Gemini. I can help you with tasks, workout planning, goal setting, and general conversation. I also speak Arabic fluently. How can I assist you today?',
      isUser: false,
      timestamp: new Date(),
      language: 'en'
    },
    {
      id: '2',
      content: 'مرحباً! أنا مساعدك الذكي المدعوم بـ Google Gemini. يمكنني مساعدتك في المهام، تخطيط التمارين، وضع الأهداف، والمحادثة العامة. كيف يمكنني مساعدتك اليوم؟',
      isUser: false,
      timestamp: new Date(),
      language: 'ar'
    }
  ];

  // Load chat history from localStorage on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`geminiChatHistory_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((msg: any) => ({ 
            ...msg, 
            timestamp: new Date(msg.timestamp) 
          }));
          setMessages(parsed);
        } catch (error) {
          console.error('Error loading chat history:', error);
          setMessages(getDefaultMessages());
        }
      } else {
        // No saved history, use default messages
        setMessages(getDefaultMessages());
      }
    } else {
      // No user, clear messages
      setMessages([]);
    }
  }, [user?.id]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      try {
        const messagesToSave = messages.map(m => ({ 
          ...m, 
          timestamp: m.timestamp.toISOString() 
        }));
        localStorage.setItem(`geminiChatHistory_${user.id}`, JSON.stringify(messagesToSave));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, user?.id]);

  const sendMessage = useCallback(async (content: string, language: 'en' | 'ar') => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Prepare user context
      const userTasks = getUserTasks(user?.id || '');
      const userWorkouts = getUserWorkouts(user?.id || '');
      const userContext = {
        name: user?.name,
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.completed).length,
        recentWorkouts: userWorkouts.slice(0, 3),
        language
      };

      // Prepare chat history for Gemini
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.isUser ? 'user' as 'user' : 'assistant' as 'assistant',
        content: m.content
      }));

      // Get AI response
      const aiResponse = await geminiService.generateResponse(content, language, userContext, chatHistory);

      // Check if this is a workout creation request
      const isWorkoutRequest = /(?:create|make|generate|plan|design|build|أنشئ|اصنع|خطط|صمم).*(?:workout|exercise|training|تمرين|تدريب)/i.test(content) ||
                              /(?:workout|exercise|training|تمرين|تدريب).*(?:plan|routine|program|خطة|روتين|برنامج)/i.test(content);

      if (isWorkoutRequest && user) {
        // Try to parse workout from AI response
        const parsedWorkout = geminiService.parseWorkoutFromText(aiResponse, language);
        
        if (parsedWorkout) {
          // Add the parsed workout to user's workouts
          addWorkout({
            name: parsedWorkout.name,
            exercises: parsedWorkout.exercises.map((exercise, index) => ({
              id: (Date.now() + index).toString(),
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime
            })),
            duration: parsedWorkout.duration,
            date: new Date().toISOString().split('T')[0],
            notes: parsedWorkout.notes || aiResponse,
            userId: user.id
          });

          // Add a confirmation message
          const confirmationMessage = language === 'en' 
            ? `\n\n✅ I've automatically added "${parsedWorkout.name}" to your workouts with ${parsedWorkout.exercises.length} exercises!`
            : `\n\n✅ تم إضافة "${parsedWorkout.name}" تلقائياً إلى تماrinك مع ${parsedWorkout.exercises.length} تمارين!`;
          
          // Update the AI response to include confirmation
          const enhancedResponse = aiResponse + confirmationMessage;
          
          // Add AI message with confirmation
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: enhancedResponse,
            isUser: false,
            timestamp: new Date(),
            language
          };

          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Check for add task/workout command
      const addCommand = geminiService.parseAddCommand(aiResponse);
      if (addCommand && user) {
        if (addCommand.type === 'task') {
          addTask({
            title: addCommand.data,
            description: '',
            priority: 'medium',
            category: 'general',
            dueDate: '',
            completed: false,
            userId: user.id
          });
        } else if (addCommand.type === 'workout') {
          addWorkout({
            name: addCommand.data,
            exercises: [],
            duration: 30,
            date: new Date().toISOString().split('T')[0],
            notes: '',
            userId: user.id
          });
        }
      }

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        language
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en'
          ? 'I apologize, but I\'m having trouble responding right now. Please try again.'
          : 'أعتذر، لكنني أواجه مشكلة في الرد الآن. يرجى المحاولة مرة أخرى.',
        isUser: false,
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [user, getUserTasks, getUserWorkouts, addTask, addWorkout, messages]);

  const generateTaskSuggestions = useCallback(async (language: 'en' | 'ar') => {
    const userTasks = getUserTasks(user?.id || '');
    return await geminiService.generateTaskSuggestions(userTasks, language);
  }, [user, getUserTasks]);

  const generateWorkoutPlan = useCallback(async (preferences: any, language: 'en' | 'ar') => {
    return await geminiService.generateWorkoutPlan(preferences, language);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    generateTaskSuggestions,
    generateWorkoutPlan
  };
};