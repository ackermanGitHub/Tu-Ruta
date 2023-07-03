import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider/* , SignedIn, SignedOut */ } from "@clerk/clerk-expo";
import { tokenCache } from "../utils/cache";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useFonts } from 'expo-font';

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../../assets/Inter-Regular.otf'),
  });


  useEffect(() => {
    async function prepare() {
      try {
        // make any API calls you need to do here

        // await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    void prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Z2VuZXJvdXMtbG9ic3Rlci0yMS5jbGVyay5hY2NvdW50cy5kZXYk"}
      tokenCache={tokenCache}
    >

      <SafeAreaProvider>

        <Stack
          screenOptions={{
            headerShown: false
          }}
        />
        <StatusBar />

      </SafeAreaProvider>

    </ClerkProvider>
  );
};

export default RootLayout;
