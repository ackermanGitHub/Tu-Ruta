import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Image,
    Pressable,
    Animated,
    StatusBar,
    Switch,
    Platform,
    Dimensions,
    Easing
} from "react-native";
import MapViewDirections from 'react-native-maps-directions';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { NightMap } from '../styles/NightMap';
import MapView, { type MapMarker, type Region, PROVIDER_GOOGLE, Polyline, type LatLng, Marker, AnimatedRegion } from 'react-native-maps';

import { type MarkerData } from '../constants/Markers';
import useMapConnection from '../hooks/useMapConnection';

import { View, Text } from '../styles/Themed';
import { /*Feather, FontAwesome, */MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { useAtom, } from 'jotai';
import { signMethodAtom } from './Sign-up';
import LayoutDropdown from './LayoutDropdown';

import { atomWithStorage, createJSONStorage, } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { } from 'react-native-maps/lib/MapMarkerNativeComponent';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

// "emailAddress": "julio.sergio2709@gmail.com", "id": "idn_2RJhwToHB8RbifJBZlXZ5jWn8D4"
// Access Token: pk.434c2613d0817ab0dd86813cf59ea6de

const snapPoints = ["25%", "48%", "75%"];

const origin = { latitude: 23.121715394724493, longitude: -82.38003462553024 };
const destination = { latitude: 23.1286927367378, longitude: -82.39208780229092 };

const storedIsRouteAnimating = createJSONStorage<'true' | 'false' | 'unknown'>(() => AsyncStorage)
export const isRouteAnimatingAtom = atomWithStorage<'true' | 'false' | 'unknown'>('isRouteAnimating', "false", storedIsRouteAnimating)

const MapViewComponent = () => {
    const [isSheetModalLoading, setIsSheetModalLoading] = useState(false);

    const [profileRole, _setProfileRole] = useAtom(profileRoleAtom)
    const [profileState, setProfileState] = useAtom(profileStateAtom)
    const [signMethod, setSignMethod] = useAtom(signMethodAtom)
    const [isRouteAnimating, setIsRouteAnimating] = useAtom(isRouteAnimatingAtom)

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


    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.003;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const [animRoute, setAnimRoute] = useState<LatLng[]>([])

    const [route_count, set_route_count] = useState(0);
    const anim_route_mark_ref = useRef<MapMarker | null>(null)

    const [anim_route_mark, set_anim_route_mark] = useState({
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
            if (anim_route_mark_ref.current) {
                // anim_route_mark_ref.current.animateMarkerToCoordinate(newCoordinate, 7000)
                // anim_route_mark.coordinate.timing({ ...newCoordinate, duration: 2000 }).start();

                anim_route_mark.coordinate.timing({
                    ...newCoordinate, duration: 2000, easing: Easing.linear,
                    toValue: 0,
                    useNativeDriver: false,
                    latitudeDelta: 0,
                    longitudeDelta: 0
                }).start();
                console.log("animateMarkerToCoordinate")
            }
        } else {
            anim_route_mark.coordinate.timing({
                ...newCoordinate, duration: 2000, easing: Easing.linear,
                toValue: 0,
                useNativeDriver: false,
                latitudeDelta: 0,
                longitudeDelta: 0
            }).start();
        }

        // anim_route_mark.coordinate.timing({ ...newCoordinate, duration: 2000 }).start();

        /* set_anim_route_mark({
            ...anim_route_mark,
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

        void (async () => {
            const newDirection = await getDirections("23.1218644,-82.32806211", "23.1118644,-82.31806211")
            setAnimRoute(newDirection === undefined ? [] : newDirection)
        }
        )()

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

    const handleNavigationPress = () => {
        getLiveLocation()
        if (location) {
            animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                longitudeDelta: 0.0033333,
                latitudeDelta: 0.0033333,
            });
        }
        openUserProfile()
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

                    {
                        /* @ts-ignore */
                        animRoute.length > 0 && <Marker.Animated onPress={() => { }} coordinate={anim_route_mark.coordinate} ref={anim_route_mark_ref} />
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
                        onPress={handleNavigationPress}
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


function AnimatingPolyline({ pathArray }: { pathArray: LatLng[] }) {
    const [polylinePath, setPolylinePath] = useState<LatLng[]>(pathArray);

    const animatePolylineStart = () => {
        if (polylinePath.length < pathArray.length) {
            setPolylinePath([
                ...pathArray.slice(0, polylinePath.length - 1)
            ]);
        } else {
            setPolylinePath([])
        }

        console.log(polylinePath)
    };

    /* useEffect(() => {
        const intervalSus = setInterval(() => animatePolylineStart(), 70);


        return () => {
            clearInterval(intervalSus);
        }
    }) */

    return (
        <React.Fragment>
            {
                (polylinePath.length > 0) && <Polyline
                    coordinates={polylinePath}
                    strokeColor="#484848"
                    strokeWidth={5}


                />
            }
        </React.Fragment>
    )
}

const getDirections = async (startLoc: string, destinationLoc: string) => {
    try {
        const resp = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY || ""}`
        );
        const respJson = await resp.json();
        const coords = polylineDecode(respJson.routes[0].overview_polyline.points).map((point, index) => ({ latitude: point[0] as number, longitude: point[1] as number }));
        console.log(coords);
        return coords;
    } catch (error) {
        console.error(error);
    }
};

const duplicateCoords = (coords: {
    latitude: number;
    longitude: number;
}[]) => {

    const newCoords: {
        latitude: number;
        longitude: number;
    }[] = [];

    for (let i = 0; i < coords.length - 1; i++) {
        newCoords.push({ latitude: Number(coords[i]?.latitude), longitude: Number(coords[i]?.longitude) });
        newCoords.push({ latitude: ((Number(coords[i]?.latitude)) + (Number(coords[i + 1]?.latitude))) / 2, longitude: (Number(coords[i]?.longitude) + Number(coords[i + 1]?.longitude)) / 2 });
    }
    return newCoords;

}

function polylineDecode(str: string, precision?: number) {
    let index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision !== undefined ? precision : 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 1;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result += (byte & 0x1f) * shift;
            shift *= 32;
        } while (byte >= 0x20);

        latitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

        shift = 1;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result += (byte & 0x1f) * shift;
            shift *= 32;
        } while (byte >= 0x20);

        longitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};