import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDGpKOcoDGGJY8wYrMlnLZZKQBOqOJJBJo';

interface UserContext {
  name?: string;
  totalTasks: number;
  completedTasks: number;
  recentWorkouts: any[];
  language: 'en' | 'ar';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ParsedWorkout {
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restTime?: number;
    duration?: number;
    notes?: string;
  }>;
  duration: number;
  notes?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(
    message: string,
    language: 'en' | 'ar',
    userContext: UserContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(language, userContext);
      const conversationHistory = chatHistory.slice(-10).map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');

      const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

Current user message: ${message}

Please respond naturally and helpfully. If the user asks for a workout plan, provide a detailed, structured workout with specific exercises, sets, reps, and rest times. Format workout plans clearly with each exercise on a separate line.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return language === 'en' 
        ? 'I apologize, but I\'m having trouble responding right now. Please try again.'
        : 'أعتذر، لكنني أواجه مشكلة في الرد الآن. يرجى المحاولة مرة أخرى.';
    }
  }

  async generateWorkoutPlan(preferences: any, language: 'en' | 'ar'): Promise<ParsedWorkout> {
    try {
      const prompt = language === 'en' 
        ? `Create a detailed ${preferences.level || 'beginner'} workout plan for ${preferences.duration || 30} minutes using ${preferences.equipment || 'bodyweight'} exercises. 

Please structure the response as a JSON object with the following format:
{
  "name": "Workout Name",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": 12,
      "weight": 0,
      "restTime": 60,
      "notes": "Form tips or modifications"
    }
  ],
  "duration": 30,
  "notes": "Overall workout notes"
}

Include 5-8 exercises with proper progression and variety.`
        : `أنشئ خطة تمرين مفصلة لمستوى ${preferences.level || 'مبتدئ'} لمدة ${preferences.duration || 30} دقيقة باستخدام تمارين ${preferences.equipment || 'وزن الجسم'}.

يرجى تنسيق الإجابة كـ JSON object بالشكل التالي:
{
  "name": "اسم التمرين",
  "exercises": [
    {
      "name": "اسم التمرين",
      "sets": 3,
      "reps": 12,
      "weight": 0,
      "restTime": 60,
      "notes": "نصائح الأداء أو التعديلات"
    }
  ],
  "duration": 30,
  "notes": "ملاحظات عامة للتمرين"
}

اشمل 5-8 تمارين مع التدرج المناسب والتنوع.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Try to parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse workout JSON:', parseError);
      }

      // Fallback: create a basic workout structure
      return this.createFallbackWorkout(preferences, language);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      return this.createFallbackWorkout(preferences, language);
    }
  }

  parseWorkoutFromText(text: string, language: 'en' | 'ar'): ParsedWorkout | null {
    try {
      // Look for workout patterns in the text
      const workoutNameMatch = text.match(/(?:workout|تمرين)[\s:]*([^\n]+)/i);
      const workoutName = workoutNameMatch ? workoutNameMatch[1].trim() : 
        (language === 'en' ? 'AI Generated Workout' : 'تمرين من الذكي الاصطناعي');

      const exercises: ParsedWorkout['exercises'] = [];
      
      // Enhanced regex patterns for exercise parsing
      const exercisePatterns = [
        // Pattern: "Exercise Name - 3 sets x 12 reps"
        /([^-\n]+)\s*-\s*(\d+)\s*(?:sets?|مجموعات?)\s*[x×]\s*(\d+)\s*(?:reps?|تكرار)/gi,
        // Pattern: "Exercise Name: 3x12"
        /([^:\n]+):\s*(\d+)\s*[x×]\s*(\d+)/gi,
        // Pattern: "1. Exercise Name (3 sets, 12 reps)"
        /\d+\.\s*([^(]+)\s*\((\d+)\s*(?:sets?|مجموعات?),?\s*(\d+)\s*(?:reps?|تكرار)/gi,
        // Pattern: "Exercise Name 3x12"
        /([A-Za-z\s]+)\s+(\d+)\s*[x×]\s*(\d+)(?:\s|$)/gi
      ];

      let exerciseCount = 0;
      for (const pattern of exercisePatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null && exerciseCount < 10) {
          const name = match[1].trim();
          const sets = parseInt(match[2]);
          const reps = parseInt(match[3]);
          
          if (name && sets > 0 && reps > 0) {
            // Check for weight and rest time in surrounding text
            const exerciseContext = text.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50);
            const weightMatch = exerciseContext.match(/(\d+)\s*(?:kg|lbs?|pounds?)/i);
            const restMatch = exerciseContext.match(/(?:rest|راحة)[\s:]*(\d+)\s*(?:sec|seconds?|min|minutes?|ثانية|دقيقة)/i);
            
            exercises.push({
              name: name,
              sets: sets,
              reps: reps,
              weight: weightMatch ? parseInt(weightMatch[1]) : undefined,
              restTime: restMatch ? parseInt(restMatch[1]) * (restMatch[0].includes('min') ? 60 : 1) : 60,
              notes: this.extractExerciseNotes(exerciseContext, name)
            });
            exerciseCount++;
          }
        }
      }

      // If no exercises found with patterns, try to extract from bullet points or numbered lists
      if (exercises.length === 0) {
        const lines = text.split('\n');
        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine && (cleanLine.match(/^[-•*]\s/) || cleanLine.match(/^\d+\.\s/))) {
            const exerciseName = cleanLine.replace(/^[-•*\d.]\s*/, '').trim();
            if (exerciseName.length > 3 && exerciseName.length < 50) {
              exercises.push({
                name: exerciseName,
                sets: 3,
                reps: 12,
                restTime: 60
              });
            }
          }
        }
      }

      if (exercises.length === 0) {
        return null;
      }

      // Extract duration
      const durationMatch = text.match(/(\d+)\s*(?:min|minutes?|دقيقة|دقائق)/i);
      const duration = durationMatch ? parseInt(durationMatch[1]) : exercises.length * 5;

      return {
        name: workoutName,
        exercises: exercises,
        duration: duration,
        notes: this.extractWorkoutNotes(text)
      };
    } catch (error) {
      console.error('Error parsing workout from text:', error);
      return null;
    }
  }

  private extractExerciseNotes(context: string, exerciseName: string): string {
    // Look for form tips or modifications near the exercise
    const notePatterns = [
      /(?:form|tip|note|ملاحظة)[\s:]*([^.!?\n]+)/i,
      /\(([^)]+)\)/,
      /\*([^*]+)\*/
    ];

    for (const pattern of notePatterns) {
      const match = context.match(pattern);
      if (match && match[1] && !match[1].includes(exerciseName)) {
        return match[1].trim();
      }
    }
    return '';
  }

  private extractWorkoutNotes(text: string): string {
    const notePatterns = [
      /(?:notes?|tips?|remember|important|ملاحظات?)[\s:]*([^.!?\n]{10,100})/i,
      /(?:cool down|warm up|إحماء|تبريد)[\s:]*([^.!?\n]+)/i
    ];

    for (const pattern of notePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  private createFallbackWorkout(preferences: any, language: 'en' | 'ar'): ParsedWorkout {
    const isArabic = language === 'ar';
    
    const exercises = isArabic ? [
      { name: 'تمرين الضغط', sets: 3, reps: 12, restTime: 60 },
      { name: 'القرفصاء', sets: 3, reps: 15, restTime: 60 },
      { name: 'تمرين البلانك', sets: 3, reps: 30, restTime: 45 },
      { name: 'الطعنات', sets: 3, reps: 10, restTime: 60 },
      { name: 'تمرين الجبل المتسلق', sets: 3, reps: 20, restTime: 45 }
    ] : [
      { name: 'Push-ups', sets: 3, reps: 12, restTime: 60 },
      { name: 'Squats', sets: 3, reps: 15, restTime: 60 },
      { name: 'Plank Hold', sets: 3, reps: 30, restTime: 45 },
      { name: 'Lunges', sets: 3, reps: 10, restTime: 60 },
      { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: 45 }
    ];

    return {
      name: isArabic ? 'تمرين شامل للجسم' : 'Full Body Workout',
      exercises: exercises,
      duration: preferences.duration || 30,
      notes: isArabic ? 'تمرين متوازن لجميع عضلات الجسم' : 'Balanced workout targeting all major muscle groups'
    };
  }

  async generateTaskSuggestions(currentTasks: any[], language: 'en' | 'ar'): Promise<string[]> {
    try {
      const prompt = language === 'en'
        ? `Based on these current tasks: ${currentTasks.map(t => t.title).join(', ')}, suggest 5 new productive tasks for today. Return only the task titles, one per line.`
        : `بناءً على هذه المهام الحالية: ${currentTasks.map(t => t.title).join(', ')}، اقترح 5 مهام جديدة ومفيدة لليوم. أرجع عناوين المهام فقط، واحد في كل سطر.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+\./))
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return language === 'en' 
        ? ['Review daily goals', 'Plan tomorrow\'s schedule', 'Organize workspace', 'Read for 30 minutes', 'Practice mindfulness']
        : ['مراجعة الأهداف اليومية', 'تخطيط جدول الغد', 'تنظيم مساحة العمل', 'القراءة لمدة 30 دقيقة', 'ممارسة التأمل'];
    }
  }

  parseAddCommand(text: string): { type: 'task' | 'workout'; data: string } | null {
    const taskPatterns = [
      /add task[:\s]+(.+)/i,
      /create task[:\s]+(.+)/i,
      /new task[:\s]+(.+)/i,
      /أضف مهمة[:\s]+(.+)/i,
      /مهمة جديدة[:\s]+(.+)/i
    ];

    const workoutPatterns = [
      /add workout[:\s]+(.+)/i,
      /create workout[:\s]+(.+)/i,
      /log workout[:\s]+(.+)/i,
      /أضف تمرين[:\s]+(.+)/i,
      /تمرين جديد[:\s]+(.+)/i
    ];

    for (const pattern of taskPatterns) {
      const match = text.match(pattern);
      if (match) {
        return { type: 'task', data: match[1].trim() };
      }
    }

    for (const pattern of workoutPatterns) {
      const match = text.match(pattern);
      if (match) {
        return { type: 'workout', data: match[1].trim() };
      }
    }

    return null;
  }

  private getSystemPrompt(language: 'en' | 'ar', userContext: UserContext): string {
    const basePrompt = language === 'en' 
      ? `You are an AI fitness and productivity assistant. You help users with:
- Task management and productivity
- Workout planning and fitness advice
- Goal setting and motivation
- General conversation and support

User context:
- Name: ${userContext.name || 'User'}
- Total tasks: ${userContext.totalTasks}
- Completed tasks: ${userContext.completedTasks}
- Recent workouts: ${userContext.recentWorkouts.length}

When creating workout plans:
1. Always provide specific exercises with sets, reps, and rest times
2. Structure exercises clearly with each on a separate line
3. Include form tips and modifications when helpful
4. Consider the user's fitness level and available equipment
5. Make workouts practical and achievable

Be encouraging, helpful, and provide actionable advice.`
      : `أنت مساعد ذكي للياقة البدنية والإنتاجية. تساعد المستخدمين في:
- إدارة المهام والإنتاجية
- تخطيط التمارين ونصائح اللياقة
- وضع الأهداف والتحفيز
- المحادثة العامة والدعم

سياق المستخدم:
- الاسم: ${userContext.name || 'المستخدم'}
- إجمالي المهام: ${userContext.totalTasks}
- المهام المكتملة: ${userContext.completedTasks}
- التمارين الأخيرة: ${userContext.recentWorkouts.length}

عند إنشاء خطط التمرين:
1. قدم دائماً تمارين محددة مع المجموعات والتكرارات وأوقات الراحة
2. نظم التمارين بوضوح مع كل تمرين في سطر منفصل
3. اشمل نصائح الأداء والتعديلات عند الحاجة
4. اعتبر مستوى لياقة المستخدم والمعدات المتاحة
5. اجعل التمارين عملية وقابلة للتحقيق

كن مشجعاً ومفيداً وقدم نصائح قابلة للتطبيق.`;

    return basePrompt;
  }
}

export const geminiService = new GeminiService();