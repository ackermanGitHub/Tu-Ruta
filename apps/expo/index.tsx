import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import 'react-native-gesture-handler';
import React from "react";

// Must be exported or Fast Refresh won't update the context
export function App() {
  // @ts-ignore
  const ctx = require.context("./src/app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
