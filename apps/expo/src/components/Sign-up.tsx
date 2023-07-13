import React, { useState } from 'react';
import {
    NativeModules,
    LayoutAnimation, TextInput/* , Pressable */, useColorScheme, ActivityIndicator
} from 'react-native';
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

const { UIManager } = NativeModules;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default function SignUp({ navigation }: { navigation?: DrawerNavigationProp<DrawerParamList> }) {

    const { isLoaded, signUp, setActive } = useSignUp();
    const colorScheme = useColorScheme();

    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [emailError, _setEmailError] = useState('');

    const [oauthCompleted, setOauthCompleted] = useState(false)
    const [isInfoProvided, setIsInfoProvided] = useState(false)

    const [firstName, setFirstName] = useState('');
    const [firstNameError, _setFirstNameError] = useState('');

    const [lastName, setLastName] = useState('');
    const [lastNameError, _setLastNameError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, _setPasswordError] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [phoneError, setPhoneError] = useState('');

    const [code, setCode] = useState("");
    const [codeError, _setCodeError] = useState('');

    const [isReduced, setIsReduced] = useState(false)

    const reduceLogo = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsReduced(true)
    }

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

            await signUp.update({
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

            const completeVerifyPhone = await signUp.attemptPhoneNumberVerification({
                code,
            });

            await setActive({ session: completeVerifyPhone.createdSessionId })

            navigation?.navigate('Map');

            setIsPhoneVerified(true)
            setPendingVerification(false);
            setIsLoading(false);

        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            setIsLoading(false);
        }
    };

    const handleProvidedInfo = async () => {

        if (!isLoaded) {
            return;
        }

        try {
            setIsLoading(true);

            await signUp.create({
                emailAddress: email.trim(),
                password: password.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });

            setIsInfoProvided(true);
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

            <View
                className='w-1/2 items-center justify-center font-[Inter-Regular]'
                style={{
                    display: isReduced ? 'none' : 'flex',
                }}
            >
                <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    className='font-bold text-3xl text-center max-[367px]:text-2xl'
                >Bienvenido Otra Vez</Text>
                <Image
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    source={TuRutaLogo}
                    alt='Tu-Ruta Logo'
                    className='h-16 w-14 max-[367px]:h-12 max-[367px]:w-12 max-[340px]:h-12 max-[340px]:w-10 mt-4 max-[367px]:my-0'
                />
            </View>

            {(oauthCompleted || isInfoProvided) && !pendingVerification && !isPhoneVerified && (
                <>
                    <View className={'relative w-4/5 max-[367px]:w-2/3 my-4 max-[367px]:my-2 flex-row justify-center items-center'}>
                        <View className='w-4/5 flex-row justify-center items-center'>
                            <View className='h-12 max-[367px]:h-10 w-[20%] border border-r-0 rounded-l border-gray-300 dark:border-gray-600 dark:bg-transparent justify-center items-center'>
                                <Text className='text-gray-500 dark:text-slate-500'>+53</Text>
                            </View>
                            <TextInput
                                className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded-r border-gray-300 dark:border-gray-600 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                                placeholder="Número de Móvil"
                                autoCapitalize="none"
                                keyboardType='numeric'
                                placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                                onChangeText={setPhoneNumber}
                                value={phoneNumber}

                                onFocus={() => {
                                    reduceLogo()
                                }}
                            />
                        </View>
                        {
                            phoneError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
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
                    <View className='w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center relative'>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded border-gray-300 dark:border-gray-800 dark:bg-transparent text-gray-500 dark:text-slate-500'}
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            value={code}
                            placeholder="Codigo"
                            onChangeText={(code) => setCode(code)}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            codeError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
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

            {!oauthCompleted && !isInfoProvided && (
                <>
                    <SignWithOAuth afterOauthFlow={() => {
                        setOauthCompleted(true)
                    }} action={'sign-up'} phoneNumber={phoneNumber} password={password} isReduced={isReduced} isPhoneVerified={isPhoneVerified} SignUp={signUp} />
                    <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center relative'}>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Email"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setEmail}
                            value={email}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            emailError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>
                    <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center'}>
                        <TextInput
                            className={'h-12 max-[367px]:h-10 w-4/5 px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                            placeholder="Contraseña"
                            autoCapitalize="none"
                            placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                            onChangeText={setPassword}
                            value={password}

                            onFocus={() => {
                                reduceLogo()
                            }}
                        />
                        {
                            passwordError &&
                            <View className='absolute right-2 my-auto'>
                                <MaterialIcons
                                    name='error'
                                    size={24}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </View>
                        }
                    </View>

                    <View className={'w-4/5 max-[367px]:w-2/3 mb-4 max-[367px]:mb-2 justify-center items-center'}>
                        <View className='w-4/5 flex-row justify-between items-center'>
                            <View className='w-[47%] relative'>
                                <TextInput
                                    className={'h-12 max-[367px]:h-10 w-full px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                                    placeholder="Nombre"
                                    autoCapitalize="none"
                                    placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                                    onChangeText={setFirstName}
                                    value={firstName}

                                    onFocus={() => {
                                        reduceLogo()
                                    }}
                                />
                                {
                                    firstNameError &&
                                    <View className='absolute right-2 my-auto'>
                                        <MaterialIcons
                                            name='error'
                                            size={24}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    </View>
                                }
                            </View>
                            <View className='w-[47%] relative'>
                                <TextInput
                                    className={'h-12 max-[367px]:h-10 w-full px-4 border rounded border-gray-300 dark:bg-transparent dark:border-gray-600 text-gray-500 dark:text-slate-500'}
                                    placeholder="Apellido"
                                    autoCapitalize="none"
                                    placeholderTextColor={colorScheme === 'dark' ? "rgb(107 114 128)" : "rgb(100 116 139)"}
                                    onChangeText={setLastName}
                                    value={lastName}

                                    onFocus={() => {
                                        reduceLogo()
                                    }}
                                />
                                {
                                    lastNameError &&
                                    <View className='absolute right-2 my-auto'>
                                        <MaterialIcons
                                            name='error'
                                            size={24}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    </View>
                                }
                            </View>
                        </View>
                    </View>

                    <PressBtn onPress={() => { void handleProvidedInfo() }} className={'w-[200px] max-[367px]:w-[180px] max-w-[280px] bg-[#FCCB6F] mb-2 dark:bg-white rounded-3xl h-12 max-[367px]:h-8 flex-row justify-center items-center'} >
                        <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base mr-3'}>Continuar</Text>
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