import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';

import { ReeCheckInModal } from './ReeCheckInModal';
import { ReeProcessingAnimation } from './ReeProcessingAnimation';
import { ReeAnalysisOutput, AnalysisData, placeholderAnalysis } from './ReeAnalysisOutput';
import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ReeAnalysisModal Component
 * 
 * Full Ree analysis experience combining:
 * 1. Check-in questions
 * 2. Processing animation
 * 3. Analysis output
 */

type ModalStep = 'checkin' | 'processing' | 'analysis';

interface CheckInData {
    energy: number;
    soreness: 'none' | 'mild' | 'moderate' | 'severe';
    stress: number;
    stressType?: 'situational' | 'ongoing';
    motivation: number;
}

interface ReeAnalysisModalProps {
    visible: boolean;
    onClose: () => void;
    onActionPress?: () => void;
}

export function ReeAnalysisModal({
    visible,
    onClose,
    onActionPress,
}: ReeAnalysisModalProps) {
    const [step, setStep] = useState<ModalStep>('checkin');
    const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisData>(placeholderAnalysis);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // Reset when modal opens/closes
    useEffect(() => {
        if (visible) {
            setStep('checkin');
            setCheckInData(null);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const handleCheckInSubmit = (data: CheckInData) => {
        setCheckInData(data);
        setStep('processing');

        // Generate analysis based on check-in data
        const generatedAnalysis = generateAnalysis(data);
        setAnalysis(generatedAnalysis);

        // Show processing for 2-3 seconds, then show analysis
        setTimeout(() => {
            setStep('analysis');
        }, 2500);
    };

    const handleSkip = () => {
        setStep('processing');

        // Use historical average (placeholder for now)
        const defaultData: CheckInData = {
            energy: 6,
            soreness: 'mild',
            stress: 5,
            motivation: 6,
        };

        const generatedAnalysis = generateAnalysis(defaultData);
        setAnalysis(generatedAnalysis);

        setTimeout(() => {
            setStep('analysis');
        }, 2000);
    };

    const handleClose = () => {
        onClose();
        // Reset after animation completes
        setTimeout(() => {
            setStep('checkin');
            setCheckInData(null);
        }, 300);
    };

    // Generate analysis based on check-in data (placeholder logic)
    const generateAnalysis = (data: CheckInData): AnalysisData => {
        const isLowEnergy = data.energy <= 4;
        const isHighStress = data.stress >= 7;
        const isLowMotivation = data.motivation <= 4;
        const hasSoreness = data.soreness !== 'none';

        // Customize based on check-in
        if (isLowEnergy || isHighStress) {
            return {
                currentState: {
                    summary: `Based on your check-in, you're experiencing ${isLowEnergy ? 'low energy' : ''}${isLowEnergy && isHighStress ? ' and ' : ''}${isHighStress ? 'elevated stress' : ''}. Your body is signaling it needs support before intense training.`,
                    metrics: {
                        sessionsThisWeek: 3,
                        hrvChange: -8,
                        energyLevel: data.energy <= 3 ? 'Low' : 'Moderate',
                    },
                },
                whatsWorking: [
                    "You're checking in with your body—this awareness is key.",
                    "Your training consistency this month has been excellent.",
                    isLowMotivation ? "Taking time to assess rather than pushing through blindly." : "Your motivation to train shows commitment.",
                ],
                limitations: [
                    isLowEnergy ? "Low energy levels reduce training effectiveness and increase injury risk." : "",
                    isHighStress ? `${data.stressType === 'ongoing' ? 'Chronic' : 'Acute'} stress elevates cortisol, which impairs recovery.` : "",
                    hasSoreness ? `${data.soreness.charAt(0).toUpperCase() + data.soreness.slice(1)} soreness indicates incomplete recovery.` : "",
                ].filter(Boolean),
                recommendation: {
                    action: isHighStress && data.stressType === 'ongoing'
                        ? "Consider 20-min mobility or skip today"
                        : "Swap for active recovery session",
                    details: "Prioritize sleep and stress management. A light mobility session will promote blood flow without adding training stress. Your gains happen during recovery.",
                    priority: 'high',
                },
            };
        }

        if (isLowMotivation && !isLowEnergy) {
            return {
                currentState: {
                    summary: "Your energy is fine but motivation is low. This is often a sign of mental fatigue or overtraining. Sometimes the best workout is the one you almost skipped.",
                    metrics: {
                        sessionsThisWeek: 4,
                        hrvChange: 2,
                        energyLevel: 'Good',
                    },
                },
                whatsWorking: [
                    "Physical readiness is good—your body can handle training.",
                    "HRV is stable, indicating adequate recovery.",
                    "You showed up and checked in despite low motivation.",
                ],
                limitations: [
                    "Mental fatigue can be just as limiting as physical fatigue.",
                    "Low motivation often indicates accumulated training load.",
                ],
                recommendation: {
                    action: "Start with a 5-minute warm-up, then decide",
                    details: "Often motivation follows action. Do a light warm-up and see how you feel. If energy rises, continue with a modified session. If not, no shame in calling it.",
                    priority: 'medium',
                },
            };
        }

        // Good state - ready to train
        return {
            currentState: {
                summary: "You're showing solid readiness indicators. Energy, stress, and motivation are all in good ranges. Your body is primed for productive training.",
                metrics: {
                    sessionsThisWeek: 3,
                    hrvChange: 5,
                    energyLevel: 'Good',
                },
            },
            whatsWorking: [
                "Your energy levels are optimal for training.",
                "Stress is well-managed—recovery capacity is high.",
                "Motivation is strong—use this momentum.",
            ],
            limitations: hasSoreness ? [
                `${data.soreness.charAt(0).toUpperCase() + data.soreness.slice(1)} soreness detected—factor this into exercise selection.`,
            ] : [
                "No significant limitations detected today.",
            ],
            recommendation: {
                action: "Full planned workout is a go",
                details: hasSoreness
                    ? "Proceed with your planned session. Warm up the sore areas thoroughly and consider lighter loads on affected muscle groups."
                    : "Today is a great day to push. Your body and mind are aligned. Make the most of this session.",
                priority: 'low',
            },
        };
    };

    // Render based on step
    if (step === 'checkin') {
        return (
            <ReeCheckInModal
                visible={visible}
                onClose={handleClose}
                onSubmit={handleCheckInSubmit}
                onSkip={handleSkip}
            />
        );
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            {/* Overlay */}
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                {step === 'processing' && (
                    <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} />
                )}
                {step === 'analysis' && (
                    <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} />
                )}
            </View>

            {/* Modal Content */}
            <Animated.View
                style={[
                    styles.modalContainer,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {step === 'processing' && (
                    <View style={styles.processingContainer}>
                        <ReeProcessingAnimation />
                    </View>
                )}

                {step === 'analysis' && (
                    <ReeAnalysisOutput
                        analysis={analysis}
                        onClose={handleClose}
                        onActionPress={onActionPress}
                    />
                )}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 22, 40, 0.6)',
    },
    overlayTouch: {
        flex: 1,
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: SCREEN_HEIGHT * 0.9,
        minHeight: SCREEN_HEIGHT * 0.5,
        backgroundColor: 'rgba(15, 29, 50, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        ...glassShadows.deep,
    },
    processingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
});

export default ReeAnalysisModal;
