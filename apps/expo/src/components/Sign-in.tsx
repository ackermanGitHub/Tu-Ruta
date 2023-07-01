import React, { useState } from 'react';
import { TextInput, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignIn } from "@clerk/clerk-expo";
import { PressBtn } from '../styles/PressBtn';
import { type DrawerNavigationProp } from '@react-navigation/drawer';


export default function SignIn({ navigation }: { navigation?: DrawerNavigationProp<any> }) {
    const { signIn, setActive, isLoaded } = useSignIn();
    const colorScheme = useColorScheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoadind, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async () => {
        setIsLoading(true);
        if (!isLoaded) {
            setIsLoading(false);
            setError("Intente de nuevo en unos segundos")
            return;
        }

        try {
            const completeSignIn = await signIn.create({
                identifier: email.trim(),
                password,
            });
            // This is an important step,
            // This indicates the user is signed in
            await setActive({ session: completeSignIn.createdSessionId });
        } catch (err) {
            setError("handleSignIn - Error")
            console.error(JSON.stringify(err, null, 2));
        }
        setIsLoading(false);
    }

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <View className={'w-4/5 mb-4 max-w-[320px]'}>
                <Text className={'text-red-500 text-xs'}>
                    {error}
                </Text>
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
            <PressBtn onPress={() => { void handleSignIn() }} className={'w-[180px] max-w-[240px] bg-[#FCCB6F] dark:bg-transparent rounded h-12 justify-center items-center'} >
                <Text className={'text-white font-bold text-lg'}>Sign In</Text>
            </PressBtn>
            {/* <SignWithOauth action='sign-in' /> */}
            <Pressable className={'my-2'} onPress={() => { navigation && navigation.navigate('Sign-Up') }}>
                <Text className={'text-[#2e78b7] text-xs'}>Don&apos;t have an account? Sign Up</Text>
            </Pressable>
            {isLoadind &&
                <ActivityIndicator className={'my-8'} size={'small'} animating color={colorScheme === 'dark' ? 'white' : 'black'} />
            }
        </View>
    );
}