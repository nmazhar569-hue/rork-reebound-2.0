import { Tabs, useSegments, useRouter } from "expo-router";
import { Home, Calendar, Activity, TrendingUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { liquidGlass } from "@/constants/liquidGlass";

import { useRee } from "@/contexts/ReeContext";
import { ReeScreenContext } from "@/types";
import { haptics } from "@/utils/haptics";

export default function TabLayout() {
  const segments = useSegments();
  const { updateScreenContext } = useRee();

  useEffect(() => {
    const currentTab = segments[1] || 'index';
    const contextMap: Record<string, ReeScreenContext> = {
      'index': 'home',
      'recovery': 'recovery',
      'progress': 'progress',
    };
    const screenContext = contextMap[currentTab] || 'home';
    updateScreenContext(screenContext);
  }, [segments, updateScreenContext]);

  return (
    <View style={{ flex: 1, backgroundColor: liquidGlass.background.primary }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none',
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="recovery" options={{ title: "Recovery" }} />
        <Tabs.Screen name="progress" options={{ title: "Progress" }} />
        <Tabs.Screen name="nutrition" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({});
