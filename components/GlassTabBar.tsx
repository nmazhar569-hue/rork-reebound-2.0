import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Dumbbell, TrendingUp, LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, router } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

/**
 * GlassTabBar Component
 * 
 * Bottom tab bar with frosted glass effect:
 * - 3 main tabs: Home, Train, Progress
 * - Frosted glass background with backdrop blur
 * - Active tab shows teal gradient glow
 * - Smooth transitions between tabs
 */

interface TabItem {
    key: string;
    label: string;
    icon: LucideIcon;
    route: string;
}

const TABS: TabItem[] = [
    { key: 'home', label: 'Home', icon: Home, route: '/(tabs)' },
    { key: 'train', label: 'Train', icon: Dumbbell, route: '/(tabs)/plan' },
    { key: 'progress', label: 'Progress', icon: TrendingUp, route: '/(tabs)/progress' },
];

export function GlassTabBar() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    const getActiveTab = () => {
        if (pathname.includes('/plan')) return 'train';
        if (pathname.includes('/progress')) return 'progress';
        return 'home';
    };

    const activeTab = getActiveTab();

    const handleTabPress = (tab: TabItem) => {
        haptics.light();
        router.push(tab.route);
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Glass background */}
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassOverlay} />

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.icon;

                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={styles.tab}
                            onPress={() => handleTabPress(tab)}
                            activeOpacity={0.8}
                        >
                            {/* Active indicator glow */}
                            {isActive && (
                                <View style={styles.activeGlow}>
                                    <LinearGradient
                                        colors={[theme.colors.primary, `${theme.colors.primary}00`]}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                        style={styles.glowGradient}
                                    />
                                </View>
                            )}

                            {/* Icon container */}
                            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                                <Icon
                                    size={22}
                                    color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </View>

                            {/* Label */}
                            <Text style={[styles.label, isActive && styles.labelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 22, 40, 0.7)',
    },
    tabsRow: {
        flexDirection: 'row',
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
        position: 'relative',
    },
    activeGlow: {
        position: 'absolute',
        top: -16,
        width: 60,
        height: 40,
    },
    glowGradient: {
        width: '100%',
        height: '100%',
    },
    iconContainer: {
        width: 44,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    iconContainerActive: {
        backgroundColor: `${theme.colors.primary}15`,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    labelActive: {
        color: theme.colors.primary,
    },
});

export default GlassTabBar;
