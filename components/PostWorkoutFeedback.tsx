import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { CheckCircle, Sparkles, Battery, BatteryLow, BatteryMedium, BatteryFull, MessageCircle } from 'lucide-react-native';
import { Card, SolidButton } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { FatigueLevel, DailyLog } from '@/types';
import { analyzeWorkoutPatterns, generateReeInsights, getVolumeAdjustmentExplanation, PatternInsight } from '@/utils/postWorkoutPatterns';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface PostWorkoutFeedbackProps {
  workoutTitle: string;
  workoutId?: string;
  exercisesCompleted: number;
  totalExercises: number;
  onComplete: (log: Omit<DailyLog, 'date'>) => void;
}

const PAIN_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const CONFIDENCE_OPTIONS = [
  { val: 1, emoji: '😟', label: 'Low' },
  { val: 5, emoji: '😐', label: 'Okay' },
  { val: 8, emoji: '😊', label: 'Good' },
  { val: 10, emoji: '😄', label: 'Great' },
] as const;

const FATIGUE_OPTIONS: { val: FatigueLevel; icon: typeof Battery; label: string; color: string }[] = [
  { val: 'fresh', icon: BatteryFull, label: 'Fresh', color: colors.success },
  { val: 'normal', icon: BatteryMedium, label: 'Normal', color: colors.primary },
  { val: 'tired', icon: BatteryLow, label: 'Tired', color: colors.warning },
  { val: 'exhausted', icon: Battery, label: 'Drained', color: colors.danger },
];

