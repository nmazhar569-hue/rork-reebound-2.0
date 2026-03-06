import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { haptics } from '@/utils/haptics';
import { FuelGaugeDashboard } from '@/components/MacroRingChart';
import { getDailyTotals } from '@/services/FoodProcessingService';
import { liquidGlass } from '@/constants/liquidGlass';

export function NutritionSnapshot() {
    const router = useRouter();
    const [totals, setTotals] = useState(getDailyTotals());

    useFocusEffect(
        React.useCallback(() => {
            // Refresh totals every time screen focuses
            setTotals(getDailyTotals());
        }, [])
    );

    // MOCK TARGETS (In "Real" audit, these should come from UserProfile service)
    // TODO: Connect to UserProfile.targets
    const targets = {
        protein: 180,
        carbs: 250,
        fats: 70
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    haptics.light();
                    router.push('/nutrition');
                }}
            >
                <FuelGaugeDashboard
                    protein={{ current: totals.protein, target: targets.protein }}
                    carbs={{ current: totals.carbs, target: targets.carbs }}
                    fats={{ current: totals.fats, target: targets.fats }}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => {
                    haptics.light();
                    router.push('/nutrition');
                }}
            >
                <Text style={styles.detailsText}>View Nutrition Stats</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    detailsBtn: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailsText: {
        color: liquidGlass.accent.secondary,
        fontSize: 14,
        fontWeight: '600',
    }
});
