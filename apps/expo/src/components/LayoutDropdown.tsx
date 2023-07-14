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

    const [width, setWidth] = useState(32);
    const [height, setHeight] = useState(32);

    const handleOpenDropdown = () => {
        LayoutAnimation.configureNext({
            duration: 500,
            update: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            create: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            delete: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
        })
        setWidth(150)
        setHeight(150)
        setIsOpen(true)
    };

    const handleCloseDropdown = () => {
        LayoutAnimation.configureNext({
            duration: 500,
            update: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            create: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
            delete: {
                type: 'easeInEaseOut',
                property: 'scaleXY',
            },
        })
        setWidth(32)
        setHeight(32)
        setIsOpen(false)
    };

    return (
        <>
            <Pressable
                onPress={handleOpenDropdown}
                className='absolute justify-center items-center right-5 top-5 z-50'
                style={{
                    backgroundColor: colorScheme === 'light' ? 'white' : 'black',
                    width,
                    height,
                    borderRadius: isOpen ? 5 : 150,
                    justifyContent: isOpen ? 'space-evenly' : 'center',
                    alignItems: 'center',
                }}
            >
                {
                    !isOpen && <Feather
                        name='more-vertical'
                        size={20}
                        color={Colors[colorScheme ?? 'light'].text}
                    />
                }

                {isOpen &&
                    <>
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
                    </>
                }

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