import React, { useRef, useState } from 'react';
import {
    Text,
    View,
    ActivityIndicator,
    Pressable,
    Animated,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Colors from '../styles/Colors';
import { useColorScheme } from 'nativewind';
import { PressBtn } from '../styles/PressBtn';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';

const ProfileDropdown = () => {
    const DropdownButton = useRef<View>(null);
    const [dropdownTop, setDropdownTop] = useState(0);
    const dropdownVisible = useRef(new Animated.Value(1)).current;

    const { colorScheme } = useColorScheme()

    const { user, isLoaded, isSignedIn } = useUser();


    const handleOpenDropdown = () => {
        Animated.timing(dropdownVisible, {
            toValue: 1,
            duration: 175,
            useNativeDriver: true,
        }).start();
        DropdownButton?.current?.measure((_fx: number, _fy: number, _w: number, h: number, _px: number, py: number) => {
            setDropdownTop(py + h);
        });
    };

    const handleCloseDropdown = () => {
        Animated.timing(dropdownVisible, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    if (!isLoaded) {
        return (
            <View className={'w-full flex-row justify-start items-center bg-transparent px-5'}>
                <ActivityIndicator
                    size={'large'}
                    animating
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                />
            </View>
        )
    }

    if (!isSignedIn) {
        return (
            <View className={'w-full flex-row justify-start items-center bg-transparent px-5'}>
                <FontAwesome
                    name={colorScheme === 'light' ? 'user-circle' : 'user-circle-o'}
                    size={30}
                    color={Colors[colorScheme ?? 'light'].text}
                />
                <PressBtn onPress={() => {
                    console.log("sign in")
                }} className={`w-[60px] max-w-[120px] ml-5 bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center`} >
                    <Text className={`text-white`}>Sign In</Text>
                </PressBtn>
            </View>
        )
    }

    return (
        <>
            <View className={`w-full justify-between flex-row items-center bg-transparent px-5`}>

                <View className="w-full bg-transparent flex-row items-center">
                    <Image
                        source={{
                            uri: "https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c"
                        }}
                        alt="Profile Image"
                        className={`w-8 h-8 rounded-full`}
                    />
                    <Text className="ml-5">{`${user.firstName} ${user.lastName}`}</Text>
                </View>
                <Pressable
                    ref={DropdownButton}
                    onPress={handleOpenDropdown}
                >
                    <Feather
                        name='more-vertical'
                        size={20}
                        color={Colors[colorScheme ?? 'light'].text}
                    />
                </Pressable>

            </View>

            <Animated.View
                className='absolute left-0 top-0 bg-red-500 dark:bg-zinc-800 shadow-sm dark:shadow-zinc-300 rounded-md w-64 h-64'
                style={[
                    /* {
                        top: dropdownTop
                    }, */
                    {
                        transform: [{ scale: dropdownVisible }],
                    },
                ]}
            >
                <Pressable onPress={() => { console.log("Cerrar Sesión") }}>
                    <Text>Cerrar Sesión</Text>
                </Pressable>
                <Pressable onPress={() => { handleCloseDropdown() }}>
                    <Text>Cambiar Imagen</Text>
                </Pressable>
                <Pressable onPress={() => { console.log("Cambiar Nombre") }}>
                    <Text>Cambiar Nombre</Text>
                </Pressable>
            </Animated.View>

        </>
    )
};


export default ProfileDropdown;