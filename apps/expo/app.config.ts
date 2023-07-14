import type { ExpoConfig } from "@expo/config";

/* 

julio@Ackerman MINGW64 ~/La-Ruta/t3-turbo-and-clerk-expo-router/apps/expo (main)
$ eas build --platform ios --profile production
√ Generated eas.json. Learn more: https://docs.expo.dev/build-reference/eas-json/
Loaded "env" configuration for the "production" profile: no environment variables specified. Learn more: https://docs.expo.dev/build-reference/variables/       
The NODE_ENV environment variable is required but was not specified. Ensure the project is bundled with Expo CLI or NODE_ENV is set.
Proceeding without mode-specific .env
✔ Using remote iOS credentials (Expo server)

If you provide your Apple account credentials we will be able to generate all necessary build credentials and fully validate them.
This is optional, but without Apple account access you will need to provide all the missing values manually and we can only run minimal validation on them.     
√ Do you want to log in to your Apple account? ... yes

› Log in to your Apple Developer account to continue
? Apple ID: » 
.h5bEk#RfruwQZs
*/

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
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FCCB6F",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY || "",
      }
    },
    package: "com.cubastore.laruta",
  },
  extra: {
    eas: {
      projectId: "6672061b-f930-433e-81a0-6ef06407692c",
    },
  },
  plugins: ["./expo-plugins/with-modify-gradle.js", "expo-router"],
});

export default defineConfig;
