/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    /* Dimensions, */
    useColorScheme,
    Pressable,
    Switch,
    Animated,
    StatusBar,
} from "react-native";
//import { type DrawerNavigationProp } from '@react-navigation/drawer';

import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { NightMap } from '../styles/NightMap';
import MapView, { Circle, Marker, type MapMarker, type Region, MarkerAnimated } from 'react-native-maps';

import { type MarkerData } from '../constants/Markers';
import useMapConnection from '../hooks/useMapConnection';

import { View, Text } from '../styles/Themed';
import { AntDesign, Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Colors from '../styles/Colors';

import { useUser } from '@clerk/clerk-expo';
import useFadeIn from '../hooks/useFadeIn';
import usePressIn from '../hooks/usePressIn';

// Image.prefetch("https://i.imgur.com/sNam9iJ.jpg")
void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

// "emailAddress": "julio.sergio2709@gmail.com", "id": "idn_2RJhwToHB8RbifJBZlXZ5jWn8D4"

// const { width,  height } = Dimensions.get("window");

const snapPoints = ["25%", "48%", "75%"];
// const CARD_HEIGHT = height / 4;
// const CARD_WIDTH = CARD_HEIGHT - 50;

// type UserRole = 'taxi' | 'client'

const MapViewComponent = (/* { role = 'client', navigation }: { role?: UserRole, navigation?: DrawerNavigationProp<any> } */) => {


    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const [darkmode, setDarkmode] = useState(false);
    const [device, setDevice] = useState(false);
    const [theme, setTheme] = useState("dim");

    const userMarkerRef = useRef<MapMarker>(null);
    const mapViewRef = useRef<MapView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const { /* user, isLoaded, */ isSignedIn } = useUser()
    const colorScheme = useColorScheme();

    const { animatedValue: fadeNavAnim, fadeIn: fadeInNav, fadeOut: fadeOutNav, isVisible: isNavVisible } = useFadeIn({ defaultValue: true })
    const { animatedValue: pressNavAnim, handlePressIn: pressInNav, handlePressOut: pressOutNav/* , isPressed: isNavPressed */ } = usePressIn()
    const [_isModalVisible, setIsModalVisible] = useState(false);

    const { markers, location, /* setLocation, historyLocation */ } = useMapConnection({
        onLocationLoad: (location) => {
            console.log(location)
        }
    });

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

    const onRegionChangeComplete = (region: Region) => {
        console.log(region)
    }

    function handlePresentModal() {
        bottomSheetModalRef.current?.present();
        setIsModalVisible(true);
    }

    return (
        <BottomSheetModalProvider>
            <View className={"bg-transparent w-full h-full"}>
                <MapView.Animated
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
                    onRegionChangeComplete={onRegionChangeComplete}
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
                                /* coordinate={currentPosition} */
                                anchor={{ x: 0.5, y: 0.5 }}
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

                </MapView.Animated>
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
                    backgroundStyle={{ borderRadius: 50 }}
                    onDismiss={() => setIsModalVisible(false)}
                >
                    <View className={'w-full h-full p-4'}>
                        <Text className={'text-base font-extrabold mb-5 '}>Dark mode</Text>
                        <View className={'w-full flex-row items-center justify-between my-2'}>
                            <Text className={'text-base font-bold'}>Dark mode</Text>
                            <Switch
                                value={darkmode}
                                onChange={() => { setDarkmode(!darkmode) }}
                            />
                        </View>
                        <View className={'w-full flex-row items-center justify-between my-2'}>
                            <Text className={'text-base font-bold'}>Use device settings</Text>
                            <Switch value={device} onChange={() => { setDevice(!device) }} />
                        </View>
                        <Text className={'text-[#56636F] w-full text-sm'}>
                            Set Dark mode to use the Light or Dark selection located in your
                            device Display and Brightness settings.
                        </Text>
                        <View
                            className={'w-screen border-b-2 border-solid border-gray-400 my-7'}
                        />
                        <Text className={'text-base font-extrabold mb-5 w-full'}>Theme</Text>
                        <Pressable className={'w-full flex-row items-center justify-between my-2'} onPress={() => setTheme("dim")}>
                            <Text className={'text-base font-bold'}>Dim</Text>
                            {theme === "dim" ? (
                                <AntDesign name="checkcircle" size={24} color="#4A98E9" />
                            ) : (
                                <Entypo name="circle" size={24} color="#56636F" />
                            )}
                        </Pressable>
                        <Pressable className={'w-full flex-row items-center justify-between my-2'} onPress={() => setTheme("lightsOut")}>
                            <Text className={'text-base font-bold'}>Lights out</Text>
                            {theme === "lightsOut" ? (
                                <AntDesign name="checkcircle" size={24} color="#4A98E9" />
                            ) : (
                                <Entypo name="circle" size={24} color="#56636F" />
                            )}
                        </Pressable>
                    </View>
                </BottomSheetModal>
            </View>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        </BottomSheetModalProvider>
    );
};

export default MapViewComponent