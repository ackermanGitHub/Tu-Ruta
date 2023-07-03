import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    Pressable,
    Animated,
    StatusBar,
} from "react-native";

import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { NightMap } from '../styles/NightMap';
import MapView, { Circle, Marker, type MapMarker, type Region, MarkerAnimated } from 'react-native-maps';

import { type MarkerData } from '../constants/Markers';
import useMapConnection from '../hooks/useMapConnection';

import { View } from '../styles/Themed';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Colors from '../styles/Colors';

import { useUser } from '@clerk/clerk-expo';
import useFadeIn from '../hooks/useFadeIn';
import usePressIn from '../hooks/usePressIn';
import { useColorScheme } from 'nativewind';

import { useKeepAwake } from 'expo-keep-awake';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

// "emailAddress": "julio.sergio2709@gmail.com", "id": "idn_2RJhwToHB8RbifJBZlXZ5jWn8D4"

const snapPoints = ["25%", "48%", "75%"];

const MapViewComponent = () => {


    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const [userSelected, setUserSelected] = useState(false);

    const userMarkerRef = useRef<MapMarker>(null);
    const mapViewRef = useRef<MapView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);


    const { user, isLoaded, isSignedIn } = useUser()
    const { colorScheme } = useColorScheme();
    useKeepAwake();

    const { animatedValue: fadeNavAnim, fadeIn: fadeInNav, fadeOut: fadeOutNav, isVisible: isNavVisible } = useFadeIn({ defaultValue: true })
    const { animatedValue: pressNavAnim, handlePressIn: pressInNav, handlePressOut: pressOutNav/* , isPressed: isNavPressed */ } = usePressIn()
    const [_isModalVisible, setIsModalVisible] = useState(false);

    const { markers, location, /* setLocation, historyLocation */ } = useMapConnection();

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
    }, [selectedMarkerIndex]);

    const animateToRegion = (region: Region) => {
        mapViewRef.current && mapViewRef.current.animateToRegion(region)
    }

    const handleMarkerPress = (index: number) => {
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
                        fadeOutNav()
                    }}
                    onTouchEnd={() => {
                        fadeInNav()
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
                    customMapStyle={colorScheme === 'dark' ? NightMap : undefined}
                >

                    {markers.map((marker: MarkerData, index: number) => {
                        return (
                            <Marker
                                draggable
                                key={index}
                                coordinate={marker.coordinate}
                                onPress={() => handleMarkerPress(index)}
                            >
                                <Animated.View className={'items-center justify-center'}>
                                    <Animated.Image
                                        source={{
                                            uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                        }}
                                        className={'w-12 h-12 p-4 bg-slate-100 rounded-md'}
                                        resizeMode="cover"
                                    />
                                </Animated.View>
                            </Marker>
                        );
                    })}

                    {location &&
                        <>
                            <MarkerAnimated
                                ref={userMarkerRef}
                                coordinate={location.coords}
                                anchor={{ x: 0.5, y: 0.5 }}
                                onPress={() => {
                                    openUserProfile();
                                }}
                            >
                                <Animated.View className={'items-center justify-center w-12 h-12'} >
                                    {
                                        isSignedIn ?
                                            <>
                                                <Animated.Image className={'w-8 h-8 rounded-full'} source={{
                                                    uri: "https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c"
                                                }} resizeMode="cover" />
                                            </>
                                            :
                                            <>
                                                <FontAwesome
                                                    name={colorScheme === 'light' ? 'user-circle' : 'user-circle-o'}
                                                    size={30}
                                                    color={Colors[colorScheme ?? 'light'].text}
                                                />
                                            </>
                                    }
                                </Animated.View>
                            </MarkerAnimated  >
                            {
                                location && (
                                    <Circle
                                        center={{
                                            latitude: location.coords.latitude,
                                            longitude: location.coords.longitude,
                                        }}
                                        radius={location.coords.accuracy || 0}
                                        strokeColor="#111111"
                                        fillColor="rgba(26, 18, 11, 0.3)"
                                    />
                                )
                            }
                        </>
                    }

                </MapView>

                <>
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
                            }}
                        >
                            <MaterialIcons
                                name={location ? 'my-location' : 'location-searching'}
                                size={50}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </Pressable>
                    </Animated.View>
                </>

                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    backgroundStyle={{ borderRadius: 50, backgroundColor: '#555555' }}

                    onDismiss={() => {
                        setIsModalVisible(false)
                        setUserSelected(false)
                    }}
                >
                    <View className={'w-full h-full rounded-t-3xl overflow-hidden'}>
                        {userSelected && isSignedIn && isLoaded && (
                            <View className='w-full h-56 relative'>
                                <Animated.Image
                                    source={{
                                        uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                    }}
                                    className={'w-full h-48'}
                                    resizeMode="cover"
                                />
                                <View className={'absolute left-5 bottom-2 border-2 border-solid border-white dark:border-black w-16 h-16 rounded-full overflow-hidden'}>
                                    <Animated.Image
                                        source={{
                                            uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                                        }}
                                        className={'w-16 h-16'}
                                        resizeMode="cover"
                                    />
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