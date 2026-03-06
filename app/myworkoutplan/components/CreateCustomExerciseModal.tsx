
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { X, Dumbbell, Activity, Flame, Trophy, Move, Plus } from 'lucide-react-native';
import { liquidGlass, glassShadows, glassLayout, glassStyles } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { Exercise, ExerciseDomain } from '@/types/workout';
import { useWorkoutStore } from '@/stores/workoutStore';

interface CreateCustomExerciseModalProps {
    isVisible: boolean;
    onClose: () => void;
    onCreated: (exercise: Exercise, shouldAddToPlan: boolean) => void;
}

const CATEGORIES: { label: string; value: ExerciseDomain }[] = [
    { label: 'Gym', value: 'gym' },
    { label: 'Cardio', value: 'cardio' },
    { label: 'Cross', value: 'cross_training' },
    { label: 'Sports', value: 'sports_performance' },
    { label: 'Calis', value: 'calisthenics' },
];

export const CreateCustomExerciseModal = ({ isVisible, onClose, onCreated }: CreateCustomExerciseModalProps) => {
    const { addCustomExercise } = useWorkoutStore();

    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ExerciseDomain>('gym');
    const [targetSets, setTargetSets] = useState('3');
    const [targetReps, setTargetReps] = useState('10');

    // Muscles are simplified for custom exercises
    const [primaryMuscle, setPrimaryMuscle] = useState('');

    const handleSave = (shouldAddToPlan: boolean) => {
        if (!name.trim()) return;

        haptics.success();

        const newExercise: Exercise = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name.trim(),
            muscles: {
                primary: primaryMuscle ? [primaryMuscle.trim()] : ['Full Body'],
                secondary: []
            },
            equipment: ['Other'], // Default
            equipment_required: false,
            movement_type: 'compound', // Default
            best_for: ['General Fitness'],
            guidance_by_goal: {},
            form_tips: [],
            common_mistakes: [],
            alternatives: [],
            categories: [selectedCategory],
            difficulty: 'Intermediate', // Default
            description: 'Custom exercise created by user',
            sets: parseInt(targetSets) || 3,
            reps: targetReps || '10',
            tags: ['custom']
        };

        addCustomExercise(newExercise);
        onCreated(newExercise, shouldAddToPlan);

        // Reset form
        setName('');
        setPrimaryMuscle('');
        setTargetSets('3');
        setTargetReps('10');
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Custom Exercise</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <X size={20} color={liquidGlass.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Name Input */}
                            <Text style={styles.label}>Exercise Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Super Burpee"
                                placeholderTextColor={liquidGlass.text.tertiary}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />

                            {/* Category Selector */}
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoryRow}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        style={[
                                            styles.catChip,
                                            selectedCategory === cat.value && styles.catChipActive
                                        ]}
                                        onPress={() => {
                                            haptics.selection();
                                            setSelectedCategory(cat.value);
                                        }}
                                    >
                                        <Text style={[
                                            styles.catText,
                                            selectedCategory === cat.value && styles.catTextActive
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Options Row */}
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Sets</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={targetSets}
                                        onChangeText={setTargetSets}
                                        keyboardType="numeric"
                                        placeholder="3"
                                        placeholderTextColor={liquidGlass.text.tertiary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Reps / Duration</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={targetReps}
                                        onChangeText={setTargetReps}
                                        placeholder="10"
                                        placeholderTextColor={liquidGlass.text.tertiary}
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Primary Muscle (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Chest"
                                placeholderTextColor={liquidGlass.text.tertiary}
                                value={primaryMuscle}
                                onChangeText={setPrimaryMuscle}
                            />

                        </ScrollView>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.createBtn, styles.secondaryBtn]}
                                onPress={() => handleSave(false)}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.secondaryBtnText}>Create Only</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.createBtn, !name.trim() && { opacity: 0.5 }]}
                                onPress={() => handleSave(true)}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.createBtnText}>Create & Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: liquidGlass.background.secondary,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.deep,
        maxHeight: '80%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: liquidGlass.text.primary,
        letterSpacing: -0.5
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollContent: {
        marginBottom: 24
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: liquidGlass.text.secondary,
        marginBottom: 8,
        marginTop: 4
    },
    input: {
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 16,
        padding: 16,
        color: liquidGlass.text.primary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        marginBottom: 16
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16
    },
    catChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass
    },
    catChipActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary
    },
    catText: {
        fontSize: 12,
        fontWeight: '600',
        color: liquidGlass.text.tertiary
    },
    catTextActive: {
        color: liquidGlass.text.inverse
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16
    },
    createBtn: {
        height: 56,
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...glassShadows.glowTeal,
        flex: 1
    },
    secondaryBtn: {
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,

    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8
    },
    secondaryBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.secondary
    },
    createBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: liquidGlass.text.inverse
    }
});
