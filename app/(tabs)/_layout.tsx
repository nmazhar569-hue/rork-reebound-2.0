import { Tabs, useSegments } from "expo-router";
import { Home, Calendar, Activity, TrendingUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import colors from "@/constants/colors";

import { ReeFloatingButton } from "@/components/ReeFloatingButton";
import { AppTutorial, isTutorialCompleted } from "@/components/AppTutorial";
import { useRee } from "@/contexts/ReeContext";
import { ReeScreenContext } from "@/types";

export default function TabLayout() {
  const segments = useSegments();
  const { updateScreenContext } = useRee();
  const [showTutorial, setShowTutorial] = useState(false);

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

  // Check if tutorial should be shown on first app load
  useEffect(() => {
    const checkTutorial = async () => {
      const completed = await isTutorialCompleted();
      if (!completed) {
        // Small delay to let the app settle before showing tutorial
        setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
      }
    };

    checkTutorial();
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // Hide the tab bar completely
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="plan" options={{ title: "Plan" }} />
        <Tabs.Screen name="recovery" options={{ title: "Recovery" }} />
        <Tabs.Screen name="progress" options={{ title: "Progress" }} />
        <Tabs.Screen name="nutrition" options={{ href: null }} />
      </Tabs>
      
      {/* Floating AI button for navigation */}
      <ReeFloatingButton />

      {/* Tutorial overlay */}
      <AppTutorial visible={showTutorial} onComplete={handleTutorialComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  // No longer needed since button positions itself
});
