import {
    Image,
    Dimensions,
    ActivityIndicator,
    Pressable,
    Animated
} from "react-native";

import {
    DrawerContentScrollView,
    DrawerItem,
    createDrawerNavigator
} from '@react-navigation/drawer';

import { useUser } from '@clerk/clerk-expo';
import SignIn from "../components/Sign-in";

import { View, Text } from '../styles/Themed';
import { AntDesign, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../styles/Colors';

import { PressBtn } from '../styles/PressBtn';
import usePressIn from '../hooks/usePressIn';

import MapViewScreen from '../components/MapView';
import StackScreen from '../components/Stack';
import HistoryScreen from '../components/History';
import ConfigScreen from '../components/Config';
import CustomServiceScreen from '../components/CustomService';
import PaymentScreen from '../components/Payment';

import { useColorScheme } from 'nativewind';
import SignUp from "../components/Sign-up";


import AsyncStorage from '@react-native-async-storage/async-storage'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useAtom, atom } from 'jotai'
import { useRef } from "react";

const storedUserRole = createJSONStorage<'taxi' | 'client'>(() => AsyncStorage)
const userRoleAtom = atomWithStorage<'taxi' | 'client'>('userRole', "taxi", storedUserRole)

void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

const Drawer = createDrawerNavigator();

export default function Home() {

    const dropdownVisible = useRef(new Animated.Value(1)).current;

    const handleOpenDropdown = () => {
        Animated.timing(dropdownVisible, {
            toValue: 1,
            duration: 175,
            useNativeDriver: true,
        }).start();
    };

    const handleCloseDropdown = () => {
        Animated.timing(dropdownVisible, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const isLargeScreen = width >= 768;

    const isSmallScreen = width <= 350;

    const { user, isLoaded, isSignedIn } = useUser();

    const [userRole, setUserRole] = useAtom(userRoleAtom)

    const { colorScheme } = useColorScheme();

    const { animatedValue: pressMenuAnim, handlePressIn: pressInMenu, handlePressOut: pressOutMenu, isPressed: isMenuPressed } = usePressIn()

    return (
        <Drawer.Navigator
            screenOptions={{

                drawerStyle: [{
                    width: isLargeScreen ? width - (width / 4) : width - (width / 2),
                    borderRightColor: colorScheme === 'dark' ? '#333333' : '#888888',
                    borderRightWidth: 2,
                }],
                drawerType: isLargeScreen ? 'permanent' : 'back',
                overlayColor: 'transparent',
                header({ navigation }) {
                    return (
                        <Animated.View
                            className={'absolute top-9 left-10'}
                            style={[
                                {
                                    transform: [
                                        {
                                            scale: pressMenuAnim
                                        }
                                    ]
                                },
                            ]}
                        >
                            <Pressable
                                onPressIn={() => {
                                    pressInMenu();
                                }}
                                onPressOut={() => {
                                    pressOutMenu();
                                }}
                                onPress={() => {
                                    navigation.openDrawer();
                                }}
                                className={'p-3 rounded-full bg-transparent'}
                            >
                                <AntDesign
                                    name={'menuunfold'}
                                    size={30}
                                    color={Colors[colorScheme ?? 'light'].text}
                                />
                            </Pressable>
                        </Animated.View>
                    )
                },

            }}
            drawerContent={(props) => {
                const { descriptors, navigation, state } = props;
                return (
                    <DrawerContentScrollView
                        contentContainerStyle={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
                        }} {...props}
                    >

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} labelStyle={{
                            width: '100%',
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color }) => {

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
                                            navigation.navigate('Sign-In')
                                        }} className={`w-[60px] max-w-[120px] ml-5 bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center`} >
                                            <Text className={`text-white`}>Sign In</Text>
                                        </PressBtn>
                                    </View>
                                )
                            }

                            return (
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

                                </View>

                            )

                        }} label={'SignUp'} onPress={() => { }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color, }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5`}>
                                    <Ionicons
                                        name={colorScheme === 'light' ? 'md-map-outline' : 'md-map'}
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">Mapa</Text>
                                </View>
                            )
                        }} label={'Mapa'} onPress={() => { navigation.navigate('Map') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5`}>
                                    <FontAwesome
                                        name='stack-overflow'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-6">Stack</Text>
                                </View>
                            )
                        }} label={'Features'} onPress={() => { navigation.navigate('Stack') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5`}>
                                    <MaterialIcons
                                        name='history'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">History</Text>
                                </View>
                            )
                        }} label={'History'} onPress={() => { navigation.navigate('History') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5`}>
                                    <FontAwesome
                                        name='gear'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-6">Config</Text>
                                </View>
                            )
                        }} label={'Config'} onPress={() => { navigation.navigate('Config') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5`}>
                                    <AntDesign
                                        name='customerservice'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">Service</Text>
                                </View>
                            )
                        }} label={'Service'} onPress={() => { navigation.navigate('Service') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent px-5`}>
                                    <FontAwesome5
                                        name='money-check'
                                        size={24}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                    <Text className="ml-5">Payment</Text>
                                </View>
                            )
                        }} label={'Service'} onPress={() => { navigation.navigate('Service') }} />

                        <DrawerItem style={{
                            width: '100%',
                            marginHorizontal: 0,
                            marginVertical: 0,
                            position: 'absolute',
                            bottom: 0,
                            borderRadius: 0
                        }} pressColor={colorScheme === 'dark' ? 'white' : 'black'} icon={() => (
                            <View className={`w-full p-0 m-0 flex-row justify-around items-center bg-transparent`}>
                                <PressBtn onPress={() => {
                                    setUserRole('client')
                                }}  >
                                    <AntDesign
                                        name='instagram'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn><PressBtn onPress={() => {
                                    setUserRole('taxi')
                                }}  >
                                    <AntDesign
                                        name='facebook-square'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn><PressBtn onPress={() => {
                                    console.log("drawer", { userRole, AsyncStorage })
                                }}  >
                                    <AntDesign
                                        name='twitter'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </PressBtn>
                            </View>

                        )} label={'Social Networks'} onPress={() => { }} />

                    </DrawerContentScrollView>
                )
            }}
            initialRouteName="Map"
        >

            <Drawer.Screen name="Sign-In" component={SignIn} />
            <Drawer.Screen name="Sign-Up" component={SignUp} />
            <Drawer.Screen name="Map" component={MapViewScreen} />
            <Drawer.Screen name="Stack" component={StackScreen} />
            <Drawer.Screen name="History" component={HistoryScreen} />
            <Drawer.Screen name="Config" component={ConfigScreen} />
            <Drawer.Screen name="Service" component={CustomServiceScreen} />
            <Drawer.Screen name="Payment" component={PaymentScreen} />

        </Drawer.Navigator>
    );
}
