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
import SignInWithOAuth from '../components/SignInWithOAuth';

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

import { useColorScheme } from 'nativewind'
import { useEffect } from "react";


void Image.prefetch("https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c")

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

type UserRole = 'taxi' | 'client'

const Drawer = createDrawerNavigator();

export default function Home() {

    const isLargeScreen = width >= 768;

    const isSmallScreen = width <= 350;

    const { user, isLoaded, isSignedIn } = useUser();

    const { colorScheme } = useColorScheme();

    useEffect(() => {
        console.log(colorScheme)
    }, [colorScheme])


    const { animatedValue: pressMenuAnim, handlePressIn: pressInMenu, handlePressOut: pressOutMenu, isPressed: isMenuPressed } = usePressIn()

    return (
        <Drawer.Navigator
            screenOptions={{
                drawerContentStyle: {
                    width: '100%',
                    padding: 0,
                    margin: 0,
                },
                drawerContentContainerStyle: {
                    width: '100%',
                    padding: 0,
                    margin: 0,
                },

                drawerStyle: [{
                    width: isLargeScreen ? width - (width / 4) : width - (width / 2),
                }, {
                    backgroundColor: colorScheme === 'light' ? 'white' : 'black',
                    /* backgroundColor: 'blue', */
                    padding: 0,
                    margin: 0
                }],
                drawerType: isLargeScreen ? 'permanent' : 'back',
                overlayColor: 'transparent',
                header({ navigation }) {
                    return (
                        <Animated.View
                            className={'absolute top-11 left-10'}
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
                                className={'p-3 rounded-full bg-white dark:bg-black'}
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
                    <DrawerContentScrollView contentContainerStyle={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    }} {...props}>
                        <DrawerItem icon={({ focused, color }) => {
                            if (!isLoaded) {
                                return (
                                    <View className={'w-full flex-row justify-between items-center bg-transparent px-5 gap-5'}>
                                        <ActivityIndicator
                                            size={'large'}
                                            animating
                                            color={colorScheme === 'dark' ? 'white' : 'black'}
                                        />
                                        <View></View>
                                    </View>
                                )
                            }

                            if (!isSignedIn) {
                                return (
                                    <View className={'w-full flex-row justify-start items-center bg-transparent'}>
                                        <FontAwesome
                                            name={colorScheme === 'light' ? 'user-circle' : 'user-circle-o'}
                                            size={30}
                                            color={Colors[colorScheme ?? 'light'].text}
                                            className={'ml-5'}
                                        />
                                        <PressBtn onPress={() => {
                                            navigation.navigate('Session')
                                        }} className={`w-[60px] max-w-[120px] bg-slate-500 dark:bg-slate-700 rounded h-8 ml-5 justify-center items-center`} >
                                            <Text className={`text-white`}>Sign In</Text>
                                        </PressBtn>
                                    </View>
                                )
                            }

                            return (
                                <View className={`w-full justify-around flex-row items-center bg-transparent`}>
                                    <Image source={{
                                        uri: "https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c"
                                    }} className={`w-8 h-8 rounded-full`} />
                                    <Text>{user.firstName + ' ' + user.lastName}</Text>
                                    <PressBtn onPress={() => {
                                        console.log('open modal user settings')
                                    }}>
                                        <Feather
                                            name='more-vertical'
                                            size={20}
                                            color={Colors[colorScheme ?? 'light'].text}
                                        />
                                    </PressBtn>
                                </View>
                            )
                        }} label={'Session'} onPress={() => { }} />
                        <DrawerItem icon={({ focused, color, }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
                                    <Ionicons
                                        name={colorScheme === 'light' ? 'md-map-outline' : 'md-map'}
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={`ml-5`}
                                    />
                                    <Text className={`ml-5`}>Mapa</Text>
                                </View>
                            )
                        }} label={'Mapa'} onPress={() => { navigation.navigate('Map') }} />
                        <DrawerItem icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
                                    <FontAwesome
                                        name='stack-overflow'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={`ml-5`}
                                    />
                                    <Text className={`ml-5`}>Features</Text>
                                </View>
                            )
                        }} label={'Features'} onPress={() => { navigation.navigate('Stack') }} />
                        <DrawerItem icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
                                    <MaterialIcons
                                        name='history'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={`ml-5`}
                                    />
                                    <Text className={`ml-5`}>History</Text>
                                </View>
                            )
                        }} label={'History'} onPress={() => { navigation.navigate('History') }} />
                        <DrawerItem icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
                                    <FontAwesome
                                        name='gear'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={`ml-5`}
                                    />
                                    <Text className={`ml-5`}>Config</Text>
                                </View>
                            )
                        }} label={'Config'} onPress={() => { navigation.navigate('Config') }} />
                        <DrawerItem icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
                                    <AntDesign
                                        name='customerservice'
                                        size={30}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={`ml-5`}
                                    />
                                    <Text className={`ml-5`}>Service</Text>
                                </View>
                            )
                        }} label={'Service'} onPress={() => { navigation.navigate('Service') }} />
                        <DrawerItem icon={({ focused, color }) => {
                            return (
                                <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
                                    <FontAwesome5
                                        name='money-check'
                                        size={24}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={`ml-5`}
                                    />
                                    <Text className={`ml-5`}>Payment</Text>
                                </View>
                            )
                        }} label={'Service'} onPress={() => { navigation.navigate('Service') }} />
                        <DrawerItem style={{
                            position: 'absolute',
                            width: '100%',
                            bottom: 20
                        }} icon={() => (
                            <View className={`w-full p-0 m-0 flex-row justify-around items-center bg-transparent`}>
                                <PressBtn onPress={() => {
                                }}  >
                                    <AntDesign
                                        name='instagram'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={``}
                                    />
                                </PressBtn><PressBtn onPress={() => {
                                }}  >
                                    <AntDesign
                                        name='facebook-square'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={``}
                                    />
                                </PressBtn><PressBtn onPress={() => {
                                }}  >
                                    <AntDesign
                                        name='twitter'
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        className={``}
                                    />
                                </PressBtn>
                            </View>

                        )} label={'Social Networks'} onPress={() => { }} />
                    </DrawerContentScrollView>
                )
            }}
            initialRouteName="Map"
        >

            <Drawer.Screen name="Session" component={SignInWithOAuth} />
            <Drawer.Screen name="Map" component={MapViewScreen} />
            <Drawer.Screen name="Stack" component={StackScreen} />
            <Drawer.Screen name="History" component={HistoryScreen} />
            <Drawer.Screen name="Config" component={ConfigScreen} />
            <Drawer.Screen name="Service" component={CustomServiceScreen} />
            <Drawer.Screen name="Payment" component={PaymentScreen} />

        </Drawer.Navigator>
    );
}
