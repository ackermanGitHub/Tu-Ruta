import { useState, useRef } from 'react'
import { Dimensions, LayoutAnimation, Pressable, TouchableWithoutFeedback } from 'react-native';

import { View, Text } from '../styles/Themed';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Colors from '../styles/Colors';
import { PressBtn } from '../styles/PressBtn';

import { useAtom, } from 'jotai';
import { atomWithStorage, createJSONStorage, } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage'


import { type MarkerData } from '../constants/Markers';
const storedUserMarkers = createJSONStorage<MarkerData[]>(() => AsyncStorage)
export const userMarkersAtom = atomWithStorage<MarkerData[]>('userMarkers', [], storedUserMarkers)


const selectableMarkerIcons = [
    ["MCI", "airplane-marker"],
    ["MCI", "archive-marker"],
    ["MCI", "book-marker"],
    ["MCI", "bus-marker"],
    ["MCI", "camera-marker"],
    ["MCI", "cash-marker"],
    ["MCI", "cellphone-marker"],
    ["MCI", "credit-card-marker"],
]

const SelectMarkerIcon: React.FC<{
    onConfirmFn: () => void
}> = ({ onConfirmFn }) => {

    const { width, height } = Dimensions.get('window');
    const { colorScheme } = useColorScheme();

    const [userMarkers, _setUserMarkers] = useAtom(userMarkersAtom)

    const [isSelectMarkerIconOpen, setIsSelectMarkerIconOpen] = useState(false);
    const [selectMarkerWidth, setSelectMarkerWidth] = useState(40);
    const [selectMarkerHeight, setSelectMarkerHeight] = useState(96);
    const addingMarkerDataRef = useRef<MarkerData | null>(null);

    const currentMarkerIconName =
        addingMarkerDataRef.current?.icon
            ? addingMarkerDataRef.current?.icon[1]
            : selectableMarkerIcons.find(markerIcon => !userMarkers.some(marker => marker.icon !== markerIcon))?.[1]

    const toggleSelectMarkerIcon = () => {
        LayoutAnimation.configureNext({
            duration: 300,
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
        const newWidth = isSelectMarkerIconOpen ? 40 : 136;
        const newHeight = isSelectMarkerIconOpen ? 96 : 216;

        setIsSelectMarkerIconOpen(!isSelectMarkerIconOpen)
        setSelectMarkerWidth(newWidth)
        setSelectMarkerHeight(newHeight)
    }

    const onMarkerIconPress = (markerIcon: string[]) => {
        addingMarkerDataRef.current = {
            coordinate: {
                latitude: 69.420,
                longitude: 69.420,
            },
            icon: markerIcon
        }
        toggleSelectMarkerIcon()
    }

    return (
        <>
            <View
                style={{
                    right: (width / 2) - 24,
                    top: (height / 2) - 48,
                }}
                className='absolute bg-transparent h-12 w-12 overflow-hidden justify-end items-center'
            >
                <MaterialIcons
                    name={'location-pin'}
                    size={48}
                    color={Colors[colorScheme ?? 'light'].text}
                />
            </View>
            {
                isSelectMarkerIconOpen &&
                <Pressable onPress={toggleSelectMarkerIcon} className='absolute w-full h-full z-10'>

                </Pressable>
            }
            <TouchableWithoutFeedback>
                <Pressable
                    onPress={!isSelectMarkerIconOpen ? toggleSelectMarkerIcon : undefined}
                    className={'absolute z-20 bottom-24 bg-black dark:bg-white rounded-3xl flex-row items-center'}
                    style={{
                        height: selectMarkerWidth,
                        width: selectMarkerHeight,
                        justifyContent: isSelectMarkerIconOpen ? 'center' : 'space-evenly',
                        flexWrap: isSelectMarkerIconOpen ? 'wrap' : 'nowrap',
                        flexDirection: isSelectMarkerIconOpen ? 'column' : 'row',
                        gap: isSelectMarkerIconOpen ? 6 : 0,
                        padding: isSelectMarkerIconOpen ? 8 : 0,
                    }}
                >
                    {
                        !isSelectMarkerIconOpen &&
                        <>
                            <MaterialCommunityIcons
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                name={currentMarkerIconName}
                                size={28}
                                color={Colors[colorScheme === 'dark' ? 'light' : 'dark'].text}
                            />
                            <MaterialIcons
                                name={'arrow-drop-up'}
                                size={24}
                                color={Colors[colorScheme === 'dark' ? 'light' : 'dark'].text}
                            />
                        </>
                    }
                    {
                        isSelectMarkerIconOpen &&
                        <>
                            {selectableMarkerIcons.map((markerIcon) => {
                                return (
                                    <Pressable
                                        key={markerIcon[1]}
                                        onPress={() => { onMarkerIconPress(markerIcon) }}
                                        style={{
                                            display: isSelectMarkerIconOpen ? 'flex' : 'none'
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-ignore
                                            name={markerIcon[1]}
                                            size={45}
                                            color={Colors[colorScheme === 'dark' ? 'light' : 'dark'].text}
                                        />
                                    </Pressable>
                                )
                            })}
                        </>
                    }
                </Pressable>
            </TouchableWithoutFeedback>

            <PressBtn
                onPress={onConfirmFn}
                className={'absolute z-20 bottom-5 h-12 max-[367px]:h-8 w-[200px] max-[367px]:w-[180px] bg-[#FCCB6F] dark:bg-white rounded-3xl justify-center items-center'}
            >
                <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base'}>Confirmar</Text>
            </PressBtn>

        </>
    )
}

export default SelectMarkerIcon