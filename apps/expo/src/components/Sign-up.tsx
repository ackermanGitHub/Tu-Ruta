import React, { useState } from 'react';
import { TextInput, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import { View, Text } from '../styles/Themed';
import { useSignUp } from "@clerk/clerk-expo";
import { Stack } from 'expo-router';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { PressBtn } from '../styles/PressBtn';
import SignWithOAuth from './SignWithOAuth';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TuRutaLogo from '../../assets/Logo.png'
import { type DrawerParamList } from '../app';
import Colors from '../styles/Colors';

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { isLoaded, signUp, setActive } = useSignUp();
    const colorScheme = useColorScheme();

    const [inputFocused, _setInputFocused] = useState(true)
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [phoneError, setPhoneError] = useState('');

    const [code, setCode] = useState("");

    const isValidPhone = (phoneNumber: string) => {
        // Check if the phone number has exactly 8 digits
        if (phoneNumber.length !== 8) {
            setPhoneError('¿Por qué su numero no tiene 8 cifras? 🤨')
            return false;
        }

        // Check if the first digit is 5
        if (phoneNumber.charAt(0) !== '5') {
            setPhoneError('Su número no comienza por 5 😐')
            return false;
        }

        // Check if all characters are digits
        for (let i = 0; i < phoneNumber.length; i++) {
            if (isNaN(Number(phoneNumber.charAt(i)))) {
                setPhoneError('Todos los caractéres deben ser números 🤌')
                return false;
            }
        }

        setPhoneError('')
        return true;
    }

    const handleSendCode = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);
            const isValid = isValidPhone(phoneNumber.trim())

            if (!isValid) {
                return
            }
            await signUp.create({
                phoneNumber: '53' + phoneNumber.trim(),
            })
            await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });

            setIsLoading(false);
            setPendingVerification(true);

        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    }

    const handleVerifyPhone = async () => {

        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);
            await signUp.attemptPhoneNumberVerification({
                code,
            });

            setIsPhoneVerified(true)
            setPendingVerification(false);
            setIsLoading(false);

        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {

        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);

            const completeSignUp = await signUp.update({
                emailAddress: email.trim(),
                password: password.trim(),
            });
            await setActive({ session: completeSignUp.createdSessionId })
            /* await fetch('https://192.168.66.191:3333/addNewProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                     
                })
            }) */
            console.log(completeSignUp.createdSessionId)
            setIsPhoneVerified(true)
            setIsLoading(false);

        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    };

    return (
        <View className={'w-full h-full justify-center items-center'}>
            <Stack.Screen options={{
                title: 'Sign Up',
            }} />

            {
                inputFocused && <View className='w-1/2 items-center justify-center font-[Inter-Regular]'>
                    <Text
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        className='font-bold text-3xl text-center max-[367px]:text-2xl'
                    >Bienvenido a Tu Ruta</Text>
                    <Image
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        source={TuRutaLogo}
                        alt='Tu-Ruta Logo'
                        className={`h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 my-4 max-[367px]:my-0`}
                    />
                </View>
            }

            {!pendingVerification && !isPhoneVerified && !isPhoneVerified && (
                <>
                    <View className={'relative w-3/5 max-[367px]:w-2/3 max-w-[320px] mb-4 max-[367px]:mb-2 flex-row justify-center items-center'}>
                        <View className='h-12 max-[367px]:h-10 w-[20%] border border-r-0 rounded-l border-gray-300 dark:border-gray-600 dark:bg-transparent justify-center items-center'>
                            <Text className='text-gray-500 dark:text-slate-500'>+53</Text>
                        </View>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded-r border-gray-300 dark:border-gray-600 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholder="Número de Móvil"
                            autoCapitalize="none"
                            keyboardType='numeric'
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setPhoneNumber}
                            value={phoneNumber}

                        />
                        <View className='absolute right-2 my-auto'>
                            <MaterialIcons
                                name='error'
                                size={24}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </View>
                    </View>

                    <PressBtn onPress={() => { void handleSendCode() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Continuar</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>
                </>
            )}

            {pendingVerification && (
                <>
                    <View className='w-4/5 max-[367px]:w-2/3 max-w-[320px] mb-4 max-[367px]:mb-2 justify-center items-center'>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded border-gray-300 dark:border-gray-800 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            value={code}
                            placeholder="Codigo"
                            onChangeText={(code) => setCode(code)}
                        />
                    </View>
                    <PressBtn onPress={() => { void handleVerifyPhone() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Verificar</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>
                </>
            )}

            {isPhoneVerified && (
                <>
                    <SignWithOAuth action={'sign-up'} phoneNumber={phoneNumber} />
                    <View className={'w-4/5 max-[367px]:w-2/3 max-w-[320px] mb-4 max-[367px]:mb-2 justify-center items-center'}>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Email"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setEmail}
                            value={email}
                        />
                    </View>
                    <View className={'w-4/5 max-[367px]:w-2/3 max-w-[320px] mb-4 max-[367px]:mb-2 justify-center items-center'}>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-[80%] px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Contraseña"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setPassword}
                            value={password}
                        />
                    </View>

                    <PressBtn onPress={() => { void handleSignUp() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Crear Cuenta</Text>
                        {isLoading && <ActivityIndicator
                            size={'small'}
                            animating
                            color={colorScheme === 'light' ? 'white' : 'black'}
                        />}
                    </PressBtn>
                </>
            )}

            <PressBtn className={'flex-row items-center justify-center mt-2'} onPress={() => { navigation && navigation?.jumpTo('Sign-In') }}>
                <Text className={'text-sm max-[367px]:text-xs font-light dark:text-gray-400'}>Ya Tienes Cuenta?</Text>
                <Text className={'text-[#2e78b7] font-normal ml-1 text-sm max-[367px]:text-xs'}>Inicia Sesión</Text>
            </PressBtn>
        </View>
    );
}