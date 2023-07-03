/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { type MarkerData, initialMarkers } from '../constants/Markers';
import * as Location from 'expo-location';
import { useUser } from '@clerk/clerk-expo';

import { useAtom, atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

const storedMarkers = createJSONStorage<MarkerData[]>(() => AsyncStorage)
const markersAtom = atomWithStorage<MarkerData[]>('markers', initialMarkers, storedMarkers)

const storedHistoryLocation = createJSONStorage<Location.LocationObject[] | undefined>(() => AsyncStorage)
const historyLocationAtom = atomWithStorage<Location.LocationObject[] | undefined>('historyLocation', undefined, storedHistoryLocation)

export const getLocation = () => {
    return Location.getCurrentPositionAsync({});
}

export const getHeading = () => {
    return Location.getHeadingAsync();
}

const locationAtom = atom<Location.LocationObject | undefined>(undefined);
const headingAtom = atom<Location.LocationHeadingObject>({
    trueHeading: 0,
    magHeading: 0,
    accuracy: 0,
})

const useMapConnection = () => {
    const [markers, setMarkers] = useAtom(markersAtom);
    const [historyLocation, setHistoryLocation] = useAtom(historyLocationAtom);

    const [location, setLocation] = useAtom(locationAtom);
    const [heading, setHeading] = useAtom(headingAtom);

    // const [isReady, setIsReady] = useState(false);
    // const [error, setError] = useState<string | null>(null);

    const [ws, setWs] = useState<WebSocket | null>(null);

    const { user, isLoaded, isSignedIn } = useUser()

    const handleWebSocketMessage = (event: MessageEvent<string>) => {
        console.log(JSON.parse(event.data))
    };

    useEffect(() => {

        const asyncWebSocket = async () => {
            const protocol = (await AsyncStorage.getItem('userRole'))?.includes("client") ? 'map-client' : 'map-taxi';
            const wsGate = new WebSocket("ws://192.168.1.102:3333", protocol);

            wsGate.addEventListener("open", (event) => {
                console.log('%c Connection opened', 'background: orange; color: black;', event);
            });

            wsGate.addEventListener('message', handleWebSocketMessage);

            wsGate.addEventListener('close', (event) => {
                console.log('%c Connection closed', 'background: orange; color: black;', event);
            });

            wsGate.addEventListener('error', (error) => {
                console.log('%c WebSocket error', 'background: red; color: black;', error);
            });

            setWs(wsGate);
        }
        asyncWebSocket()

        let PositionSubscrition: Location.LocationSubscription;

        const trackPosition = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            await Location.enableNetworkProviderAsync()

            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            PositionSubscrition = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 5000,
                },
                async (newLocation) => {

                    console.log(await AsyncStorage.getItem('userRole'))

                    setLocation(newLocation);
                    await setHistoryLocation(async (oldHistoryLocation) => [...((await oldHistoryLocation) || []), newLocation]);

                    // sends the location with the userId if the user is logged in
                    if (ws?.readyState === WebSocket.OPEN) {
                        if (isLoaded && isSignedIn) {
                            ws?.send(JSON.stringify({ ...newLocation, userId: user?.id }));
                        }
                    }
                },

            )

            const firstLocation = await getLocation()
            await setHistoryLocation([...(historyLocation || []), firstLocation])

            const firstHeading = await getHeading()
            setHeading(firstHeading);

        }

        trackPosition()
            .then(() => {
                console.log("tracking started")
            })
            .catch(err => {
                console.error(err)
            })

        return () => {
            if (ws?.readyState === WebSocket.OPEN) {
                ws?.close();
                ws?.removeEventListener("message", handleWebSocketMessage);
            }
            PositionSubscrition && PositionSubscrition.remove()
        };
    }, []);

    return {
        markers,
        setMarkers,
        ws,
        setWs,
        location,
        handleWebSocketMessage,
        historyLocation,
    }
}

export default useMapConnection


/* CREATE TABLE Location (
    id INT PRIMARY KEY,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    accuracy FLOAT,
    altitude FLOAT,
    altitudeAccuracy FLOAT,
    heading FLOAT,
    speed FLOAT
);

CREATE TABLE Marker (
    id INT PRIMARY KEY,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    imageURL TEXT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Location(id)
);

CREATE TABLE Profile (
    id INT PRIMARY KEY,
    userId VARCHAR(255),
    marker_id INT,
    last_location_id INT NOT NULL,
    FOREIGN KEY (last_location_id) REFERENCES Location(id),
    FOREIGN KEY (marker_id) REFERENCES Marker(id)
); */