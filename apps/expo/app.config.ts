import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "La Ruta",
  slug: "la-ruta",
  scheme: "expo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FCCB6F",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "your.bundle.identifier",
    entitlements: {
      "com.apple.developer.networking.wifi-info": true
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
    },
  },
  extra: {
    eas: {
      projectId: "6672061b-f930-433e-81a0-6ef06407692c",
    },
  },
  plugins: ["./expo-plugins/with-modify-gradle.js", "expo-router"],
});

export default defineConfig;
