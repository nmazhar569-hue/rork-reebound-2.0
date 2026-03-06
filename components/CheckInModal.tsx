import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Activity, Zap, Brain } from 'lucide-react-native';
import { liquidGlass, glassStyles, glassShadows } from '@/constants/liquidGlass';

const { width } = Dimensions.get('window');

interface CheckInModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { energy: number; soreness: number; stress: number }) => void;
}

export function CheckInModal({ visible, onClose, onSubmit }: CheckInModalProps) {
    const [energy, setEnergy] = useState(5);
    const [soreness, setSoreness] = useState(3);
    const [stress, setStress] = useState(3);
    const [step, setStep] = useState(0); // 0: Energy, 1: Soreness, 2: Stress, 3: Summary

    const steps = [
        { id: 'energy', label: 'Energy Level', icon: Zap, min: 1, max: 10, val: energy, set: setEnergy, desc: '1 = Exhausted, 10 = Charged' },
        { id: 'soreness', label: 'Muscle Soreness', icon: Activity, min: 1, max: 10, val: soreness, set: setSoreness, desc: '1 = Fresh, 10 = Can\'t Move' },
        { id: 'stress', label: 'Mental Stress', icon: Brain, min: 1, max: 10, val: stress, set: setStress, desc: '1 = Zen, 10 = Overwhelmed' },
    ];

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            onSubmit({ energy, soreness, stress });
            // Keep modal open for summary or close it? 
            // Requirement: "Output: After check-in, provide an 'Executive Summary'"
            // For now, we'll let the parent handle the summary view or close.
            onClose();
        }
    };

    const currentStep = steps[step];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.contentContainer}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={liquidGlass.text.secondary} />
                    </TouchableOpacity>

                    <View style={styles.stepIndicator}>
                        {steps.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.stepDot,
                                    i === step && styles.stepDotActive,
                                    i < step && styles.stepDotCompleted
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.questionContainer}>
                        <currentStep.icon size={48} color={liquidGlass.accent.primary} style={styles.icon} />
                        <Text style={styles.label}>{currentStep.label}</Text>
                        <Text style={styles.description}>{currentStep.desc}</Text>

                        <View style={styles.sliderContainer}>
                            <TouchableOpacity
                                style={styles.adjustBtn}
                                onPress={() => currentStep.set(Math.max(currentStep.min, currentStep.val - 1))}
                            >
                                <Text style={styles.adjustBtnText}>-</Text>
                            </TouchableOpacity>

                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{currentStep.val}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.adjustBtn}
                                onPress={() => currentStep.set(Math.min(currentStep.max, currentStep.val + 1))}
                            >
                                <Text style={styles.adjustBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <LinearGradient
                            colors={liquidGlass.gradients.button}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.nextBtnText}>
                                {step === 2 ? 'Complete Check-In' : 'Next'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    contentContainer: {
        width: width - 40,
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        padding: 24,
        alignItems: 'center',
        ...glassShadows.glow,
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 40,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: liquidGlass.surface.glassLight,
    },
    stepDotActive: {
        backgroundColor: liquidGlass.accent.primary,
        width: 24,
    },
    stepDotCompleted: {
        backgroundColor: liquidGlass.accent.primary,
    },
    questionContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    icon: {
        marginBottom: 20,
        ...glassShadows.glow,
    },
    label: {
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: liquidGlass.text.tertiary,
        marginBottom: 32,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    adjustBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        alignItems: 'center',
        justifyContent: 'center',
    },
    adjustBtnText: {
        fontSize: 28,
        color: liquidGlass.text.primary,
        lineHeight: 32,
    },
    valueContainer: {
        width: 80,
        alignItems: 'center',
    },
    valueText: {
        fontSize: 64,
        fontWeight: '800',
        color: liquidGlass.accent.primary,
        textShadowColor: liquidGlass.accent.glow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    nextBtn: {
        width: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        ...glassShadows.glow,
    },
    gradientBtn: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    nextBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.inverse,
    },
});
