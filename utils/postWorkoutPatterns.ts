import { DailyLog, FatigueLevel } from '@/types';

export interface PatternInsight {
  id: string;
  type: 'observation' | 'adjustment' | 'encouragement' | 'learning';
  message: string;
  context?: string;
}

export interface WorkoutPatterns {
  recentPainTrend: 'improving' | 'stable' | 'worsening' | 'insufficient_data';
  avgPainLast7Days: number;
  avgConfidenceLast7Days: number;
  workoutsThisWeek: number;
  consecutiveWorkouts: number;
  highPainDaysRecent: number;
  lowConfidenceDaysRecent: number;
  fatigueTrend: 'accumulating' | 'stable' | 'recovering' | 'insufficient_data';
}

export function analyzeWorkoutPatterns(logs: DailyLog[]): WorkoutPatterns {
  const now = new Date();
  const last7Days = logs.filter(log => {
    const logDate = new Date(log.date);
    const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && log.workoutCompleted;
  });

  const last14Days = logs.filter(log => {
    const logDate = new Date(log.date);
    const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 14 && log.workoutCompleted;
  });

  const avgPainLast7Days = last7Days.length > 0
    ? last7Days.reduce((sum, log) => sum + log.painLevel, 0) / last7Days.length
    : 0;

  const avgConfidenceLast7Days = last7Days.length > 0
    ? last7Days.reduce((sum, log) => sum + log.confidenceLevel, 0) / last7Days.length
    : 0;

  const first7 = last14Days.slice(last7Days.length);
  const avgPainPrevious7Days = first7.length > 0
    ? first7.reduce((sum, log) => sum + log.painLevel, 0) / first7.length
    : avgPainLast7Days;

  let recentPainTrend: WorkoutPatterns['recentPainTrend'] = 'insufficient_data';
  if (last7Days.length >= 2 && first7.length >= 2) {
    const diff = avgPainLast7Days - avgPainPrevious7Days;
    if (diff < -1) recentPainTrend = 'improving';
    else if (diff > 1) recentPainTrend = 'worsening';
    else recentPainTrend = 'stable';
  } else if (last7Days.length >= 2) {
    recentPainTrend = 'stable';
  }

  const sortedLogs = [...logs]
    .filter(l => l.workoutCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let consecutiveWorkouts = 0;
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    const expectedDate = new Date(now);
    expectedDate.setDate(expectedDate.getDate() - i);
    const diffDays = Math.abs(
      Math.floor((logDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    if (diffDays <= 1) {
      consecutiveWorkouts++;
    } else {
      break;
    }
  }

  const highPainDaysRecent = last7Days.filter(log => log.painLevel >= 6).length;
  const lowConfidenceDaysRecent = last7Days.filter(log => log.confidenceLevel <= 3).length;

  const fatigueValues: Record<FatigueLevel, number> = {
    fresh: 1,
    normal: 2,
    tired: 3,
    exhausted: 4,
  };

  const recentFatigue = last7Days
    .filter(log => log.fatigueLevel)
    .map(log => fatigueValues[log.fatigueLevel!]);

  let fatigueTrend: WorkoutPatterns['fatigueTrend'] = 'insufficient_data';
  if (recentFatigue.length >= 3) {
    const firstHalf = recentFatigue.slice(0, Math.floor(recentFatigue.length / 2));
    const secondHalf = recentFatigue.slice(Math.floor(recentFatigue.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (avgSecond > avgFirst + 0.5) fatigueTrend = 'accumulating';
    else if (avgSecond < avgFirst - 0.5) fatigueTrend = 'recovering';
    else fatigueTrend = 'stable';
  }

  return {
    recentPainTrend,
    avgPainLast7Days,
    avgConfidenceLast7Days,
    workoutsThisWeek: last7Days.length,
    consecutiveWorkouts,
    highPainDaysRecent,
    lowConfidenceDaysRecent,
    fatigueTrend,
  };
}

export function generateReeInsights(
  patterns: WorkoutPatterns,
  currentPain: number,
  currentConfidence: number,
  currentFatigue: FatigueLevel
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  if (currentPain <= 3 && patterns.recentPainTrend === 'improving') {
    insights.push({
      id: 'pain_improving',
      type: 'observation',
      message: "Pain levels have been trending down. Your body is adapting well.",
    });
  } else if (currentPain >= 6 && patterns.highPainDaysRecent >= 2) {
    insights.push({
      id: 'pain_elevated',
      type: 'adjustment',
      message: "We'll keep volume steady for now. Recovery signals have been mixed this week.",
      context: "Tendons adapt slower than muscles — giving them time pays off.",
    });
  } else if (currentPain >= 7) {
    insights.push({
      id: 'pain_high_today',
      type: 'adjustment',
      message: "Higher pain today noted. Tomorrow's session will adapt automatically.",
    });
  }

  if (currentFatigue === 'exhausted') {
    insights.push({
      id: 'fatigue_high',
      type: 'adjustment',
      message: "Fatigue is elevated. Rest is part of progress, not a detour from it.",
    });
  } else if (currentFatigue === 'tired' && patterns.fatigueTrend === 'accumulating') {
    insights.push({
      id: 'fatigue_accumulating',
      type: 'observation',
      message: "Fatigue has been building this week. A lighter session next time could help.",
    });
  } else if (currentFatigue === 'fresh' && patterns.fatigueTrend === 'recovering') {
    insights.push({
      id: 'fatigue_recovering',
      type: 'encouragement',
      message: "Energy levels are bouncing back. Your recovery approach is working.",
    });
  }

  if (currentConfidence >= 8 && patterns.avgConfidenceLast7Days >= 6) {
    insights.push({
      id: 'confidence_high',
      type: 'encouragement',
      message: "Confidence has been solid. Trust builds with each session.",
    });
  } else if (currentConfidence <= 3 && patterns.lowConfidenceDaysRecent >= 2) {
    insights.push({
      id: 'confidence_low',
      type: 'learning',
      message: "Confidence takes time to build back. Showing up matters more than perfection.",
    });
  }

  if (patterns.consecutiveWorkouts >= 3) {
    insights.push({
      id: 'consistency',
      type: 'encouragement',
      message: `${patterns.consecutiveWorkouts} sessions in a row. Consistency is the real progress.`,
    });
  }

  if (patterns.workoutsThisWeek >= 4 && patterns.avgPainLast7Days <= 4) {
    insights.push({
      id: 'good_week',
      type: 'encouragement',
      message: "Strong week with manageable load. Your body is responding well.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'default',
      type: 'observation',
      message: "Session logged. We're learning your patterns together.",
    });
  }

  return insights.slice(0, 2);
}

export function getVolumeAdjustmentExplanation(
  patterns: WorkoutPatterns,
  currentPain: number,
  currentFatigue: FatigueLevel
): string | null {
  if (currentPain >= 6 || currentFatigue === 'exhausted') {
    return "Volume was kept steady today because recovery signals were mixed.";
  }
  
  if (patterns.fatigueTrend === 'accumulating' && patterns.highPainDaysRecent >= 1) {
    return "We adjusted intensity based on recent fatigue and pain patterns.";
  }

  if (patterns.recentPainTrend === 'worsening') {
    return "Load was managed conservatively — your recent pain trend suggests caution.";
  }

  return null;
}
