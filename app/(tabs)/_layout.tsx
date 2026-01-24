import { Tabs, useSegments } from "expo-router";
import { Home, Dumbbell, TrendingUp, Heart, Utensils } from "lucide-react-native";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { liquidGlass } from "@/constants/liquidGlass";
import { useRee } from "@/contexts/ReeContext";
import { ReeScreenContext } from "@/types";

/**
 * Tab Layout with Frosted Glass Tab Bar
 * 
 * 3 main tabs:
 * - Home 🏠
 * - Train 💪 
 * - Progress 📈
 */

export default function TabLayout() {
  const segments = useSegments();
  const { updateScreenContext } = useRee();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const currentTab = segments[1] || 'index';
    const contextMap: Record<string, ReeScreenContext> = {
      'index': 'home',
      'plan': 'plan',
      'recovery': 'recovery',
      'progress': 'progress',
      'nutrition': 'home',
    };
    const screenContext = contextMap[currentTab] || 'home';
    console.log('[TabLayout] Screen context:', screenContext);
    updateScreenContext(screenContext);
  }, [segments, updateScreenContext]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 12,
            backgroundColor: 'rgba(10, 22, 40, 0.85)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Home
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: "Train",
            tabBarIcon: ({ color, focused }) => (
              <Dumbbell
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, focused }) => (
              <TrendingUp
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
        <Tabs.Screen
          name="recovery"
          options={{
            href: null,
            title: "Recovery",
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            href: null,
            title: "Nutrition",
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
