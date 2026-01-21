import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HealthProvider } from "@/contexts/HealthContext";
import { ReeProvider } from "@/contexts/ReeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HealthKitProvider } from "@/contexts/HealthKitContext";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { liquidGlass } from "@/constants/liquidGlass";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: liquidGlass.background.primary },
        headerTintColor: liquidGlass.text.primary,
        headerTitleStyle: { color: liquidGlass.text.primary, fontWeight: '700' },
        contentStyle: { backgroundColor: liquidGlass.background.primary },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="programs/index" options={{ title: "Programs" }} />
      <Stack.Screen name="programs/builder" options={{ title: "Build Program" }} />
      <Stack.Screen name="programs/edit-today" options={{ title: "Edit for Today" }} />
      <Stack.Screen name="profile" options={{ title: "Your Profile" }} />
      <Stack.Screen name="ai-chat" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: liquidGlass.background.primary }}>
        <ThemeProvider>
          <AuthProvider>
            <HealthProvider>
              <HealthKitProvider>
                <AppModeProvider>
                  <AppProvider>
                    <ReeProvider>
                      <RootLayoutNav />
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
