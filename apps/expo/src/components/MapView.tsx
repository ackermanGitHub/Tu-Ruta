import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    Animated,
    StatusBar,
    Switch,
    Dimensions,
    LayoutAnimation,
    Pressable,
    TouchableWithoutFeedback,
    FlatList
} from "react-native";
import MapView, { type MapMarker, type Region, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAtom, } from 'jotai';
import { useUser } from '@clerk/clerk-expo';
import { useKeepAwake } from 'expo-keep-awake';
import { useColorScheme } from 'nativewind';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import useMapConnection from '../hooks/useMapConnection';
import { type MarkerData } from '../constants/Markers';

import { View, Text } from '../styles/Themed';
import { PressBtn } from '../styles/PressBtn';
import Colors from '../styles/Colors';
import { NightMap } from '../styles/NightMap';
import UserMarker from '../markers/UserMarker';
import CarMarker from '../markers/CarMarker';

import { profileRoleAtom, profileStateAtom } from "../hooks/useMapConnection";
import { type UserMarkerIcon, userMarkersAtom } from './SelectMarkerIcon';

import LayoutDropdown from './LayoutDropdown';
import SelectMarkerIcon from './SelectMarkerIcon';
import AnimatedRouteMarker from './AnimatedRouteMarker';

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

const snapPoints = ["25%", "48%", "75%"];

const FirstRoute = () => {
    return (
        (
            <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
        )
    )
}

const MarkersProfileTab = () => {
    const { colorScheme } = useColorScheme();
    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)

    return (
        (
            <View style={{ flex: 1, backgroundColor: 'transparent' }} >
                <FlatList
                    style={{
                        width: '100%'
                    }}
                    data={userMarkers}
                    renderItem={({ item }) => (
                        <View className='w-full h-14 flex-row items-center justify-evenly'>
                            <MaterialCommunityIcons
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                name={item.icon.name}
                                size={28}
                                color={Colors[colorScheme ?? 'light'].text}
                            />
                            <Text>
                                {item.name}
                            </Text>
                            <PressBtn
                                onPress={() => {
                                    void setUserMarkers(userMarkers.filter(marker => marker.id !== item.id))
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={'trash-can'}
                                    size={28}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </PressBtn>
                        </View>
                    )}
                />
            </View>
        )
    )
}

const renderScene = SceneMap({
    first: FirstRoute,
    second: MarkersProfileTab,
});

const MapViewComponent = () => {

    useKeepAwake();
    const { colorScheme } = useColorScheme();
    const { user, isLoaded, isSignedIn } = useUser()
    const { width, height } = Dimensions.get('window');

    const { markers, location, heading } = useMapConnection();

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMenuVisible, setIsMenuVisible] = useState(true)
    const navigationAnimValueRef = useRef(new Animated.Value(0)).current;

    const [userMarkers, setUserMarkers] = useAtom(userMarkersAtom)
    const [profileRole, _setProfileRole] = useAtom(profileRoleAtom)
    const [profileState, setProfileState] = useAtom(profileStateAtom)

    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const [userSelected, setUserSelected] = useState(true);

    const _userMarkerRef = useRef<MapMarker>(null);
    const mapViewRef = useRef<MapView>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);


    const [_isModalVisible, setIsModalVisible] = useState(false);

    const [isAddingMarker, setIsAddingMarker] = useState(false);

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'First' },
        { key: 'second', title: 'Second' },
    ]);

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

    const toggleNavMenu = () => {
        const toValue = isMenuOpen ? 0 : 1
        setIsMenuOpen(!isMenuOpen)

        Animated.spring(navigationAnimValueRef, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start()

    }

    // Add marker functionality
    const addMarkerHandler = () => {
        LayoutAnimation.linear()
        setIsMenuVisible(false)
        setIsAddingMarker(!isAddingMarker)
        if (isMenuOpen) {
            toggleNavMenu()
        }
    }
    const confirmAddMarkerIcon = (newMarker: UserMarkerIcon) => {
        LayoutAnimation.linear()
        setIsAddingMarker(false)

        const getPoint = async () => {
            const pointCoords = await mapViewRef.current?.coordinateForPoint({
                x: (width / 2),
                y: (height / 2),
            })

            if (!pointCoords) {
                throw new Error('Trouble colecting the coordinates')
            }

            await setUserMarkers([...userMarkers, {
                // Fix this later, add a new method for creating ids
                id: Date.now().toString(),
                coords: {
                    latitude: pointCoords.latitude,
                    longitude: pointCoords.longitude,
                },
                icon: newMarker.icon,
                name: newMarker.name
            }])
        }

        void getPoint()
        setIsMenuVisible(true)
    }

    const openUserProfileHandler = () => {
        bottomSheetModalRef.current?.present();
        setUserSelected(true)
        setIsModalVisible(true);
        if (isMenuOpen) {
            toggleNavMenu()
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
                    onPress={() => {
                        if (isMenuOpen) {
                            toggleNavMenu()
                        }
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

                    {
                        userMarkers.map((userMarker, index) => {
                            return (
                                <Marker
                                    coordinate={userMarker.coords}
                                    key={index}
                                >
                                    <MaterialCommunityIcons
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        name={userMarker.icon.name}
                                        size={28}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </Marker>
                            )
                        })
                    }

                    <AnimatedRouteMarker />

                    {location && <UserMarker onPress={openUserProfileHandler} coordinate={location.coords} description='' title='' userId='' heading={heading} />}

                </MapView>

                {
                    isAddingMarker &&
                    <SelectMarkerIcon onConfirmFn={confirmAddMarkerIcon} />
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
                                <Pressable onPress={toggleNavMenu} className={' h-16 w-16 justify-center items-center rounded-full border border-zinc-500'}>

                                    <MaterialIcons
                                        name={'add'}
                                        size={48}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </Pressable>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                    </Animated.View>
                }

                <BottomSheetModal
                    enableContentPanningGesture={false}
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    backgroundStyle={{ borderRadius: 50, backgroundColor: colorScheme === 'light' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)' }}
                    handleIndicatorStyle={{
                        backgroundColor: colorScheme === 'dark' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)'
                    }}
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
                                            <Text className='font-bold text-lg'>{`${user.firstName} ${user.lastName}`}</Text>
                                        </View>
                                        <View>
                                            <Text className='font-medium text-sm text-slate-700 dark:text-slate-100'>@{`${user.username}`}</Text>
                                        </View>
                                    </View>
                                    <PressBtn onPress={() => { return }}>
                                        <View className='h-10 px-2 mt-3 mr-5 flex-row justify-center items-center rounded-2xl border-zinc-400 dark:border-zinc-800'>
                                            <MaterialIcons
                                                name='edit'
                                                size={16}
                                                color={Colors[colorScheme ?? 'light'].text}
                                            />
                                            <Text className='font-bold ml-2 text-base'>Editar Perfil</Text>
                                        </View>
                                    </PressBtn>
                                </View>

                                <TabView
                                    navigationState={{ index, routes }}
                                    renderScene={renderScene}
                                    onIndexChange={setIndex}
                                    initialLayout={{ width }}
                                    renderTabBar={(props) => <TabBar style={{ backgroundColor: 'transparent' }} {...props} />}
                                    lazy
                                />

                                {/* <View className='flex-row w-full items-center justify-center mt-4'>
                                    <Text>Is Active?</Text>
                                    <Switch value={profileState === 'active'} onValueChange={() => { void setProfileState(profileState === 'active' ? 'inactive' : 'active') }} />
                                </View>

                                <View className='flex-row w-full items-center justify-center mt-4'>
                                    <Text>Role: {profileRole}</Text>
                                </View> */}


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
