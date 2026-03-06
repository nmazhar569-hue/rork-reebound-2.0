import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
    ChevronRight,
    ChevronLeft,
    User,
    Heart,
    Zap,
    Sun,
    Moon,
    Cloud,
    Flame,
    Shield,
    Calendar,
    Check,
} from 'lucide-react-native';
import { haptics } from '@/utils/haptics';
import { useApp } from '@/contexts/AppContext';

/**
 * Gap Analysis Onboarding Flow
 * 
 * Step 1: The Basics (Name, Age, Gender)
 * Step 2: Gap Analysis (How you feel now vs want to feel)
 * Step 3: Reality Check (Busy days, Sleep)
 * Step 4: Initial Feedback (AI-generated starting point)
 */

const TEAL = '#00D9B8';

// Current state options
const CURRENT_STATES = [
    { id: 'sluggish', label: 'Sluggish', icon: Cloud, color: '#64748b' },
    { id: 'injured', label: 'Injured', icon: Shield, color: '#f87171' },
    { id: 'stressed', label: 'Stressed', icon: Flame, color: '#fb923c' },
    { id: 'okay', label: 'Okay', icon: Sun, color: '#fbbf24' },
    { id: 'great', label: 'Great', icon: Zap, color: '#22c55e' },
];

// Goal states
const GOAL_STATES = [
    { id: 'powerful', label: 'Powerful', description: 'Strength & confidence', icon: Zap, color: '#2dd4bf' },
    { id: 'pain_free', label: 'Pain-Free', description: 'Move without limits', icon: Shield, color: '#22c55e' },
    { id: 'energized', label: 'Energized', description: 'All-day vitality', icon: Sun, color: '#fbbf24' },
    { id: 'calm', label: 'Calm', description: 'Mental clarity', icon: Moon, color: '#818cf8' },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLEEP_OPTIONS = [
    { id: 'under5', label: '<5h', value: 4, risk: 'high' },
    { id: '6h', label: '~6h', value: 6, risk: 'medium' },
    { id: '7h', label: '~7h', value: 7, risk: 'low' },
    { id: '8plus', label: '8h+', value: 8, risk: 'optimal' },
];

interface OnboardingData {
    name: string;
    age: string;
    gender: 'male' | 'female' | 'other' | null;
    currentState: string | null;
    goalState: string | null;
    busyDays: string[];
    sleepAverage: string | null;
    calendarAccess: boolean;
}

export default function GapAnalysisOnboarding() {
    const { completeOnboarding } = useApp();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        name: '',
        age: '',
        gender: null,
        currentState: null,
        goalState: null,
        busyDays: [],
        sleepAverage: null,
        calendarAccess: false,
    });

    // Step 1: The Basics
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Let's Get Started</Text>
            <Text style={styles.stepSubtitle}>Tell me a bit about yourself</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What should I call you?</Text>
                <TextInput
                    style={styles.textInput}
                    value={data.name}
                    onChangeText={(text) => setData(prev => ({ ...prev, name: text }))}
                    placeholder="Your name"
                    placeholderTextColor="#64748b"
                    autoCapitalize="words"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>How old are you?</Text>
                <TextInput
                    style={styles.textInput}
                    value={data.age}
                    onChangeText={(text) => setData(prev => ({ ...prev, age: text.replace(/[^0-9]/g, '') }))}
                    placeholder="Age"
                    placeholderTextColor="#64748b"
                    keyboardType="number-pad"
                    maxLength={2}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Biological sex (for recovery optimization)</Text>
                <View style={styles.genderOptions}>
                    {[
                        { id: 'male', label: 'Male' },
                        { id: 'female', label: 'Female' },
                        { id: 'other', label: 'Other' },
                    ].map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.genderButton,
                                data.gender === option.id && styles.genderButtonActive,
                            ]}
                            onPress={() => {
                                haptics.soft();
                                setData(prev => ({ ...prev, gender: option.id as any }));
                            }}
                        >
                            <Text style={[
                                styles.genderButtonText,
                                data.gender === option.id && styles.genderButtonTextActive,
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    // Step 2: Gap Analysis
    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.gapSection}>
                <Text style={styles.stepTitle}>How do you feel right now?</Text>
                <Text style={styles.stepSubtitle}>Be honest—this helps me help you</Text>

                <View style={styles.stateGrid}>
                    {CURRENT_STATES.map((state) => {
                        const Icon = state.icon;
                        const isSelected = data.currentState === state.id;
                        return (
                            <TouchableOpacity
                                key={state.id}
                                style={[
                                    styles.stateCard,
                                    isSelected && { borderColor: state.color, backgroundColor: state.color + '15' },
                                ]}
                                onPress={() => {
                                    haptics.medium();
                                    setData(prev => ({ ...prev, currentState: state.id }));
                                }}
                            >
                                <Icon size={32} color={isSelected ? state.color : '#64748b'} />
                                <Text style={[
                                    styles.stateLabel,
                                    isSelected && { color: state.color },
                                ]}>
                                    {state.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {data.currentState && (
                <View style={styles.gapSection}>
                    <Text style={styles.stepTitle}>How do you want to feel?</Text>
                    <Text style={styles.stepSubtitle}>This is your target</Text>

                    <View style={styles.goalGrid}>
                        {GOAL_STATES.map((goal) => {
                            const Icon = goal.icon;
                            const isSelected = data.goalState === goal.id;
                            return (
                                <TouchableOpacity
                                    key={goal.id}
                                    style={[
                                        styles.goalCard,
                                        isSelected && { borderColor: goal.color, backgroundColor: goal.color + '15' },
                                    ]}
                                    onPress={() => {
                                        haptics.medium();
                                        setData(prev => ({ ...prev, goalState: goal.id }));
                                    }}
                                >
                                    <Icon size={28} color={isSelected ? goal.color : '#64748b'} />
                                    <Text style={[
                                        styles.goalLabel,
                                        isSelected && { color: goal.color },
                                    ]}>
                                        {goal.label}
                                    </Text>
                                    <Text style={styles.goalDescription}>{goal.description}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );

    // Step 3: Reality Check
    const renderStep3 = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Let's Look at Your Week</Text>
            <Text style={styles.stepSubtitle}>I'll schedule around your real life</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Which days are busiest?</Text>
                <Text style={styles.inputHint}>Select all that apply</Text>
                <View style={styles.daysRow}>
                    {DAYS_OF_WEEK.map((day) => {
                        const isSelected = data.busyDays.includes(day);
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayChip,
                                    isSelected && styles.dayChipActive,
                                ]}
                                onPress={() => {
                                    haptics.light();
                                    setData(prev => ({
                                        ...prev,
                                        busyDays: isSelected
                                            ? prev.busyDays.filter(d => d !== day)
                                            : [...prev.busyDays, day],
                                    }));
                                }}
                            >
                                <Text style={[
                                    styles.dayChipText,
                                    isSelected && styles.dayChipTextActive,
                                ]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Average sleep per night?</Text>
                <View style={styles.sleepOptions}>
                    {SLEEP_OPTIONS.map((option) => {
                        const isSelected = data.sleepAverage === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.sleepOption,
                                    isSelected && styles.sleepOptionActive,
                                ]}
                                onPress={() => {
                                    haptics.soft();
                                    setData(prev => ({ ...prev, sleepAverage: option.id }));
                                }}
                            >
                                <Text style={[
                                    styles.sleepOptionText,
                                    isSelected && styles.sleepOptionTextActive,
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Connect your calendar?</Text>
                <Text style={styles.inputHint}>I'll avoid scheduling workouts during busy times</Text>
                <TouchableOpacity
                    style={[
                        styles.calendarToggle,
                        data.calendarAccess && styles.calendarToggleActive,
                    ]}
                    onPress={() => {
                        haptics.medium();
                        setData(prev => ({ ...prev, calendarAccess: !prev.calendarAccess }));
                    }}
                >
                    <Calendar size={24} color={data.calendarAccess ? TEAL : '#64748b'} />
                    <Text style={[
                        styles.calendarToggleText,
                        data.calendarAccess && styles.calendarToggleTextActive,
                    ]}>
                        {data.calendarAccess ? 'Calendar Connected' : 'Connect Calendar'}
                    </Text>
                    {data.calendarAccess && <Check size={20} color={TEAL} />}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // Step 4: Initial Feedback
    const generateFeedback = useMemo(() => {
        const currentState = CURRENT_STATES.find(s => s.id === data.currentState);
        const goalState = GOAL_STATES.find(g => g.id === data.goalState);
        const sleepOption = SLEEP_OPTIONS.find(s => s.id === data.sleepAverage);

        let approach = '';
        let weekOneFocus = '';
        let volumeAdjustment = '';

        // Determine approach based on gap
        if (data.currentState === 'stressed' || data.currentState === 'sluggish') {
            if (data.goalState === 'powerful') {
                approach = "You want to feel Powerful, but your body is signaling it needs recovery first.";
                weekOneFocus = "Nervous System Reset";
                volumeAdjustment = "We won't start with heavy lifting.";
            } else if (data.goalState === 'energized') {
                approach = "Energy comes from recovery. Your stress levels indicate we need to build your base first.";
                weekOneFocus = "Movement & Mobility";
                volumeAdjustment = "Light movement to restore your energy systems.";
            }
        } else if (data.currentState === 'injured') {
            approach = "Pain-free movement is the priority. We'll work around your limitations.";
            weekOneFocus = "Targeted Rehabilitation";
            volumeAdjustment = "Modified exercises to protect your injury.";
        } else {
            approach = `You're starting from a good place. Let's build toward feeling ${goalState?.label.toLowerCase()}.`;
            weekOneFocus = "Foundation Building";
            volumeAdjustment = "Structured progression to your goal.";
        }

        // Sleep adjustment
        if (sleepOption?.risk === 'high') {
            volumeAdjustment += " Due to low sleep, intensity will be reduced by 20%.";
        }

        // Busy days
        const busyCount = data.busyDays.length;
        let scheduleNote = '';
        if (busyCount >= 4) {
            scheduleNote = `With ${busyCount} busy days, we're focusing on quality over quantity.`;
        } else if (busyCount > 0) {
            scheduleNote = `I'll schedule your hardest workouts on your lighter days.`;
        }

        return {
            greeting: `Hey ${data.name || 'there'}! Here's what I see:`,
            approach,
            weekOneFocus,
            volumeAdjustment,
            scheduleNote,
        };
    }, [data]);

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                    <View style={styles.reeAvatar}>
                        <Text style={styles.reeAvatarText}>R</Text>
                    </View>
                    <Text style={styles.feedbackGreeting}>{generateFeedback.greeting}</Text>
                </View>

                <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackApproach}>{generateFeedback.approach}</Text>
                </View>

                <View style={styles.feedbackHighlight}>
                    <Text style={styles.feedbackLabel}>Week 1 Focus</Text>
                    <Text style={styles.feedbackValue}>{generateFeedback.weekOneFocus}</Text>
                </View>

                <View style={styles.feedbackDetail}>
                    <Text style={styles.feedbackNote}>{generateFeedback.volumeAdjustment}</Text>
                </View>

                {generateFeedback.scheduleNote && (
                    <View style={styles.feedbackDetail}>
                        <Calendar size={16} color={TEAL} />
                        <Text style={styles.feedbackNote}>{generateFeedback.scheduleNote}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.readyText}>Ready to start your journey?</Text>
        </View>
    );

    const handleNext = () => {
        haptics.light();
        if (step < 4) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        haptics.soft();
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        haptics.completionWave();

        // Save user profile
        const profile = {
            name: data.name,
            age: parseInt(data.age) || 0,
            biologicalSex: data.gender as any,
            currentState: data.currentState,
            goalState: data.goalState,
            busyDays: data.busyDays,
            sleepAverage: data.sleepAverage,
            calendarAccess: data.calendarAccess,
            onboardingComplete: true,
        };

        console.log('Onboarding complete:', profile);
        // Save to context/storage
        await completeOnboarding(profile as any);

        router.replace('/(tabs)');
    };

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                return data.name.trim().length > 0 && data.age.length > 0 && data.gender !== null;
            case 2:
                return data.currentState !== null && data.goalState !== null;
            case 3:
                return data.sleepAverage !== null;
            case 4:
                return true;
            default:
                return false;
        }
    }, [step, data]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#0F172A', '#020617', '#000000']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Subtle top glow */}
            <View style={styles.topGlow} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    {step > 1 ? (
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <ChevronLeft size={24} color="#E2E8F0" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.backButton} />
                    )}

                    {/* Progress */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <LinearGradient
                                colors={[TEAL, '#00A896']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
                            />
                        </View>
                        <Text style={styles.progressText}>{step}/4</Text>
                    </View>

                    <View style={styles.backButton} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
                        onPress={handleNext}
                        disabled={!canProceed}
                    >
                        <LinearGradient
                            colors={canProceed ? [TEAL, '#00A896'] : ['#334155', '#1E293B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButtonGradient}
                        >
                            <Text style={styles.nextButtonText}>
                                {step === 4 ? "Let's Go" : 'Continue'}
                            </Text>
                            <ChevronRight size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    topGlow: {
        position: 'absolute',
        top: -100,
        left: '25%',
        right: '25%',
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(45, 212, 191, 0.06)',
        transform: [{ scaleX: 2 }],
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
    },
    progressTrack: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#E2E8F0',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 28,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E2E8F0',
        marginBottom: 10,
    },
    inputHint: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 12,
    },
    textInput: {
        height: 56,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 17,
        color: '#E2E8F0',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    genderOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    genderButton: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    genderButtonActive: {
        backgroundColor: TEAL + '20',
        borderColor: TEAL,
    },
    genderButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#94A3B8',
    },
    genderButtonTextActive: {
        color: TEAL,
    },
    gapSection: {
        marginBottom: 32,
    },
    stateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    stateCard: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    stateLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
    goalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    goalCard: {
        width: '48%',
        padding: 18,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 18,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    goalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    goalDescription: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    daysRow: {
        flexDirection: 'row',
        gap: 8,
    },
    dayChip: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dayChipActive: {
        backgroundColor: '#fb923c20',
        borderColor: '#fb923c',
    },
    dayChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    dayChipTextActive: {
        color: '#fb923c',
    },
    sleepOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    sleepOption: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    sleepOptionActive: {
        backgroundColor: TEAL + '20',
        borderColor: TEAL,
    },
    sleepOptionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#94A3B8',
    },
    sleepOptionTextActive: {
        color: TEAL,
    },
    calendarToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 18,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    calendarToggleActive: {
        borderColor: TEAL,
        backgroundColor: TEAL + '15',
    },
    calendarToggleText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#94A3B8',
    },
    calendarToggleTextActive: {
        color: TEAL,
    },
    feedbackCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.2)',
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
    },
    reeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: TEAL,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeAvatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#020617',
    },
    feedbackGreeting: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    feedbackSection: {
        marginBottom: 20,
    },
    feedbackApproach: {
        fontSize: 16,
        lineHeight: 24,
        color: '#CBD5E1',
    },
    feedbackHighlight: {
        backgroundColor: TEAL + '15',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: TEAL + '30',
    },
    feedbackLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: TEAL,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    feedbackValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    feedbackDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    feedbackNote: {
        flex: 1,
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 20,
    },
    readyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
        marginTop: 24,
    },
    footer: {
        padding: 20,
        paddingBottom: 10,
    },
    nextButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: TEAL,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    nextButtonDisabled: {
        shadowOpacity: 0,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});
