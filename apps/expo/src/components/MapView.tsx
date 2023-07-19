import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Image,
    Animated,
    StatusBar,
    Switch,
    Platform,
    Dimensions,
    Easing,
    LayoutAnimation
} from "react-native";
import MapViewDirections from 'react-native-maps-directions';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { NightMap } from '../styles/NightMap';
import MapView, { type MapMarker, type Region, PROVIDER_GOOGLE, type LatLng, Marker, AnimatedRegion } from 'react-native-maps';

import { type MarkerData } from '../constants/Markers';
import useMapConnection from '../hooks/useMapConnection';

import { View, Text } from '../styles/Themed';
import { /*Feather, FontAwesome, */MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../styles/Colors';
// import NetInfo from '@react-native-community/netinfo';

import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';

import { useKeepAwake } from 'expo-keep-awake';
// import ProfileDropdown from './ProfileDropdown';
import { PressBtn } from '../styles/PressBtn';
import UserMarker from '../markers/UserMarker';
import CarMarker from '../markers/CarMarker';
import { profileRoleAtom, profileStateAtom } from "../hooks/useMapConnection";
import { useAtom, } from 'jotai';
import LayoutDropdown from './LayoutDropdown';

import { atomWithStorage, createJSONStorage, } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TouchableWithoutFeedback } from 'react-native';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

// "emailAddress": "julio.sergio2709@gmail.com", "id": "idn_2RJhwToHB8RbifJBZlXZ5jWn8D4"
// Access Token: pk.434c2613d0817ab0dd86813cf59ea6de

const snapPoints = ["25%", "48%", "75%"];

const origin = { latitude: 23.121715394724493, longitude: -82.38003462553024 };
const destination = { latitude: 23.1286927367378, longitude: -82.39208780229092 };

const storedIsRouteAnimating = createJSONStorage<'true' | 'false' | 'unknown'>(() => AsyncStorage)
export const isRouteAnimatingAtom = atomWithStorage<'true' | 'false' | 'unknown'>('isRouteAnimating', "false", storedIsRouteAnimating)

const storedUserMarkers = createJSONStorage<MarkerData[]>(() => AsyncStorage)
export const userMarkersAtom = atomWithStorage<MarkerData[]>('userMarkers', [], storedUserMarkers)

