import { Tabs, useSegments } from "expo-router";
import { Home, Calendar, Activity, TrendingUp } from "lucide-react-native";
import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import colors from "@/constants/colors";

import { ReeFloatingButton } from "@/components/ReeFloatingButton";
import { useRee } from "@/contexts/ReeContext";
import { ReeScreenContext } from "@/types";

export default function TabLayout() {
  const segments = useSegments();
  const { updateScreenContext } = useRee();

  useEffect(() => {
    const currentTab = segments[1] || 'index';
    const contextMap: Record<string, ReeScreenContext> = {
      'index': 'home',
      'plan': 'plan',
      'recovery': 'recovery',
      'progress': 'progress',
    };
    const screenContext = contextMap[currentTab] || 'home';
    console.log('[TabLayout] Screen context:', screenContext);
    updateScreenContext(screenContext);
  }, [segments, updateScreenContext]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.98)',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView
                intensity={95}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            ) : null
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600' as const,
            marginTop: 4,
            letterSpacing: 0.2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Home 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2.8 : 2.2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: "Plan",
            tabBarIcon: ({ color, focused }) => (
              <Calendar 
                size={24} 
                color={color}
                strokeWidth={focused ? 2.8 : 2.2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ai-placeholder"
          options={{
            title: "",
            tabBarButton: () => <View style={{ width: 76 }} />,
          }}
        />
        <Tabs.Screen
          name="recovery"
          options={{
            title: "Recovery",
            tabBarIcon: ({ color, focused }) => (
              <Activity 
                size={24} 
                color={color}
                strokeWidth={focused ? 2.8 : 2.2}
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
                size={24} 
                color={color}
                strokeWidth={focused ? 2.8 : 2.2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            href: null,
          }}
        />
      </Tabs>
      
      <View style={[styles.reeWrapper, { bottom: Platform.OS === 'ios' ? 48 : 38 }]}>
        <ReeFloatingButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reeWrapper: {
    position: 'absolute',
    left: '50%',
    marginLeft: -32,
    zIndex: 100,
  },
});
