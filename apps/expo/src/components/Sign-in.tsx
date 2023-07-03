import React, { useState } from 'react';
import { TextInput, Pressable, useColorScheme } from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignIn } from "@clerk/clerk-expo";
import { Stack } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { PressBtn } from '../styles/PressBtn';
import SignWithOAuth from './SignWithOAuth';
import { Image } from 'expo-image';
import TuRutaImg from '../../assets/Logo.png'

export default function SignIn({ navigation }: { navigation?: DrawerNavigationProp<any> }) {

    const { signIn, setActive, isLoaded } = useSignIn();

    const colorScheme = useColorScheme();

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        if (!isLoaded) {
            throw new Error("useSignIn isn't loaded")
            return;
        }
        try {
            const completeSignIn = await signIn.create({
                identifier: credential.trim(),
                password,
            });
            await setActive({ session: completeSignIn.createdSessionId });

            navigation?.navigate('Map')
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
    }

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Sign In',
            }} />
            <View className='w-3/4 items-center justify-center font-[Inter-Regular]'>
                <Image
                    source={TuRutaImg}
                    alt='Tu-Ruta Logo'
                    className={`h-16 w-14`}
                />
                <Text className='font-bold text-3xl my-4 text-center'>Iniciar Sesión en La Ruta</Text>
            </View>
            <SignWithOAuth action={'sign-up'} />
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

            <PressBtn onPress={() => { void handleSignIn() }} className={'w-[240px] max-w-[280px] bg-[#FCCB6F] my-2 dark:bg-white rounded-3xl h-12 justify-center items-center'} >
                <Text className={'dark:text-black text-white font-bold text-lg'}>Iniciar Sesión</Text>
            </PressBtn>
            <Pressable className={'my-4 flex-row items-center justify-center'} onPress={() => { navigation && navigation.navigate('Sign-Up') }}>
                <Text className={'text-sm font-light dark:text-gray-400'}>No Tienes Cuenta?</Text>
                <Text className={'text-[#2e78b7] font-normal ml-1 text-sm'}>Crear Cuenta</Text>
            </Pressable>
        </View>
    );
}