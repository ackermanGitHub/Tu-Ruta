/* eslint-disable */
import { useOAuth } from "@clerk/clerk-expo";
import React from "react";
import { Pressable } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Svg, Defs, G, Path } from "react-native-svg";
import { Text } from "../styles/Themed";

const SignInWithOAuth = ({ action = 'sign-in' }) => {

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_discord" });

  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const googleSignUpHandler = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive && setActive({ session: createdSessionId });
      } else {
        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error("There are unmet requirements, modifiy this else to handle them")
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  const googleSignInHandler = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive && setActive({ session: createdSessionId });
      } else {
        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error("There are unmet requirements, modifiy this else to handle them")
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <Pressable onPress={action === 'sign-in' ? googleSignInHandler : googleSignUpHandler} className={'w-4/5 max-w-[240px] mt-2 gap-4 bg-white dark:bg-slate-700 rounded h-12 flex-row justify-center items-center'}>
      <Svg width="32px" height="32px" viewBox="-0.5 0 48 48">
        <Defs>
        </Defs>
        <G id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <G id="Color-" transform="translate(-401.000000, -860.000000)">
            <G id="Google" transform="translate(401.000000, 860.000000)">
              <Path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05" />
              <Path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335" />
              <Path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853" />
              <Path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4" />
            </G>
          </G>
        </G>
      </Svg>
      <Text className={'text-black dark:text-white'}>Sign with Google</Text>
    </Pressable>
  );
}

export default SignInWithOAuth;