export function PostWorkoutFeedback({
  workoutTitle,
  workoutId,
  exercisesCompleted,
  totalExercises,
  onComplete,
}: PostWorkoutFeedbackProps) {
  const { dailyLogs } = useApp();
  const [painLevel, setPainLevel] = useState(3);
  const [confidenceLevel, setConfidenceLevel] = useState(8);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('normal');
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [volumeExplanation, setVolumeExplanation] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const insightFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (showInsights) {
      Animated.timing(insightFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [showInsights, insightFade]);

  const handlePainSelect = (level: number) => {
    setPainLevel(level);
    Haptics.selectionAsync();
  };

  const handleConfidenceSelect = (level: number) => {
    setConfidenceLevel(level);
    Haptics.selectionAsync();
  };

  const handleFatigueSelect = (level: FatigueLevel) => {
    setFatigueLevel(level);
    Haptics.selectionAsync();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const patterns = analyzeWorkoutPatterns(dailyLogs);
    const generatedInsights = generateReeInsights(patterns, painLevel, confidenceLevel, fatigueLevel);
    const explanation = getVolumeAdjustmentExplanation(patterns, painLevel, fatigueLevel);
    
    setInsights(generatedInsights);
    setVolumeExplanation(explanation);
    setShowInsights(true);
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete({
      workoutCompleted: true,
      painLevel,
      confidenceLevel,
      fatigueLevel,
      workoutId,
      exercisesCompleted,
      totalExercises,
      notes: `Completed ${workoutTitle}`,
    });
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return colors.success;
    if (level <= 5) return colors.primary;
    if (level <= 7) return colors.warning;
    return colors.danger;
  };

  if (showInsights) {
    return (
      <Animated.View style={[styles.container, { opacity: insightFade }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.completeHeader}>
            <View style={styles.iconCircle}>
              <CheckCircle size={48} color={colors.primary} />
            </View>
            <Text style={styles.completeTitle}>That was enough.</Text>
            <Text style={styles.completeSubtitle}>You showed up for yourself today.</Text>
          </View>

          {insights.length > 0 && (
            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={styles.reeAvatar}>
                  <Sparkles size={18} color={colors.primary} />
                </View>
                <Text style={styles.insightHeaderText}>Ree&apos;s reflection</Text>
              </View>

              {insights.map((insight, index) => (
                <View key={insight.id} style={[styles.insightItem, index > 0 && styles.insightItemBorder]}>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                  {insight.context && (
                    <Text style={styles.insightContext}>{insight.context}</Text>
                  )}
                </View>
              ))}

              {volumeExplanation && (
                <View style={styles.volumeExplanation}>
                  <MessageCircle size={14} color={colors.textTertiary} />
                  <Text style={styles.volumeExplanationText}>{volumeExplanation}</Text>
                </View>
              )}
            </Card>
          )}

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pain</Text>
              <Text style={[styles.summaryValue, { color: getPainColor(painLevel) }]}>{painLevel}/10</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Confidence</Text>
              <Text style={styles.summaryValue}>{CONFIDENCE_OPTIONS.find(o => o.val === confidenceLevel)?.emoji}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Energy</Text>
              <Text style={[styles.summaryValue, { color: FATIGUE_OPTIONS.find(o => o.val === fatigueLevel)?.color }]}>
                {FATIGUE_OPTIONS.find(o => o.val === fatigueLevel)?.label}
              </Text>
            </View>
          </View>

          <SolidButton label="DONE" onPress={handleFinish} />
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.completeHeader}>
          <View style={styles.iconCircle}>
            <CheckCircle size={48} color={colors.primary} />
          </View>
          <Text style={styles.completeTitle}>Session complete</Text>
          <Text style={styles.completeSubtitle}>Quick check-in to help us learn together.</Text>
        </View>

        <Card style={styles.checkInCard}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>How does your knee feel?</Text>
            <View style={styles.painScale}>
              {PAIN_SCALE.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.painButton,
                    painLevel === num && [styles.painButtonSelected, { backgroundColor: getPainColor(num) }],
                  ]}
                  onPress={() => handlePainSelect(num)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.painButtonText,
                      painLevel === num && styles.painButtonTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabelText}>No pain</Text>
              <Text style={styles.scaleLabelText}>Severe</Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>How do you feel about today?</Text>
            <View style={styles.confidenceContainer}>
              {CONFIDENCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  style={[
                    styles.confidenceButton,
                    confidenceLevel === opt.val && styles.confidenceButtonSelected,
                  ]}
                  onPress={() => handleConfidenceSelect(opt.val)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confidenceEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.confidenceLabel,
                      confidenceLevel === opt.val && styles.confidenceLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Energy level?</Text>
            <View style={styles.fatigueContainer}>
              {FATIGUE_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = fatigueLevel === opt.val;
                return (
                  <TouchableOpacity
                    key={opt.val}
                    style={[
                      styles.fatigueButton,
                      isSelected && [styles.fatigueButtonSelected, { borderColor: opt.color }],
                    ]}
                    onPress={() => handleFatigueSelect(opt.val)}
                    activeOpacity={0.7}
                  >
                    <IconComponent 
                      size={24} 
                      color={isSelected ? opt.color : colors.textSecondary} 
                    />
                    <Text
                      style={[
                        styles.fatigueLabel,
                        isSelected && [styles.fatigueLabelSelected, { color: opt.color }],
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        <SolidButton label="CONTINUE" onPress={handleContinue} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  completeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  checkInCard: {
    borderRadius: 28,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  painScale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  painButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  painButtonSelected: {
    borderColor: 'transparent',
  },
  painButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  painButtonTextSelected: {
    color: colors.surface,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  scaleLabelText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confidenceButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  confidenceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  confidenceEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  confidenceLabelSelected: {
    color: colors.primary,
    fontWeight: '700' as const,
  },
  fatigueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fatigueButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    gap: 6,
  },
  fatigueButtonSelected: {
    backgroundColor: colors.surface,
  },
  fatigueLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  fatigueLabelSelected: {
    fontWeight: '700' as const,
  },
  insightCard: {
    borderRadius: 28,
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  reeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightHeaderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  insightItem: {
    paddingVertical: 12,
  },
  insightItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 4,
  },
  insightMessage: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  insightContext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  volumeExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  volumeExplanationText: {
    flex: 1,
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
});
