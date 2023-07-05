import React, { useEffect, useRef } from 'react'
import { type MapMarkerProps, MarkerAnimated, Circle } from 'react-native-maps'
import { View } from '../styles/Themed'

import { type MarkerData } from '../constants/Markers'
import { Animated } from 'react-native'
import { type LocationHeadingObject } from 'expo-location'
import { useColorScheme } from 'nativewind'

const CarMarker = ({ coordinate, description, title, userId, heading, ...props }: Omit<MarkerData, "image"> & { heading?: LocationHeadingObject } & MapMarkerProps) => {
    const animatedRotation = useRef(new Animated.Value(1)).current;

    const animatedSize = useRef(new Animated.Value(1)).current;

    const { colorScheme } = useColorScheme()

    const rotate = () => {
        Animated.timing(animatedRotation, {
            toValue: heading?.trueHeading || 0,
            duration: 900,
            useNativeDriver: true
        }).start();
    };

    const upSizeAnim = () => {
        Animated.timing(animatedSize, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true
        }).start(() => {
            downSizeAnim()
        });
    };

    const downSizeAnim = () => {
        Animated.timing(animatedSize, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true
        }).start(() => {
            upSizeAnim()
        });
    };

    useEffect(() => {
        rotate()
        upSizeAnim()
    }, [heading])

    return (
        <>
            <MarkerAnimated
                {...props}
                anchor={{ x: 0.5, y: 0.6 }}
                coordinate={{
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                }}
                flat
                style={{
                    ...(heading?.trueHeading !== -1 && {
                        transform: [
                            {
                                rotate: animatedRotation.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                        ],
                    }),
                }}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    position: 'relative',
                    width: 48,
                    height: 48,
                }}>
                    <View style={[{
                        width: 0,
                        height: 0,
                        backgroundColor: 'transparent',
                        borderStyle: 'solid',
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderBottomWidth: 10,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        elevation: 4,
                        borderBottomColor: 'rgb(0, 120, 255)',
                    }]} />
                    <View style={{
                        backgroundColor: 'rgb(0, 120, 255)',
                        width: 24,
                        height: 24,
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 12,
                        shadowColor: 'black',
                        shadowOffset: {
                            width: 1,
                            height: 1,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 1.5,
                        elevation: 4,
                    }} />
                    <Animated.View style={{
                        backgroundColor: colorScheme === 'light' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)',
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderWidth: 1,
                        borderColor: colorScheme === 'dark' ? 'rgba(203,213,225,0.8)' : 'rgba(26,18,11,0.5)',
                        borderRadius: 999,
                        shadowColor: 'black',
                        shadowOffset: {
                            width: 1,
                            height: 1,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 1.5,
                        elevation: 4,
                        zIndex: -1,
                        transform: [
                            {
                                scale: animatedSize
                            }
                        ]
                    }} />
                </View>
            </MarkerAnimated>
        </>
    )
}

export default CarMarker;