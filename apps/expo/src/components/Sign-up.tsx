import React, { useState } from 'react';
import { TextInput, Pressable, TouchableOpacity, useColorScheme } from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignUp } from "@clerk/clerk-expo";
import { Stack, useRouter } from 'expo-router';
import SignWithOAuth from './SignInWithOAuth';
import { type DrawerNavigationProp } from '@react-navigation/drawer';

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<any> }) {

    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");

    const handleSignUp = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            await signUp.create({
                emailAddress: email.trim(),
                password,
            });

            // send the email.
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            // change the UI to our pending section.
            setPendingVerification(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
    }

    const handleVerifyEmail = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            await setActive({ session: completeSignUp.createdSessionId });
            router.replace('/profile');
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Sign Up',
            }} />
            {!pendingVerification && (
                <>
                    <View className={'w-4/5 mb-4 max-w-[320px]'}>
                        <TextInput
                            className={'h-12 px-4 border rounded border-gray-300 dark:text-white dark:bg-transparent dark:border-gray-700'}
                            placeholder="Email..."
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "white" : "gray"}
                            onChangeText={setEmail}
                            value={email}
                        />
                    </View>
                    <View className={'w-4/5 mb-4 max-w-[320px]'}>
                        <TextInput
                            className={'h-12 px-4 border rounded border-gray-300 dark:text-white dark:bg-transparent dark:border-gray-700'}
                            placeholder="Password..."
                            secureTextEntry={true}
                            placeholderTextColor={colorScheme === 'dark' ? "white" : "gray"}
                            onChangeText={setPassword}
                            value={password}
                        />
                    </View>
                </>
            )}
            {pendingVerification && (
                <View>
                    <View>
                        <TextInput
                            className={'h-12 px-4 border rounded border-gray-300 dark:text-white dark:bg-transparent dark:border-gray-700'}
                            placeholderTextColor={colorScheme === 'dark' ? "white" : "gray"}
                            value={code}
                            placeholder="Code..."
                            onChangeText={(code) => setCode(code)}
                        />
                    </View>
                    <TouchableOpacity className={'w-4/5 max-w-[240px] bg-[#FCCB6F] dark:bg-transparent rounded h-12 justify-center items-center'} onPress={handleVerifyEmail}>
                        <Text className={'font-bold text-lg text-white'}>Verify Email</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Pressable onPress={() => { }} className={'w-4/5 max-w-[240px] bg-[#FCCB6F] dark:bg-transparent rounded h-12 justify-center items-center'}>
                <Text className={'font-bold text-lg text-white'}>Sign Up</Text>
            </Pressable>
            <SignWithOAuth action='sign-up' />
            <Pressable className={'my-2'} onPress={() => { navigation && navigation.navigate('Sign-In') }}>
                <Text className={'text-[#2e78b7] text-xs'}>Do you have an account? Sign In</Text>
            </Pressable>
        </View>
    );
}