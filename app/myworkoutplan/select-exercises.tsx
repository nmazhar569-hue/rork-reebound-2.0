import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SectionList,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Search,
    Filter,
    X,
    Plus,
    Check,
    Info,
    ChevronRight,
    ArrowLeft
} from 'lucide-react-native';

import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { EXERCISE_DATABASE, getExercisesByMuscle } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';

const MUSCLE_GROUPS = [
    'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'
];

export default function SelectExercisesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name: string;
        day: string;
        duration: string;
        selectedExercises: string;
    }>();
    const insets = useSafeAreaInsets();

    const initialSelected = useMemo(() => {
        if (!params.selectedExercises) return [];
        try {
            return JSON.parse(params.selectedExercises);
        } catch {
            return [];
        }
    }, [params.selectedExercises]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedExercises, setSelectedExercises] = useState<any[]>(initialSelected);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Filter exercises
    const filteredExercises = useMemo(() => {
        let exercises = Object.values(EXERCISE_DATABASE);

        // Apply category filter
        if (activeFilter !== 'All') {
            exercises = exercises.filter(ex =>
                ex.category === activeFilter ||
                ex.secondary_categories.includes(activeFilter as any)
            );
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            exercises = exercises.filter(ex =>
                ex.name.toLowerCase().includes(query) ||
                ex.tags.some(tag => tag.includes(query))
            );
        }

        // Group by category for SectionList
        const grouped: { title: string; data: typeof exercises }[] = [];

        exercises.forEach(ex => {
            const existingGroup = grouped.find(g => g.title === ex.category);
            if (existingGroup) {
                existingGroup.data.push(ex);
            } else {
                grouped.push({ title: ex.category, data: [ex] });
            }
        });

        return grouped.sort((a, b) => a.title.localeCompare(b.title));
    }, [searchQuery, activeFilter]);

    const handleSelect = (exerciseId: string) => {
        // Navigate to configuration screen for this exercise
        router.push({
            pathname: '/myworkoutplan/configure-exercise',
            params: {
                exerciseId,
                existingExercises: JSON.stringify(selectedExercises),
                workoutName: params.name,
                workoutDay: params.day,
                workoutDuration: params.duration,
            }
        });
    };

    const handleReview = () => {
        router.push({
            pathname: '/myworkoutplan/review',
            params: {
                name: params.name,
                day: params.day,
                duration: params.duration,
                exercises: JSON.stringify(selectedExercises),
            }
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={liquidGlass.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Exercises</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
                    <Filter size={20} color={activeFilter !== 'All' ? liquidGlass.accent.primary : liquidGlass.text.secondary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={liquidGlass.text.tertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor={liquidGlass.text.tertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={16} color={liquidGlass.text.tertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
// ... (skipping lines)
            <View style={styles.addButton}>
                <Plus size={20} color={liquidGlass.accent.primary} />
            </View>
// ...
            <TouchableOpacity style={styles.nextButton} onPress={handleReview}>
                <Text style={styles.nextButtonText}>Review Plan</Text>
                <ChevronRight size={20} color={liquidGlass.text.inverse} />
            </TouchableOpacity>

            {/* Categories Horizontal Scroll */}
            <View style={styles.filtersRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterChip, activeFilter === 'All' && styles.filterChipActive]}
                        onPress={() => setActiveFilter('All')}
                    >
                        <Text style={[styles.filterText, activeFilter === 'All' && styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    {MUSCLE_GROUPS.map((muscle) => (
                        <TouchableOpacity
                            key={muscle}
                            style={[styles.filterChip, activeFilter === muscle && styles.filterChipActive]}
                            onPress={() => setActiveFilter(muscle)}
                        >
                            <Text style={[styles.filterText, activeFilter === muscle && styles.filterTextActive]}>
                                {muscle}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main List */}
            <SectionList
                sections={filteredExercises}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.exerciseCard}
                        onPress={() => handleSelect(item.id)}
                    >
                        <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{item.name}</Text>
                            <Text style={styles.exerciseSub}>
                                {item.difficulty} • {item.movement_type}
                            </Text>
                        </View>
                        <View style={styles.addButton}>
                            <Plus size={20} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                )}
                stickySectionHeadersEnabled={false}
            />

            {/* Footer */}
            {selectedExercises.length > 0 && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
                    <View style={styles.selectedCount}>
                        <Text style={styles.selectedCountText}>
                            {selectedExercises.length} exercises selected
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.nextButton} onPress={handleReview}>
                        <Text style={styles.nextButtonText}>Review Plan</Text>
                        <ChevronRight size={20} color={colors.surface} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: glassLayout.screenPadding,
        paddingVertical: 12,
        backgroundColor: liquidGlass.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    filterButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    searchContainer: {
        padding: glassLayout.screenPadding,
        backgroundColor: liquidGlass.background.secondary,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        gap: 12,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    searchInput: {
        flex: 1,
        color: liquidGlass.text.primary,
        fontSize: 16,
    },
    filtersRow: {
        paddingVertical: 12,
        backgroundColor: liquidGlass.background.secondary,
        paddingLeft: glassLayout.screenPadding,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 50,
        backgroundColor: liquidGlass.surface.glass,
        marginRight: 8,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    filterChipActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.secondary,
        textTransform: 'capitalize',
    },
    filterTextActive: {
        color: liquidGlass.text.inverse,
    },
    listContent: {
        padding: glassLayout.screenPadding,
        paddingBottom: 100,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: liquidGlass.text.tertiary,
        textTransform: 'uppercase',
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: liquidGlass.background.secondary, // sticky header bg
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.soft,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    exerciseSub: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: liquidGlass.surface.glassDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: liquidGlass.background.secondary,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
    },
    selectedCount: {},
    selectedCountText: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50,
        gap: 8,
        ...glassShadows.glow,
    },
    nextButtonText: {
        color: liquidGlass.text.inverse,
        fontWeight: '600',
        fontSize: 15,
    },
});