const MapViewComponent = () => {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMenuVisible, setIsMenuVisible] = useState(true)
    const navigationAnimValueRef = useRef(new Animated.Value(0)).current;

    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)
    const [profileRole, _setProfileRole] = useAtom(profileRoleAtom)
    const [profileState, setProfileState] = useAtom(profileStateAtom)
    // const [isRouteAnimating, setIsRouteAnimating] = useAtom(isRouteAnimatingAtom)

    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const [userSelected, setUserSelected] = useState(true);

    const _userMarkerRef = useRef<MapMarker>(null);
    const mapViewRef = useRef<MapView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const { user, isLoaded, isSignedIn } = useUser()
    const { colorScheme } = useColorScheme();
    useKeepAwake();

    const [_isModalVisible, setIsModalVisible] = useState(false);

    const [isAddingMarker, setIsAddingMarker] = useState(false);
    const addingMarkerDataRef = useRef<MarkerData & { coords: LatLng } | null>(null);

    const { markers, location, heading } = useMapConnection();

    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.003;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const [animRoute, _setAnimRoute] = useState<LatLng[]>([])

    const [route_count, set_route_count] = useState(0);
    const anim_route_marker_ref = useRef<MapMarker | null>(null)

    const [anim_route_marker, _set_anim_route_marker] = useState({
        cur_loc: {
            latitude: 23.1218644,
            longitude: -82.32806211,
        },
        destination_cords: {},
        is_loading: false,
        coordinate: new AnimatedRegion({
            latitude: 23.1218644,
            longitude: -82.32806211,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    })

    const getLiveLocation = useCallback(() => {
        console.log('locationCount: ', animRoute.length + ' - ' + 'count: ', route_count);
        if (animRoute.length !== route_count) {

            const latitude = animRoute[route_count + 1]?.latitude;
            const longitude = animRoute[route_count + 1]?.longitude;
            set_route_count(route_count + 1)

            if (!latitude || !longitude) {
                return
            }

            console.log('latitude  ', latitude);
            console.log('longitude  ', longitude);

            animate(latitude, longitude);

        } else {
            set_route_count(0)
        }
    }, [animRoute, route_count])

    const animate = (latitude: number, longitude: number) => {
        const newCoordinate = { latitude, longitude };

        if (Platform.OS == 'android') {
            if (anim_route_marker_ref.current) {
                // anim_route_marker_ref.current.animateMarkerToCoordinate(newCoordinate, 7000)
                // anim_route_marker.coordinate.timing({ ...newCoordinate, duration: 2000 }).start();

                anim_route_marker.coordinate.timing({
                    ...newCoordinate, duration: 2000, easing: Easing.linear,
                    toValue: 0,
                    useNativeDriver: false,
                    latitudeDelta: 0,
                    longitudeDelta: 0
                }).start();
                console.log("animateMarkerToCoordinate")
            }
        } else {
            anim_route_marker.coordinate.timing({
                ...newCoordinate, duration: 2000, easing: Easing.linear,
                toValue: 0,
                useNativeDriver: false,
                latitudeDelta: 0,
                longitudeDelta: 0
            }).start();
        }

        // anim_route_marker.coordinate.timing({ ...newCoordinate, duration: 2000 }).start();

        /* set_anim_route_marker({
            ...anim_route_marker,
            cur_loc: { latitude, longitude },
            coordinate: new AnimatedRegion({
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            })

        }) */
    }

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

        /* void (async () => {
            const newDirection = await getDirections("23.1218644,-82.32806211", "23.1118644,-82.31806211")
            setAnimRoute(newDirection === undefined ? [] : newDirection)
        }
        )() */

    }, [markers, selectedMarkerIndex]);

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

    const handleNavigationPress = () => {
        // openUserProfileHandler()
        // getLiveLocation()
        if (location) {
            animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                longitudeDelta: 0.0033333,
                latitudeDelta: 0.0033333,
            });
        }
    };

    const handlePresentModal = () => {
        bottomSheetModalRef.current?.present();
        setIsModalVisible(true);
    }

    const openUserProfileHandler = () => {
        bottomSheetModalRef.current?.present();
        setUserSelected(true)
        setIsModalVisible(true);
        if (isMenuOpen) {
            toogleNavMenu()
        }
    }

    const toogleNavMenu = () => {

        const toValue = isMenuOpen ? 0 : 1
        setIsMenuOpen(!isMenuOpen)

        Animated.spring(navigationAnimValueRef, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start()

    }

    const addMarkerHandler = () => {
        LayoutAnimation.linear()
        setIsMenuVisible(false)
        setIsAddingMarker(!isAddingMarker)
        if (isMenuOpen) {
            toogleNavMenu()
        }
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
                    showsMyLocationButton
                    showsUserLocation
                    showsCompass={false}
                    toolbarEnabled={false}
                    ref={mapViewRef}
                    provider={PROVIDER_GOOGLE}
                    customMapStyle={colorScheme === 'dark' ? NightMap : undefined}
                >

                    {markers.map((marker: MarkerData, index: number) => {
                        return (
                            <CarMarker key={index} onPress={() => handleMarkerPress(index)} coordinate={marker.coordinate} description='' title='' imageURL='' />
                        );
                    })}

                    {location && <UserMarker onPress={openUserProfileHandler} coordinate={location.coords} description='' title='' userId='' heading={heading} />}

                    <Marker coordinate={{
                        latitude: 23.118371667346942,
                        longitude: -82.38046813756227
                    }} />
                    {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        /* @ts-ignore */
                        animRoute.length > 0 && <Marker.Animated onPress={() => { }} coordinate={anim_route_marker.coordinate} ref={anim_route_marker_ref} />
                    }

                    {/* <AnimatingPolyline pathArray={animRoute} /> */}

                    <MapViewDirections
                        origin={origin}
                        destination={destination}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY || ""}
                        strokeWidth={3}
                        strokeColor={'black'}
                        mode='DRIVING'
                        precision='high'
                    />
                </MapView>

                {
                    isAddingMarker &&
                    <>
                        <View
                            style={{
                                right: (width / 2) - 24,
                                top: (height / 2) - 48,
                            }}
                            className='absolute bg-transparent h-12 w-12 overflow-hidden justify-end items-center'
                        >
                            <MaterialIcons
                                name={'location-on'}
                                size={48}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                        </View>

                        <View
                            style={{
                                right: (width / 2) - (width >= 367 ? 100 : 90),
                            }}
                            className='h-24 bg-transparent absolute bottom-5 items-center justify-between'
                        >
                            <PressBtn
                                onPress={() => { }}
                                className={'h-10 w-24 max-[367px]:h-8 bg-black dark:bg-white rounded-3xl flex-row justify-evenly items-center'}
                            >
                                <MaterialIcons
                                    name={'work'}
                                    size={28}
                                    color={Colors[colorScheme === 'dark' ? 'light' : 'dark'].text}
                                />
                                <MaterialIcons
                                    name={'arrow-drop-up'}
                                    size={24}
                                    color={Colors[colorScheme === 'dark' ? 'light' : 'dark'].text}
                                />
                            </PressBtn>

                            <PressBtn
                                onPress={() => {
                                    const getPoint = async () => {
                                        const pointCoords = await mapViewRef.current?.coordinateForPoint({
                                            x: (width / 2),
                                            y: (height / 2),
                                        })
                                    }
                                    void getPoint()
                                    LayoutAnimation.linear()
                                    setIsAddingMarker(false)
                                    setIsMenuVisible(true)
                                }}
                                className={'h-12 max-[367px]:h-8 w-[200px] max-[367px]:w-[180px] bg-[#FCCB6F] dark:bg-white rounded-3xl justify-center items-center'}
                            >
                                <Text darkColor="black" className={'text-white dark:text-black font-bold text-lg max-[367px]:text-base'}>Confirmar</Text>
                            </PressBtn>
                        </View>
                    </>
                }

                {
                    isMenuVisible &&
                    <Animated.View
                        style={{
                            right: (width / 7),
                            bottom: (height / 10),
                        }}
                        className='absolute bg-transparent items-center'
                    >

                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={{
                                    position: "absolute",
                                    transform:
                                        [
                                            {
                                                scale: navigationAnimValueRef
                                            },
                                            {
                                                translateY: navigationAnimValueRef.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -195]
                                                })
                                            }
                                        ]
                                }}
                            >
                                <PressBtn className={'h-14 w-14 justify-center items-center rounded-full border border-zinc-500'}>
                                    <MaterialIcons
                                        name={'local-taxi'}
                                        size={40}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={{
                                    position: "absolute",
                                    transform:
                                        [
                                            {
                                                scale: navigationAnimValueRef
                                            },
                                            {
                                                translateY: navigationAnimValueRef.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -130]
                                                })
                                            }
                                        ]
                                }}
                            >
                                <PressBtn
                                    className={'h-14 w-14 justify-center items-center rounded-full border border-zinc-500'}
                                    onPress={openUserProfileHandler}
                                >
                                    <MaterialIcons
                                        name={'account-circle'}
                                        size={40}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={{
                                    position: "absolute",
                                    transform:
                                        [
                                            {
                                                scale: navigationAnimValueRef
                                            },
                                            {
                                                translateY: navigationAnimValueRef.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -65]
                                                })
                                            }
                                        ]
                                }}
                            >
                                <PressBtn onPress={addMarkerHandler} className={'h-14 w-14 justify-center items-center rounded-full border border-zinc-500'}>
                                    <MaterialIcons
                                        name={'add-location-alt'}
                                        size={40}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={{
                                    transform:
                                        [
                                            {
                                                rotate: navigationAnimValueRef.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '135deg']
                                                }),
                                            }
                                        ]
                                }}
                            >
                                <PressBtn onPress={toogleNavMenu} className={' h-16 w-16 justify-center items-center rounded-full border border-zinc-500'}>

                                    <MaterialIcons
                                        name={'add'}
                                        size={48}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                    </Animated.View>
                }


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
                                        <View className='bg-transparent'>
                                            <View className='absolute -top-2 -right-4 rounded-full justify-center items-center'>
                                                <MaterialIcons
                                                    name='edit'
                                                    size={16}
                                                    color={Colors[colorScheme ?? 'light'].text}
                                                />
                                            </View>
                                            <Text className='font-bold text-lg'>{`${user.firstName} ${user.lastName}`}</Text>
                                        </View>
                                        <View>
                                            <View className='absolute top-0 right-0 rounded-full justify-center items-center'>
                                                <MaterialIcons
                                                    name='edit'
                                                    size={16}
                                                    color={Colors[colorScheme ?? 'light'].text}
                                                />
                                            </View>
                                            <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@{`${user.username}`}</Text>
                                        </View>
                                    </View>
                                    <PressBtn onPress={() => { return }}>
                                        <View className=' h-10 px-2 mt-3 mr-5 flex-row justify-center items-center rounded-2xl border-zinc-400 dark:border-zinc-800'>
                                            <MaterialIcons
                                                name='edit'
                                                size={16}
                                                color={Colors[colorScheme ?? 'light'].text}
                                            />
                                            <Text className='font-bold ml-2 text-base'>Editar Perfil</Text>
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
