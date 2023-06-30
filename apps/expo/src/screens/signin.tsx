import React from "react";

import { View, SafeAreaView } from "react-native";

import SignInWithOAuth from "../components/SignInWithOAuth";

export const SignInSignUpScreen = () => {
  return (
    <SafeAreaView className="">
      <View className="h-full justify-center items-center w-full p-4">
        <SignInWithOAuth />
      </View>
    </SafeAreaView>
  );
};
