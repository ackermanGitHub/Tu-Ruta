import React, { useState } from 'react';
import { TextInput, Pressable, useColorScheme } from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignUp } from "@clerk/clerk-expo";
import { Stack } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { PressBtn } from '../styles/PressBtn';
import SignWithOAuth from './SignWithOAuth';
import { Image } from 'expo-image';
import TuRutaImg from '../../assets/Logo.png'

function determineCredentialType(input: string): string {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;

    if (emailRegex.test(input)) {
        return 'email';
    } else if (phoneRegex.test(input)) {
        return 'phone_number';
    } else {
        return 'username';
    }
}

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<any> }) {

    const { isLoaded, signUp, setActive } = useSignUp();
    const colorScheme = useColorScheme();

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");

    const handleSignUp = async () => {
        if (!isLoaded) {
            return;
        }

        const credentialType = determineCredentialType(credential)

        try {
            if (credentialType === 'email') {
                await signUp.create({
                    emailAddress: credential.trim(),
                    password,
                });
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            } else if (credentialType === 'phone_number') {
                await signUp.create({
                    phoneNumber: credential.trim(),
                    password,
                });
                await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
            }

            setPendingVerification(true);

        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
    }

    const handleVerifyCredentials = async () => {

        if (!isLoaded) {
            return;
        }

        const credentialType = determineCredentialType(credential)

        try {
            if (credentialType === 'email') {

                const completeEmailSignUp = await signUp.attemptEmailAddressVerification({
                    code,
                });
                await setActive({ session: completeEmailSignUp.createdSessionId });

            } else if (credentialType === 'phone_number') {

                const completePhoneSignUp = await signUp.attemptPhoneNumberVerification({
                    code,
                });
                await setActive({ session: completePhoneSignUp.createdSessionId });

            }
            navigation?.navigate('Map')

        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Sign Up',
            }} />
            <View className='w-3/4 items-center justify-center'>
                <Image
                    source={TuRutaImg}
                    alt='Tu-Ruta Logo'
                    className={`h-16 w-14`}
                />
                <Text className='font-bold text-3xl my-4 text-center'>Crear Cuenta en La Ruta</Text>
            </View>
            <SignWithOAuth action={'sign-in'} />
            {!pendingVerification && (
                <>
                    <View className={'w-4/5 mb-4 max-w-[320px]'}>
                        <TextInput
                            className={'h-12 px-4 border rounded border-gray-300 dark:text-slate-500 dark:bg-transparent dark:border-gray-600'}
                            placeholder="Teléfono, email o usuario"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "gray"}
                            onChangeText={setCredential}
                            value={credential}
                        />
                    </View>
                    <View className={'w-4/5 mb-4 max-w-[320px]'}>
                        <TextInput
                            className={'h-12 px-4 border rounded border-gray-300 dark:text-slate-500 dark:bg-transparent dark:border-gray-600'}
                            placeholder="Contraseña"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "gray"}
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
                            className={'h-12 px-4 border rounded border-gray-300 dark:text-gray-600 dark:bg-transparent dark:border-gray-800'}
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "gray"}
                            value={code}
                            placeholder="Code..."
                            onChangeText={(code) => setCode(code)}
                        />
                    </View>
                    <PressBtn onPress={() => { void handleVerifyCredentials() }} className={'w-[240px] max-w-[280px] bg-[#FCCB6F] my-2 dark:bg-white rounded-3xl h-12 justify-center items-center'} >
                        <Text className={'dark:text-black text-white font-bold text-lg'}>Verificar</Text>
                    </PressBtn>
                </View>
            )}
            <PressBtn onPress={() => { void handleSignUp() }} className={'w-[240px] max-w-[280px] bg-[#FCCB6F] my-2 dark:bg-white rounded-3xl h-12 justify-center items-center'} >
                <Text className={'dark:text-black text-white font-bold text-lg'}>Crear Cuenta</Text>
            </PressBtn>
            <Pressable className={'my-4 flex-row items-center justify-center'} onPress={() => { navigation && navigation.navigate('Sign-In') }}>
                <Text className={'text-sm font-light dark:text-gray-400'}>Ya Tienes Cuenta?</Text>
                <Text className={'text-[#2e78b7] font-normal ml-1 text-sm'}>Inicia Sesióin</Text>
            </Pressable>
        </View>
    );
}