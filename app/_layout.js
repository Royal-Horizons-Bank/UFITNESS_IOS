import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { UserProvider, useUser } from '../src/context/UserContext';
import { PALETTE } from '../src/constants/theme';

// Keep the native splash screen visible
SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const { user, userData, loading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  const isSyncingData = user && (!userData || !userData.email);

  // 1. SPLASH SCREEN EFFECT
  // Only runs when loading or syncing state changes.
  useEffect(() => {
    if (!loading && !isSyncingData) {
      // Catch prevents the "Uncaught promise" error if called multiple times
      SplashScreen.hideAsync().catch(() => {
        // Silently ignore if already hidden
      });
    }
  }, [loading, isSyncingData]);

  // 2. ROUTING EFFECT
  // Handles navigation once data is ready.
  useEffect(() => {
    if (loading || isSyncingData) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSetupGroup = segments[0] === '(setup)';

    if (!user) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (user && (!userData || !userData.isSetupComplete)) {
      if (!inSetupGroup) router.replace('/(setup)');
    } else if (user && userData?.isSetupComplete) {
      if (inAuthGroup || inSetupGroup) router.replace('/(tabs)');
    }

  }, [user, userData, loading, segments, isSyncingData]);

  // Return null instead of a loader so the native splash screen 
  // smoothly transitions directly to your app screens.
  if (loading || isSyncingData) {
    return null; 
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(setup)" options={{ headerShown: false }} />
      
      <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="bodystats" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <StatusBar style="light" />
        <RootNavigation />
      </UserProvider>
    </SafeAreaProvider>
  );
}