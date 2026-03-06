import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";

import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HealthProvider } from "@/contexts/HealthContext";
import { ReeProvider, useRee } from "@/contexts/ReeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HealthKitProvider } from "@/contexts/HealthKitContext";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { liquidGlass } from "@/constants/liquidGlass";

import { VoidBackground } from "@/components/VoidBackground";
// Global Components
import { ReeButton } from "@/components/ReeButton";
import { ReeMenuModal } from "@/components/ReeMenuModal";
import { ReeChatModal } from "@/components/ReeChatModal";
import { ReeAnalysisModal } from "@/components/ReeAnalysisModal";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: 'transparent' },
        headerTransparent: true,
        headerTintColor: liquidGlass.text.primary,
        headerTitleStyle: { color: liquidGlass.text.primary, fontWeight: '700' },
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="myworkoutplan" options={{ headerShown: false }} />
      <Stack.Screen name="programs/index" options={{ title: "Programs" }} />
      <Stack.Screen name="programs/builder" options={{ title: "Build Program" }} />
      <Stack.Screen name="programs/edit-today" options={{ title: "Edit for Today" }} />
      <Stack.Screen name="profile" options={{ title: "Your Profile" }} />
      <Stack.Screen name="ai-chat" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

// Wrapper to use context
function GlobalReeInterface() {
  const segments = useSegments() as string[];
  const { hasUnseenInsight } = useRee();
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);

  // Hide Ree on onboarding and auth screens
  const hideRee = segments.includes('onboarding') || segments.includes('auth');

  if (hideRee) return null;

  return (
    <>
      <View style={styles.floatingRee}>
        <ReeButton
          onPress={() => setMenuVisible(true)}
          hasNewInsights={hasUnseenInsight}
          size={64}
        />
      </View>

      <ReeMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCheckIn={() => setCheckInVisible(true)}
        onTalk={() => setChatVisible(true)}
      />

      <ReeChatModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
      />

      <ReeAnalysisModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onActionPress={() => { }} // Could navigate or refresh
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <VoidBackground />
        <ThemeProvider>
          <AuthProvider>
            <HealthProvider>
              <HealthKitProvider>
                <AppModeProvider>
                  <AppProvider>
                    <ReeProvider>
                      <RootLayoutNav />
                      <GlobalReeInterface />
                    </ReeProvider>
                  </AppProvider>
                </AppModeProvider>
              </HealthKitProvider>
            </HealthProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  floatingRee: {
    position: 'absolute',
    bottom: 24, // Universal position
    right: 20,
    zIndex: 9999, // On top of everything
  }
});
