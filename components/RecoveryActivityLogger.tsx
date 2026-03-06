
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Clock, Activity, Save, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { RecoveryActivityType } from '@/types/recovery';

interface RecoveryActivityLoggerProps {
    visible: boolean;
    defaultType?: string;
    onClose: () => void;
    onSave: (data: any) => void;
}

export function RecoveryActivityLogger({ visible, defaultType, onClose, onSave }: RecoveryActivityLoggerProps) {
    const insets = useSafeAreaInsets();

    const [type, setType] = useState<RecoveryActivityType>((defaultType as RecoveryActivityType) || 'STRETCHING');
    const [duration, setDuration] = useState(15);
    const [intensity, setIntensity] = useState<'PASSIVE' | 'LIGHT' | 'MODERATE'>('PASSIVE');
    const [areas, setAreas] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    const activities: RecoveryActivityType[] = [
        'MOBILITY', 'LIGHT_CARDIO', 'ACTIVE_RECOVERY', 'STRETCHING', 'YOGA', 'SAUNA_ICE'
    ];

    const bodyAreas = ['Lower Body', 'Upper Body', 'Core/Spine', 'Hips', 'Shoulders'];

    const toggleArea = (area: string) => {
        if (areas.includes(area)) {
            setAreas(areas.filter(a => a !== area));
        } else {
            setAreas([...areas, area]);
        }
    };

    const handleSave = () => {
        onSave({
            type,
            duration,
            intensity,
            areas,
            notes,
            timestamp: new Date().toISOString()
        });
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={[styles.container, { paddingTop: insets.top + 20 }]}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={liquidGlass.text.secondary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Log Recovery</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>

                        {/* Activity Type Selector */}
                        <Text style={styles.label}>ACTIVITY TYPE</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                            {activities.map((act) => (
                                <TouchableOpacity
                                    key={act}
                                    style={[styles.typeChip, type === act && styles.typeChipActive]}
                                    onPress={() => setType(act)}
                                >
                                    <Text style={[styles.typeText, type === act && styles.typeTextActive]}>
                                        {act.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.divider} />

                        {/* Duration Slider (Mock UI for now with +/- buttons) */}
                        <Text style={styles.label}>DURATION: {duration} min</Text>
                        <View style={styles.durationRow}>
                            <TouchableOpacity style={styles.durationBtn} onPress={() => setDuration(Math.max(5, duration - 5))}>
                                <Text style={styles.durationBtnText}>-</Text>
                            </TouchableOpacity>
                            <View style={styles.durationBar}>
                                <View style={[styles.durationFill, { width: `${(duration / 60) * 100}%` }]} />
                            </View>
                            <TouchableOpacity style={styles.durationBtn} onPress={() => setDuration(Math.min(120, duration + 5))}>
                                <Text style={styles.durationBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Intensity */}
                        <Text style={styles.label}>INTENSITY</Text>
                        <View style={styles.intensityRow}>
                            {['PASSIVE', 'LIGHT', 'MODERATE'].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[styles.intensityBtn, intensity === level && styles.intensityBtnActive]}
                                    onPress={() => setIntensity(level as any)}
                                >
                                    <Text style={[styles.intensityText, intensity === level && styles.intensityTextActive]}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        {/* Areas Worked */}
                        <Text style={styles.label}>AREAS WORKED</Text>
                        <View style={styles.areaGrid}>
                            {bodyAreas.map((area) => (
                                <TouchableOpacity
                                    key={area}
                                    style={[styles.areaChip, areas.includes(area) && styles.areaChipActive]}
                                    onPress={() => toggleArea(area)}
                                >
                                    {areas.includes(area) && <CheckCircle size={12} color={liquidGlass.text.inverse} style={{ marginRight: 4 }} />}
                                    <Text style={[styles.areaText, areas.includes(area) && styles.areaTextActive]}>{area}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        {/* Notes */}
                        <Text style={styles.label}>NOTES</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="How did it feel?"
                            placeholderTextColor={liquidGlass.text.tertiary}
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />

                    </ScrollView>

                    {/* Footer Save Button */}
                    <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Save size={20} color={colors.background} />
                            <Text style={styles.saveText}>Save Activity</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    closeBtn: {
        padding: 8,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 20,
    },
    title: {
        color: liquidGlass.text.primary,
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: 24,
    },
    label: {
        color: liquidGlass.text.tertiary,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 1,
    },
    typeScroll: {
        marginBottom: 20,
        flexGrow: 0,
    },
    typeChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.card,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        marginRight: 10,
    },
    typeChipActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    typeText: {
        color: liquidGlass.text.secondary,
        fontSize: 13,
        fontWeight: '600',
    },
    typeTextActive: {
        color: liquidGlass.text.inverse,
    },
    divider: {
        height: 1,
        backgroundColor: liquidGlass.border.glassLight,
        marginVertical: 20,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    durationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.glassLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBtnText: {
        color: liquidGlass.text.primary,
        fontSize: 24,
        fontWeight: '600',
    },
    durationBar: {
        flex: 1,
        height: 6,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 3,
        overflow: 'hidden',
    },
    durationFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 3,
    },
    intensityRow: {
        flexDirection: 'row',
        gap: 10,
    },
    intensityBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.card,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        alignItems: 'center',
    },
    intensityBtnActive: {
        backgroundColor: colors.success + '20',
        borderColor: colors.success,
    },
    intensityText: {
        color: liquidGlass.text.secondary,
        fontSize: 12,
        fontWeight: '700',
    },
    intensityTextActive: {
        color: colors.success,
    },
    areaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    areaChipActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    areaText: {
        color: liquidGlass.text.secondary,
        fontSize: 13,
        fontWeight: '500',
    },
    areaTextActive: {
        color: liquidGlass.text.inverse,
        fontWeight: '600',
    },
    input: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        padding: 16,
        color: liquidGlass.text.primary,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    footer: {
        padding: 24,
        backgroundColor: liquidGlass.surface.glassDark,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.glass,
    },
    saveBtn: {
        backgroundColor: colors.accent,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        ...glassShadows.glow,
    },
    saveText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
});
