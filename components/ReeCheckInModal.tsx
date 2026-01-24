import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Zap, Brain, Heart, Target, ChevronRight } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ReeCheckInModal Component
 * 
 * Full-screen modal for quick check-in before Ree's analysis.
 * 4 questions on single screen with sliders/tap inputs.
 */

interface CheckInData {
    energy: number;      // 1-10
    soreness: 'none' | 'mild' | 'moderate' | 'severe';
    stress: number;      // 1-10
    stressType?: 'situational' | 'ongoing';
    motivation: number;  // 1-10
}

interface ReeCheckInModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: CheckInData) => void;
    onSkip: () => void;
}

export function ReeCheckInModal({
    visible,
    onClose,
    onSubmit,
    onSkip,
}: ReeCheckInModalProps) {
    const [energy, setEnergy] = useState(5);
    const [soreness, setSoreness] = useState<'none' | 'mild' | 'moderate' | 'severe'>('none');
    const [stress, setStress] = useState(5);
    const [stressType, setStressType] = useState<'situational' | 'ongoing' | null>(null);
    const [motivation, setMotivation] = useState(5);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
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

    const handleSubmit = () => {
        haptics.medium();
        onSubmit({
            energy,
            soreness,
            stress,
            stressType: stress >= 7 ? stressType || 'situational' : undefined,
            motivation,
        });
    };

    const handleSliderChange = (setter: (val: number) => void) => (value: number) => {
        setter(Math.round(value));
    };

    const sorenessOptions: Array<{ key: 'none' | 'mild' | 'moderate' | 'severe'; label: string }> = [
        { key: 'none', label: 'None' },
        { key: 'mild', label: 'Mild' },
        { key: 'moderate', label: 'Moderate' },
        { key: 'severe', label: 'Severe' },
    ];

    const getEnergyLabel = (val: number) => {
        if (val <= 3) return 'Low';
        if (val <= 6) return 'Moderate';
        return 'High';
    };

    const getStressLabel = (val: number) => {
        if (val <= 3) return 'Calm';
        if (val <= 6) return 'Moderate';
        return 'High';
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
            </View>

            {/* Modal Content */}
            <Animated.View
                style={[
                    styles.modalContainer,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Glass background */}
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.glassOverlay} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.handle} />
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Quick Check-In</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>Help Ree understand how you're feeling</Text>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentInner}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Question 1: Energy */}
                    <View style={styles.question}>
                        <View style={styles.questionHeader}>
                            <Zap size={20} color={theme.colors.primary} />
                            <Text style={styles.questionTitle}>How's your energy right now?</Text>
                        </View>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Exhausted</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={10}
                                step={1}
                                value={energy}
                                onValueChange={handleSliderChange(setEnergy)}
                                minimumTrackTintColor={theme.colors.primary}
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor={theme.colors.primary}
                            />
                            <Text style={styles.sliderLabel}>Energized</Text>
                        </View>
                        <View style={styles.valueDisplay}>
                            <Text style={styles.valueNumber}>{energy}</Text>
                            <Text style={styles.valueLabel}>{getEnergyLabel(energy)}</Text>
                        </View>
                    </View>

                    {/* Question 2: Soreness */}
                    <View style={styles.question}>
                        <View style={styles.questionHeader}>
                            <Heart size={20} color={theme.colors.secondary} />
                            <Text style={styles.questionTitle}>Any soreness?</Text>
                        </View>
                        <View style={styles.optionsRow}>
                            {sorenessOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[
                                        styles.optionBtn,
                                        soreness === option.key && styles.optionBtnActive,
                                    ]}
                                    onPress={() => {
                                        haptics.selection();
                                        setSoreness(option.key);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            soreness === option.key && styles.optionTextActive,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Question 3: Stress */}
                    <View style={styles.question}>
                        <View style={styles.questionHeader}>
                            <Brain size={20} color={theme.colors.primary} />
                            <Text style={styles.questionTitle}>How's your stress level?</Text>
                        </View>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Calm</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={10}
                                step={1}
                                value={stress}
                                onValueChange={handleSliderChange(setStress)}
                                minimumTrackTintColor={stress >= 7 ? theme.colors.secondary : theme.colors.primary}
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor={stress >= 7 ? theme.colors.secondary : theme.colors.primary}
                            />
                            <Text style={styles.sliderLabel}>Overwhelmed</Text>
                        </View>
                        <View style={styles.valueDisplay}>
                            <Text style={[styles.valueNumber, stress >= 7 && { color: theme.colors.secondary }]}>
                                {stress}
                            </Text>
                            <Text style={styles.valueLabel}>{getStressLabel(stress)}</Text>
                        </View>

                        {/* Follow-up if stress >= 7 */}
                        {stress >= 7 && (
                            <View style={styles.followUp}>
                                <Text style={styles.followUpText}>Is this situational or ongoing?</Text>
                                <View style={styles.optionsRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.optionBtn,
                                            stressType === 'situational' && styles.optionBtnActive,
                                        ]}
                                        onPress={() => setStressType('situational')}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            stressType === 'situational' && styles.optionTextActive,
                                        ]}>Situational</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.optionBtn,
                                            stressType === 'ongoing' && styles.optionBtnActive,
                                        ]}
                                        onPress={() => setStressType('ongoing')}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            stressType === 'ongoing' && styles.optionTextActive,
                                        ]}>Ongoing</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Question 4: Motivation */}
                    <View style={styles.question}>
                        <View style={styles.questionHeader}>
                            <Target size={20} color={theme.colors.primary} />
                            <Text style={styles.questionTitle}>How motivated are you to train?</Text>
                        </View>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>Not at all</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={10}
                                step={1}
                                value={motivation}
                                onValueChange={handleSliderChange(setMotivation)}
                                minimumTrackTintColor={theme.colors.primary}
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor={theme.colors.primary}
                            />
                            <Text style={styles.sliderLabel}>Very</Text>
                        </View>
                        <View style={styles.valueDisplay}>
                            <Text style={styles.valueNumber}>{motivation}</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                        <Text style={styles.skipText}>Skip (use history)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <LinearGradient
                            colors={theme.gradients.tealButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.submitGradient}
                        >
                            <Text style={styles.submitText}>Submit</Text>
                            <ChevronRight size={18} color={theme.colors.textInverse} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 22, 40, 0.5)',
    },
    overlayTouch: {
        flex: 1,
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: SCREEN_HEIGHT * 0.85,
        backgroundColor: 'rgba(15, 29, 50, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        ...glassShadows.deep,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    closeBtn: {
        padding: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        padding: 20,
        gap: 28,
    },
    question: {
        gap: 16,
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    questionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.text,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    sliderLabel: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        width: 70,
        textAlign: 'center',
    },
    valueDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    valueNumber: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    valueLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    optionBtn: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    optionBtnActive: {
        backgroundColor: `${theme.colors.primary}20`,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    optionTextActive: {
        color: theme.colors.primary,
    },
    followUp: {
        marginTop: 12,
        padding: 16,
        backgroundColor: `${theme.colors.secondary}10`,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.secondary}30`,
        gap: 12,
    },
    followUpText: {
        fontSize: 14,
        color: theme.colors.text,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    skipBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    skipText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    submitBtn: {
        flex: 1,
        borderRadius: 50,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 50,
    },
    submitText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
});

export default ReeCheckInModal;
