import {
  Image,
  Dimensions,
  useColorScheme,
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

  const colorScheme = useColorScheme();

  const { animatedValue: pressMenuAnim, handlePressIn: pressInMenu, handlePressOut: pressOutMenu, isPressed: isMenuPressed } = usePressIn()

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: [{
          borderRightColor: colorScheme === 'dark' ? '#333333' : '#999999',
          borderRightWidth: 1,
          borderBottomColor: colorScheme === 'dark' ? '#333333' : '#999999',
          borderBottomWidth: 1,
          width: isLargeScreen ? width - (width / 4) : width - (width / 2),
        }],
        drawerType: isLargeScreen ? 'permanent' : 'back',
        overlayColor: 'transparent',
        headerTintColor: colorScheme === 'light' ? 'black' : 'white',
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
            height: '100%'
          }} {...props}>
            {/* <DrawerItemList  {...props} /> */}
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
            <DrawerItem style={{
              width: '100%',
              margin: 0,
              padding: 0
            }} icon={({ focused, color, }) => {
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
            <DrawerItem style={{
              width: '100%',
              margin: 0,
              padding: 0
            }} icon={({ focused, color }) => {
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
            <DrawerItem style={{
              width: '100%',
              margin: 0,
              padding: 0
            }} icon={({ focused, color }) => {
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
            <DrawerItem style={{
              width: '100%',
              margin: 0,
              padding: 0
            }} icon={({ focused, color }) => {
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
            <DrawerItem style={{
              width: '100%',
              margin: 0,
              padding: 0
            }} icon={({ focused, color }) => {
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
            <DrawerItem style={{
              width: '100%',
              margin: 0,
              padding: 0
            }} icon={({ focused, color }) => {
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
              width: '100%',
              margin: 0,
              padding: 0,
              position: 'absolute',
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
                    className={`ml-5`}
                  />
                </PressBtn><PressBtn onPress={() => {
                }}  >
                  <AntDesign
                    name='twitter'
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    className={`ml-5`}
                  />
                </PressBtn>
              </View>

            )} label={'Social Networks'} onPress={() => { }} />
          </DrawerContentScrollView>
        )
      }}
      initialRouteName="Map"
    >
      <Drawer.Screen
        options={{
          drawerLabel: ({ focused, color, }) => {

            if (!isLoaded) {
              return (
                <View className={`w-full flex-row justify-between items-center bg-transparent px-5 gap-5`}>
                  <ActivityIndicator size={'large'} animating color={colorScheme === 'dark' ? 'white' : 'black'} />
                  <View></View>
                </View>
              )
            }

            if (!isSignedIn) {
              return (
                <View className={`w-full mb-2 flex-row justify-between items-center bg-transparent px-5 gap-5`}>
                  <FontAwesome
                    name={colorScheme === 'light' ? 'user-circle' : 'user-circle-o'}
                    size={30}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                  <PressBtn onPress={() => {

                  }} className={`w-[100px] max-w-[150px] bg-slate-500 dark:bg-slate-700 rounded h-8 justify-center items-center`} >
                    <Text className={`text-white`}>Sign In</Text>
                  </PressBtn>
                </View>
              )
            }

            return (
              <View className={`w-full mb-2 flex-row justify-between items-center bg-transparent px-5 gap-5`}>
                <Image source={{
                  uri: 'https://lh3.googleusercontent.com/a/AAcHTtfPgVic8qF8hDw_WPE80JpGOkKASohxkUA8y272Ow=s1000-c'
                }} className={`w-8 h-8 rounded-full`} />
                <Text>{user.firstName + ' ' + user.lastName}</Text>
              </View>
            )
          },

        }} name="Session" component={SignInWithOAuth} />
      <Drawer.Screen options={{

        drawerIcon: ({ focused, color, }) => {
          return (
            <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
              <Ionicons
                name={colorScheme === 'light' ? 'md-map-outline' : 'md-map'}
                size={30}
                color={Colors[colorScheme ?? 'light'].text}
                className={`ml-5`}
              />
              <Text className={`ml-5`}>Map</Text>
            </View>
          )
        },
      }} name="Map" component={MapViewScreen} />
      <Drawer.Screen options={{
        drawerLabel: ({ focused, color }) => {
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
        },
      }} name="Stack" component={StackScreen} />
      <Drawer.Screen options={{
        drawerLabel: ({ focused, color }) => {
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
        },
      }} name="History" component={HistoryScreen} />
      <Drawer.Screen options={{
        drawerLabel: ({ focused, color }) => {
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
        },
      }} name="Config" component={ConfigScreen} />
      <Drawer.Screen options={{
        drawerLabel: ({ focused, color }) => {
          return (
            <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
              <FontAwesome
                name='gear'
                size={30}
                color={Colors[colorScheme ?? 'light'].text}
                className={`ml-5`}
              />
              <Text className={`ml-5`}>Service</Text>
            </View>
          )
        },
      }} name="Service" component={CustomServiceScreen} />
      <Drawer.Screen options={{
        drawerLabel: ({ focused, color }) => {
          return (
            <View className={`w-full my-2 flex-row justify-start items-center bg-transparent`}>
              <FontAwesome
                name='gear'
                size={30}
                color={Colors[colorScheme ?? 'light'].text}
                className={`ml-5`}
              />
              <Text className={`ml-5`}>Service</Text>
            </View>
          )
        },
      }} name="Payment" component={PaymentScreen} />
    </Drawer.Navigator>
  );
}
