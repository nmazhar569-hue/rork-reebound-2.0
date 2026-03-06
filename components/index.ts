/**
 * Reebound Components Index
 * 
 * Central export for all custom components used in the app.
 */

// ============================================================================
// UI COMPONENTS (Liquid Glass Design System)
// ============================================================================

export { GlassCard, liquidGlassTokens } from './ui/GlassCard';
export { VoidBackground } from './ui/VoidBackground';

// ============================================================================
// HOME PAGE COMPONENTS
// ============================================================================

export { DynamicStatusPanel } from './DynamicStatusPanel';
export type { PanelContext } from './DynamicStatusPanel';

export { ReeButton } from './ReeButton';

export { QuickActions } from './QuickActions';

// ============================================================================
// REE ANALYSIS COMPONENTS
// ============================================================================

export { ReeCheckInModal } from './ReeCheckInModal';

export { ReeProcessingAnimation } from './ReeProcessingAnimation';

export { ReeAnalysisOutput, placeholderAnalysis } from './ReeAnalysisOutput';
export type { AnalysisData } from './ReeAnalysisOutput';

export { ReeAnalysisModal } from './ReeAnalysisModal';

// ============================================================================
// WORKOUT PLANNING COMPONENTS
// ============================================================================

export { WeeklyCalendar, generateWeekDays } from './WeeklyCalendar';
export type { DayPlan } from './WeeklyCalendar';

export { WorkoutBuilder } from './WorkoutBuilder';
export type { WorkoutDraft, ExerciseSelection } from './WorkoutBuilder';

// ============================================================================
// IN-WORKOUT COMPONENTS
// ============================================================================

export { RestTimer } from './RestTimer';

export { ReeFeedbackToast, generateSetFeedback, generateExerciseFeedback } from './ReeFeedbackToast';
export type { FeedbackType } from './ReeFeedbackToast';

export { WorkoutSummary, generatePostWorkoutAnalysis } from './WorkoutSummary';

// ============================================================================
// PROGRESS COMPONENTS
// ============================================================================

export {
    ProgressDashboard,
    placeholderGoal,
    placeholderPositiveInsights,
    placeholderImprovementInsight
} from './ProgressDashboard';
export type { UserGoal, Insight } from './ProgressDashboard';

export { StrengthChart, placeholderChartData } from './StrengthChart';

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

export { GlassTabBar } from './GlassTabBar';

// ============================================================================
// AI CHAT INTERFACE
// ============================================================================

export { ReeChat } from './ReeChat';

// ============================================================================
// EXISTING COMPONENTS (re-export for convenience)
// ============================================================================

export { ReeFloatingButton } from './ReeFloatingButton';
export { RecoveryInbox } from './RecoveryInbox';
