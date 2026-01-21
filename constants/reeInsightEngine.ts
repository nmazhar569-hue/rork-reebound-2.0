import { ReeScreenContext, ReeContextualInsight, IntentProfile } from '@/types';

interface InsightContext {
  isReturning: boolean;
  daysAway: number;
  hasProgram: boolean;
  hasTodayWorkout: boolean;
  painLevel: number;
  confidence: 'low' | 'medium' | 'high' | null;
  recoveryFirstMode: boolean;
  intentProfile?: IntentProfile;
  isFirstVisit: boolean;
  taughtConcepts: string[];
  referencedTopics: string[];
}

export function generateContextualInsight(
  screen: ReeScreenContext,
  context: InsightContext
): ReeContextualInsight | null {
  const { isReturning, daysAway, painLevel, confidence, isFirstVisit, hasTodayWorkout } = context;

  if (screen === 'home') {
    if (isReturning && daysAway > 3) {
      return {
        id: `welcome-back-${Date.now()}`,
        trigger: 'returning_user',
        category: 'orientation',
        priority: 1,
        message: `Welcome back! It's been ${daysAway} days. Let's ease into things.`,
        expandedMessage: 'Your body may need some time to readjust. Consider starting with lighter activities.',
      };
    }

    if (painLevel > 6) {
      return {
        id: `high-pain-${Date.now()}`,
        trigger: 'high_pain_level',
        category: 'confidence',
        priority: 1,
        message: 'Your pain level is elevated today. Focus on recovery.',
        expandedMessage: 'Listen to your body. Recovery exercises might be more beneficial than intense training.',
      };
    }

    if (isFirstVisit) {
      return {
        id: `first-home-${Date.now()}`,
        trigger: 'first_home_visit',
        category: 'orientation',
        priority: 2,
        message: 'This is your home base. Check in daily to track your progress.',
      };
    }
  }

  if (screen === 'plan') {
    if (!context.hasProgram) {
      return {
        id: `no-program-${Date.now()}`,
        trigger: 'no_program',
        category: 'choice_support',
        priority: 2,
        message: 'You don\'t have an active program yet. Want to build one?',
        expandedMessage: 'A structured program can help you stay consistent and track progress.',
      };
    }

    if (isFirstVisit) {
      return {
        id: `first-plan-${Date.now()}`,
        trigger: 'first_plan_visit',
        category: 'orientation',
        priority: 2,
        message: 'This is where you manage your training plan.',
      };
    }
  }

  if (screen === 'recovery') {
    if (painLevel > 3) {
      return {
        id: `recovery-suggestion-${Date.now()}`,
        trigger: 'recovery_needed',
        category: 'explanation',
        priority: 2,
        message: 'Recovery exercises can help reduce discomfort.',
        expandedMessage: 'Gentle movement and stretching promote blood flow and healing.',
      };
    }
  }

  if (screen === 'progress') {
    if (isFirstVisit) {
      return {
        id: `first-progress-${Date.now()}`,
        trigger: 'first_progress_visit',
        category: 'orientation',
        priority: 2,
        message: 'Track your journey here. Every step counts.',
      };
    }
  }

  if (screen === 'workout') {
    if (confidence === 'low') {
      return {
        id: `low-confidence-workout-${Date.now()}`,
        trigger: 'low_confidence_workout',
        category: 'confidence',
        priority: 1,
        message: 'It\'s okay to take it easy. Modify exercises as needed.',
      };
    }
  }

  return null;
}

export function generateHomeInsight(context: InsightContext): ReeContextualInsight | null {
  const { painLevel, confidence, hasTodayWorkout, isReturning, daysAway } = context;

  if (isReturning && daysAway > 7) {
    return {
      id: `extended-break-${Date.now()}`,
      trigger: 'extended_break',
      category: 'orientation',
      priority: 1,
      message: 'It\'s been a while. Let\'s start fresh together.',
      expandedMessage: 'No pressure. We\'ll build back gradually at your pace.',
    };
  }

  if (painLevel <= 2 && confidence === 'high') {
    return {
      id: `great-condition-${Date.now()}`,
      trigger: 'great_condition',
      category: 'confidence',
      priority: 3,
      message: 'You\'re feeling great today! Make the most of it.',
    };
  }

  if (hasTodayWorkout && confidence !== 'low') {
    return {
      id: `workout-ready-${Date.now()}`,
      trigger: 'workout_ready',
      category: 'choice_support',
      priority: 2,
      message: 'Your workout is ready when you are.',
    };
  }

  return null;
}
