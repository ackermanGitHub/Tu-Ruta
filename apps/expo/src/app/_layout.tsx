import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider/* , SignedIn, SignedOut */ } from "@clerk/clerk-expo";
import { tokenCache } from "../utils/cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";


const RootLayout = () => {

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
