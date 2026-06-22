import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const bg = isDark ? "#080c18" : "#f0f4f8";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bg },
        animation: "slide_from_left",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="tools/frp" />
      <Stack.Screen name="tools/flash" />
      <Stack.Screen name="tools/imei" />
      <Stack.Screen name="tools/network" />
      <Stack.Screen name="tools/qr" />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  // Preload icon fonts so fontfaceobserver errors are caught gracefully.
  // On native this is a no-op; on web it prevents the unhandled crash.
  const [fontsLoaded, fontError] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    MaterialCommunityIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
  });

  useEffect(() => {
    const bg = scheme === "dark" ? "#080c18" : "#f0f4f8";
    SystemUI.setBackgroundColorAsync(bg);
  }, [scheme]);

  useEffect(() => {
    // Hide splash screen once fonts loaded or if they fail — never block forever
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Keep splash screen while fonts are loading; proceed on error
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
