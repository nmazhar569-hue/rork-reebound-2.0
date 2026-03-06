import { Stack } from 'expo-router';
import React from 'react';
import { liquidGlass } from '@/constants/liquidGlass';

export default function MyWorkoutPlanLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: liquidGlass.background.primary,
                },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="builder" />
            <Stack.Screen name="library" />
            <Stack.Screen name="[day]" />
        </Stack>
    );
}
