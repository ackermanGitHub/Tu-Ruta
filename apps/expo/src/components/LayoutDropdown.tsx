import React, { useState } from 'react';
import {
    NativeModules,
    LayoutAnimation,
    Pressable,
    /* TouchableWithoutFeedback, */
    Platform
} from 'react-native';

import { Text, View } from '../styles/Themed';
import { Feather } from '@expo/vector-icons';
import Colors from '../styles/Colors';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@clerk/clerk-expo';

const { UIManager } = NativeModules;

if (Platform.OS === 'android') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LayoutDropdown = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { colorScheme } = useColorScheme();
    const { isLoaded, signOut } = useAuth();

    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);

    const handleOpenDropdown = () => {
        LayoutAnimation.configureNext({
            duration: 500,
            update: {
                type: 'easeIn',
                property: 'scaleXY',
            }
        })
        setWidth(150)
        setHeight(150)
        setIsOpen(true)
    };

    const handleCloseDropdown = () => {
        LayoutAnimation.configureNext({
            duration: 500,
            update: {
                type: 'easeOut',
                property: 'scaleXY',
            }
        })
        setWidth(1)
        setHeight(1)
        setIsOpen(false)
    };

    return (
        <>
            <View
                className='absolute z-30 right-5 top-5 justify-evenly bg-gray-200 dark:bg-zinc-900 shadow-sm dark:shadow-zinc-300 rounded-md'
                style={{
                    width,
                    height,
                }}

            >
                <Pressable onPress={() => { console.log("Cambiar Imagen") }}>
                    <Text className='text-sm '>Cambiar Imagen</Text>
                </Pressable>
                <Pressable onPress={() => { console.log("Cambiar Nombre") }}>
                    <Text className='text-sm '>Cambiar Nombre</Text>
                </Pressable>
                <Pressable onPress={() => {
                    console.log('closing session')
                    if (isLoaded) {
                        void signOut()
                    }
                }}>
                    <Text className='text-sm '>Cerrar Sesión</Text>
                </Pressable>
            </View>

            <Pressable
                onPress={handleOpenDropdown}
                className='w-8 h-8 absolute justify-center items-center rounded-full right-5 top-5 z-20'
                style={{
                    backgroundColor: colorScheme === 'light' ? 'white' : 'black',
                }}
            >
                <Feather
                    name='more-vertical'
                    size={20}
                    color={Colors[colorScheme ?? 'light'].text}
                />
            </Pressable>

            <Pressable onPress={handleCloseDropdown}
                style={{
                    display: isOpen ? 'flex' : 'none',
                }}
                className='w-full h-full absolute z-20'
            />

        </>
    )
};


export default LayoutDropdown;