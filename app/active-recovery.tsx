import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, SkipForward, CheckCircle, Plus, ChevronLeft, ChevronRight, Award, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { recoveryRoutines } from '@/constants/workoutTemplates';
import { useApp } from '@/contexts/AppContext';
import { PainSlider } from '@/components/PainSlider';
import { storageService } from '@/services/StorageService';
import { RecoverySession } from '@/types';

const { width } = Dimensions.get('window');

const RECOVERY_ORANGE = '#FF7A50';
const RECOVERY_ORANGE_MUTED = 'rgba(255, 122, 80, 0.15)';
const RECOVERY_ORANGE_GLOW = 'rgba(255, 122, 80, 0.3)';
const SUCCESS_GREEN = '#4ADE80';

const formatTime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const generateId = (): string => {
  return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function ActiveRecoveryScreen() {
  const router = useRouter();
  const { routineId, painLevelBefore: painBeforeParam } = useLocalSearchParams<{ 
    routineId?: string;
    painLevelBefore?: string;
  }>();
  const { logWorkout, getTodayLog, getTodayReadiness } = useApp();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [painLevelAfter, setPainLevelAfter] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  
  const startTime = useRef<Date>(new Date());
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const painLevelBefore = useMemo(() => {
    if (painBeforeParam) {
      return parseInt(painBeforeParam, 10);
    }
    const todayReadiness = getTodayReadiness();
    return todayReadiness?.painLevel || 5;
  }, [painBeforeParam, getTodayReadiness]);

  const routine = useMemo(() => {
    if (routineId) {
      return recoveryRoutines.find(r => r.id === routineId);
    }
    return recoveryRoutines[0];
  }, [routineId]);

  const steps = useMemo(() => {
    if (!routine) return [];
    return routine.steps.map(step => ({
      id: step.id,
      name: step.instruction.split('.')[0] || step.instruction,
      duration: step.duration,
      notes: step.instruction,
    }));
  }, [routine]);

  const currentExercise = steps[currentIndex];
  const progress = steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  useEffect(() => {
    if (currentExercise) {
      setTimeLeft(currentExercise.duration);
      setIsActive(false);
    }
  }, [currentIndex, currentExercise]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsActive(false);
            return 0;
          }
          if (t === 10 || t === 5 || t === 3) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (showCompletionModal) {
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showCompletionModal, modalOpacity]);

  const handleToggleTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timeLeft === 0) {
      setTimeLeft(currentExercise?.duration || 30);
    }
    setIsActive(!isActive);
  }, [isActive, timeLeft, currentExercise]);

  const handleAddTime = useCallback(() => {
    Haptics.selectionAsync();
    setTimeLeft(t => t + 10);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!completedSteps.includes(currentIndex)) {
      setCompletedSteps(prev => [...prev, currentIndex]);
    }

    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCompletionModal(true);
    }
  }, [currentIndex, steps.length, completedSteps]);

  const handleSaveAndFinish = useCallback(async () => {
    if (isSaving || !routine) return;
    
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.current.getTime()) / 60000);

      const recoverySession: RecoverySession = {
        id: generateId(),
        date: new Date().toISOString().split('T')[0],
        routineId: routine.id,
        routineName: routine.title,
        durationMinutes: Math.max(1, durationMinutes),
        painLevelBefore,
        painLevelAfter,
        completedSteps: completedSteps.length + 1,
        totalSteps: steps.length,
        completedAt: endTime.toISOString(),
      };

      await storageService.saveRecoverySession(recoverySession);
      console.log('[ActiveRecovery] Session saved:', recoverySession);

      const todayLog = getTodayLog();
      await logWorkout({
        date: new Date().toISOString().split('T')[0],
        workoutCompleted: false,
        recoveryCompleted: true,
        painLevel: painLevelAfter,
        confidenceLevel: todayLog?.confidenceLevel || 0,
        notes: `Completed ${routine.title}. Pain: ${painLevelBefore} → ${painLevelAfter}`,
      });

      router.back();
    } catch (error) {
      console.error('[ActiveRecovery] Error saving session:', error);
      setIsSaving(false);
    }
  }, [isSaving, routine, painLevelBefore, painLevelAfter, completedSteps, steps.length, getTodayLog, logWorkout, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const painImprovement = painLevelBefore - painLevelAfter;
  const isPainImproved = painImprovement > 0;

  if (!routine || steps.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#2A1005', '#0A1A1F']} style={StyleSheet.absoluteFill} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Routine not found</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={handleClose}>
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#2A1005', '#150A05', '#0A1A1F']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.visualContainer}>
        <View style={styles.progressRing}>
          <View style={[styles.progressRingInner, { opacity: isActive ? 1 : 0.6 }]}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerLabel}>{isActive ? 'In Progress' : timeLeft === 0 ? 'Complete' : 'Ready'}</Text>
          </View>
        </View>
        
        <View style={styles.stepIndicators}>
          {steps.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.stepDot,
                completedSteps.includes(idx) && styles.stepDotCompleted,
                idx === currentIndex && styles.stepDotActive,
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.controlsLayer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.stepText}>STEP {currentIndex + 1} / {steps.length}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseInfo}>
          <Text style={styles.routineName}>{routine.title}</Text>
          <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
          <Text style={styles.cueText}>{currentExercise?.notes}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.topButtonRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddTime}>
              <Plus size={18} color={RECOVERY_ORANGE} />
              <Text style={styles.btnTextSec}>+10s</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.timerToggleBtn} onPress={handleToggleTimer}>
              <LinearGradient colors={[RECOVERY_ORANGE, '#E55A30']} style={styles.timerToggleGradient}>
                <Text style={styles.btnTextPrim}>{isActive ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Start'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.navButtonRow}>
            <TouchableOpacity 
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]} 
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={24} color={currentIndex === 0 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <LinearGradient colors={[RECOVERY_ORANGE, '#E55A30']} style={styles.primaryBtnGradient}>
                {currentIndex === steps.length - 1 ? (
                  <>
                    <CheckCircle size={20} color="#FFF" />
                    <Text style={styles.btnTextPrim}>Finish</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.btnTextPrim}>Next</Text>
                    <SkipForward size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navBtn, currentIndex === steps.length - 1 && styles.navBtnDisabled]} 
              onPress={handleNext}
              disabled={currentIndex === steps.length - 1}
            >
              <ChevronRight size={24} color={currentIndex === steps.length - 1 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showCompletionModal}
        transparent
        animationType="none"
        onRequestClose={() => {}}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.awardCircle}>
                  <Award size={40} color={SUCCESS_GREEN} />
                </View>
                <Text style={styles.modalTitle}>Routine Complete!</Text>
                <Text style={styles.modalSubtitle}>{routine.title}</Text>
              </View>

              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{completedSteps.length + 1}/{steps.length}</Text>
                  <Text style={styles.statLabel}>Steps Done</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{routine.duration}m</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              </View>

              <View style={styles.painSection}>
                <Text style={styles.painSectionTitle}>How do you feel now?</Text>
                <Text style={styles.painSectionSubtitle}>
                  Started at pain level {painLevelBefore}
                </Text>
                <PainSlider 
                  initialValue={painLevelAfter} 
                  onValueChange={setPainLevelAfter} 
                />
              </View>

              {painLevelAfter !== painLevelBefore && (
                <View style={[
                  styles.improvementBanner,
                  { backgroundColor: isPainImproved ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)' }
                ]}>
                  {isPainImproved ? (
                    <TrendingDown size={20} color={SUCCESS_GREEN} />
                  ) : (
                    <TrendingUp size={20} color="#FBB724" />
                  )}
                  <Text style={[
                    styles.improvementText,
                    { color: isPainImproved ? SUCCESS_GREEN : '#FBB724' }
                  ]}>
                    {isPainImproved 
                      ? `Pain reduced by ${painImprovement} points!` 
                      : `Pain increased by ${Math.abs(painImprovement)} points`}
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                onPress={handleSaveAndFinish}
                disabled={isSaving}
              >
                <LinearGradient 
                  colors={[SUCCESS_GREEN, '#22C55E']} 
                  style={styles.saveButtonGradient}
                >
                  <CheckCircle size={20} color="#FFF" />
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save & Finish'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A1A1F',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  emptyText: {
    color: liquidGlass.text.secondary,
    fontSize: 16,
  },
  backButtonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: RECOVERY_ORANGE_MUTED,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: RECOVERY_ORANGE_GLOW,
  },
  backButtonLargeText: {
    color: RECOVERY_ORANGE,
    fontWeight: '600' as const,
  },
  visualContainer: { 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 60,
  },
  progressRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: RECOVERY_ORANGE_MUTED,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: RECOVERY_ORANGE_GLOW,
    ...glassShadows.glow,
    shadowColor: RECOVERY_ORANGE,
  },
  progressRingInner: {
    alignItems: 'center',
  },
  timerText: { 
    fontSize: 56, 
    fontWeight: '200' as const, 
    color: RECOVERY_ORANGE, 
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginTop: 8,
  },
  stepIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotCompleted: {
    backgroundColor: RECOVERY_ORANGE,
  },
  stepDotActive: {
    backgroundColor: RECOVERY_ORANGE,
    transform: [{ scale: 1.3 }],
  },

  controlsLayer: { 
    backgroundColor: liquidGlass.surface.card,
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: RECOVERY_ORANGE_GLOW,
    borderBottomWidth: 0,
    ...glassShadows.medium,
  },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  stepText: { 
    color: 'rgba(255,255,255,0.5)', 
    textTransform: 'uppercase' as const, 
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RECOVERY_ORANGE,
    borderRadius: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  exerciseInfo: {
    marginBottom: 24,
  },
  routineName: {
    color: RECOVERY_ORANGE,
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  exerciseName: { 
    color: '#FFF', 
    fontSize: 26, 
    fontWeight: '700' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cueText: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 15, 
    lineHeight: 22,
  },
  
  buttonContainer: {
    gap: 12,
  },
  topButtonRow: { 
    flexDirection: 'row', 
    gap: 12,
  },
  secondaryBtn: { 
    flex: 1, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: RECOVERY_ORANGE_MUTED, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: RECOVERY_ORANGE_GLOW,
  },
  timerToggleBtn: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  timerToggleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  navButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtn: { 
    flex: 1, 
    height: 56, 
    borderRadius: 28, 
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    flex: 1,
    flexDirection: 'row', 
    gap: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 28,
  },
  btnTextSec: { 
    color: RECOVERY_ORANGE, 
    fontWeight: '600' as const,
    fontSize: 15,
  },
  btnTextPrim: { 
    color: '#FFF', 
    fontWeight: '700' as const, 
    fontSize: 17,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: width - 40,
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 28,
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  awardCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  painSection: {
    marginBottom: 20,
  },
  painSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  painSectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  improvementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
