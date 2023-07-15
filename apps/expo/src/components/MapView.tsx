import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    Pressable,
    Animated,
    StatusBar,
    Switch
} from "react-native";
import MapViewDirections from 'react-native-maps-directions';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { NightMap } from '../styles/NightMap';
import MapView, { type MapMarker, type Region, PROVIDER_GOOGLE } from 'react-native-maps';

import { type MarkerData } from '../constants/Markers';
import useMapConnection from '../hooks/useMapConnection';

import { View, Text } from '../styles/Themed';
import { /* FontAwesome,  */MaterialIcons/* , Feather */, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../styles/Colors';
// import NetInfo from '@react-native-community/netinfo';

import { useUser } from '@clerk/clerk-expo';
import useFadeIn from '../hooks/useFadeIn';
import usePressIn from '../hooks/usePressIn';
import { useColorScheme } from 'nativewind';

import { useKeepAwake } from 'expo-keep-awake';
// import ProfileDropdown from './ProfileDropdown';
import { PressBtn } from '../styles/PressBtn';
import UserMarker from '../markers/UserMarker';
import CarMarker from '../markers/CarMarker';
import { profileRoleAtom, profileStateAtom } from "../hooks/useMapConnection";
import { useAtom } from 'jotai';
import { signMethodAtom } from './Sign-up';
import LayoutDropdown from './LayoutDropdown';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

// "emailAddress": "julio.sergio2709@gmail.com", "id": "idn_2RJhwToHB8RbifJBZlXZ5jWn8D4"
// Access Token: pk.434c2613d0817ab0dd86813cf59ea6de

const snapPoints = ["25%", "48%", "75%"];

const origin = { latitude: 23.121715394724493, longitude: -82.38003462553024 };
const destination = { latitude: 23.1286927367378, longitude: -82.39208780229092 };

const MapViewComponent = () => {
    const [profileRole, _setProfileRole] = useAtom(profileRoleAtom)
    const [profileState, setProfileState] = useAtom(profileStateAtom)
    const [signMethod, setSignMethod] = useAtom(signMethodAtom)

    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const [userSelected, setUserSelected] = useState(true);

    const _userMarkerRef = useRef<MapMarker>(null);
    const mapViewRef = useRef<MapView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);


    const { user, isLoaded, isSignedIn } = useUser()
    const { colorScheme } = useColorScheme();
    useKeepAwake();

    const { animatedValue: fadeNavAnim, fadeIn: _fadeInNav, fadeOut: _fadeOutNav, isVisible: _isNavVisible } = useFadeIn({ defaultValue: true })
    const { animatedValue: pressNavAnim, handlePressIn: pressInNav, handlePressOut: pressOutNav/* , isPressed: isNavPressed */ } = usePressIn()
    const [_isModalVisible, setIsModalVisible] = useState(false);

    const { markers, location, heading } = useMapConnection();

    useEffect(() => {
        if (selectedMarkerIndex !== null && mapViewRef.current) {
            const selectedMarker = markers[selectedMarkerIndex];
            if (selectedMarker) {
                mapViewRef.current.animateToRegion({
                    longitude: selectedMarker.coordinate.longitude,
                    latitude: selectedMarker.coordinate.latitude,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                });
            }
        }
    }, [markers, selectedMarkerIndex]);
    console.log("re-rendered mapview")

    const animateToRegion = (region: Region) => {
        mapViewRef.current && mapViewRef.current.animateToRegion(region)
    }

    const handleMarkerPress = (index: number) => {
        setUserSelected(false);
        setSelectedMarkerIndex(index);

        handlePresentModal();

        const marker = markers[index];

        if (marker) {
            animateToRegion({
                latitude: marker.coordinate.latitude,
                longitude: marker.coordinate.longitude,
                longitudeDelta: 0.0033333,
                latitudeDelta: 0.0033333,
            });
        }
    };

    const handlePresentModal = () => {
        bottomSheetModalRef.current?.present();
        setIsModalVisible(true);
    }

    const openUserProfile = () => {
        bottomSheetModalRef.current?.present();
        setUserSelected(true)
        setIsModalVisible(true);
    }


    return (
        <BottomSheetModalProvider>

            <View className={"bg-transparent w-full h-full"}>

                <MapView
                    onTouchMove={() => {
                        // _fadeOutNav()
                    }}
                    onTouchEnd={() => {
                        // _fadeInNav()
                    }}
                    className={"w-full h-full"}
                    initialRegion={{
                        latitude: 23.118644,
                        longitude: -82.3806211,
                        latitudeDelta: 0.0322,
                        longitudeDelta: 0.0221,
                    }}
                    showsCompass={false}
                    ref={mapViewRef}
                    provider={PROVIDER_GOOGLE}
                    customMapStyle={colorScheme === 'dark' ? NightMap : undefined}
                >

                    {markers.map((marker: MarkerData, index: number) => {
                        return (
                            <CarMarker key={index} onPress={() => handleMarkerPress(index)} coordinate={marker.coordinate} description='' title='' imageURL='' />
                        );
                    })}

                    {location && <UserMarker onPress={openUserProfile} coordinate={location.coords} description='' title='' userId='' heading={heading} />}

                    <MapViewDirections
                        origin={origin}
                        destination={destination}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY || ""}
                        strokeWidth={3}
                        strokeColor="blue"

                    />
                </MapView>


                <Animated.View
                    className={'bg-transparent absolute z-20 bottom-24 right-12 flex-row justify-center items-center text-center self-center rounded-full'}
                    style={[
                        {
                            transform: [
                                {
                                    scale: pressNavAnim
                                },
                            ],
                            opacity: fadeNavAnim,
                        },
                    ]}
                >
                    <Pressable
                        onPressIn={() => {
                            pressInNav();
                        }}
                        onPressOut={() => {
                            pressOutNav();
                        }}
                        onPress={() => {
                            if (location) {
                                animateToRegion({
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                    longitudeDelta: 0.0033333,
                                    latitudeDelta: 0.0033333,
                                });
                            }
                            openUserProfile()
                        }}
                    >
                        <MaterialIcons
                            name={location ? 'my-location' : 'location-searching'}
                            size={50}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </Pressable>
                </Animated.View>

                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    backgroundStyle={{ borderRadius: 50, backgroundColor: colorScheme === 'light' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)' }}
                    /* backgroundStyle={{ borderRadius: 50, backgroundColor: colorScheme === 'light' ? 'white' : 'black' }} */
                    onDismiss={() => {
                        setIsModalVisible(false)
                        setUserSelected(false)
                    }}
                >
                    <View className={'w-full h-full rounded-t-3xl overflow-hidden'}>

                        {selectedMarkerIndex !== null && !userSelected && (
                            <View className='w-full h-full'>

                                <Animated.Image
                                    source={{
                                        uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                    }}
                                    className={'w-full h-48'}
                                    resizeMode="cover"
                                />

                                <View className={'absolute left-5 top-40 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                                    <Animated.Image
                                        source={{
                                            uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                        }}
                                        className={'w-16 h-16'}
                                        resizeMode="cover"
                                    />
                                </View>

                                <View className={'w-full h-20 justify-between flex-row bg-transparent'}>
                                    <View className='bg-transparent h-full justify-end ml-5'>
                                        <Text className='font-bold text-lg'>Julio López</Text>
                                        <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@julydev</Text>
                                    </View>
                                    <View className='flex-row h-full justify-between items-center'>
                                        <MaterialCommunityIcons
                                            name={colorScheme === 'dark' ? "message-text" : "message-text-outline"}
                                            size={24}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    </View>
                                </View>

                                <View className={'w-full mt-2 justify-start flex-row bg-transparent'}>
                                    <View className='bg-transparent h-full justify-start mx-5'>
                                        <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum recusandae similique, at porro quisquam enim officiis nam iure, tempora perspiciatis laborum ducimus fugiat voluptatibus eum saepe cumqu</Text>
                                    </View>
                                </View>

                            </View>
                        )}

                        {(userSelected && isSignedIn && isLoaded) && (
                            <View className='w-full h-full'>

                                <Animated.Image
                                    source={{
                                        uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                    }}
                                    className={'w-full h-48'}
                                    resizeMode="cover"
                                />

                                <LayoutDropdown />

                                <View className={'absolute left-5 top-40 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                                    <Animated.Image
                                        source={{
                                            uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                        }}
                                        className={'w-16 h-16'}
                                        resizeMode="cover"
                                    />
                                </View>

                                <View className={'w-full h-20 justify-between flex-row bg-transparent'}>
                                    <View className='bg-transparent h-full justify-end ml-5'>
                                        <Text className='font-bold text-lg'>{`${user.firstName} ${user.lastName}`}</Text>
                                        <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@{`${user.username}`}</Text>
                                    </View>
                                    <PressBtn onPress={() => { return }}>
                                        <View className=' h-10 w-32 mt-3 mr-5 justify-center items-center rounded-2xl border-zinc-400 dark:border-zinc-800'>
                                            <Text className='font-bold text-base'>Editar Perfil</Text>
                                        </View>
                                    </PressBtn>
                                </View>
                                <View className={'w-full mt-2 justify-start flex-row bg-transparent'}>
                                    <View className='bg-transparent h-full justify-start mx-5'>
                                        <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum recusandae similique, at porro quisquam enim officiis nam iure, tempora perspiciatis laborum ducimus fugiat voluptatibus eum saepe cumqu</Text>
                                    </View>
                                </View>

                                <View className='flex-row w-full items-center justify-center gap-3'>
                                    <Text>Is Active?</Text>
                                    <Switch value={profileState === 'active'} onValueChange={() => { void setProfileState(profileState === 'active' ? 'inactive' : 'active') }} />
                                </View>

                                <View className='flex-row w-full items-center justify-center gap-3'>
                                    <Text>Role</Text>
                                    <Text>{profileRole}</Text>
                                </View>


                            </View>
                        )}
                    </View>
                </BottomSheetModal>

            </View>

            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

        </BottomSheetModalProvider>
    );
};

export default MapViewComponent