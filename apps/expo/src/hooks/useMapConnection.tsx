/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { type MarkerData, initialMarkers } from '../constants/Markers';
import * as Location from 'expo-location';
import { useUser } from '@clerk/clerk-expo';

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

type UserRole = 'taxi' | 'client'

const useMapConnection = ({ role = 'client', onLocationLoad }: { role?: UserRole, onLocationLoad?: (location: Location.LocationObject) => void }) => {
    const [historyLocation, setHistoryLocation] = useState<Location.LocationObject[]>([]);
    // const [isReady, setIsReady] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerData[]>(initialMarkers);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const { user, isLoaded, isSignedIn } = useUser()

    const handleWebSocketMessage = (event: MessageEvent<string>) => {
        console.log(JSON.parse(event.data))
    };

    useEffect(() => {
        const protocol = role === 'client' ? 'map-client' : 'map-worker';
        const ws = new WebSocket("ws://192.168.1.102:3333", protocol);
        setWs(ws);

        ws.addEventListener("open", (event) => {
            console.log('%c Connection opened', 'background: orange; color: black;', event);
        });

        ws.addEventListener('message', handleWebSocketMessage);

        ws.addEventListener('close', (event) => {
            console.log('%c Connection closed', 'background: orange; color: black;', event);
        });

        ws.addEventListener('error', (error) => {
            console.log('%c WebSocket error', 'background: red; color: black;', error);
        });

        let PositionSubscrition: Location.LocationSubscription;

        let HeadingSuscription: Location.LocationSubscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            await Location.enableNetworkProviderAsync()

            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            PositionSubscrition = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 2000,
                },
                location => {
                    setLocation((prevLocation) => {
                        if (!prevLocation) {
                            return null;
                        }
                        return {
                            ...prevLocation,
                            coords: {
                                ...prevLocation?.coords,
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            },
                        }
                    });
                    onLocationLoad && onLocationLoad(location)
                    setHistoryLocation((prevHistoryLocation) => {
                        return [...prevHistoryLocation, location]
                    })

                    if (ws.readyState === WebSocket.OPEN) {
                        if (isLoaded && isSignedIn) {
                            ws.send(JSON.stringify({ ...location, userId: user?.id }));
                        }
                    }
                },

            )

            /* HeadingSuscription = await Location.watchHeadingAsync((heading) => {
                setLocation((prevLocation) => {
                    if (!prevLocation) {
                        return null
                    }
                    return {
                        ...prevLocation,
                        coords: {
                            ...prevLocation?.coords,
                            heading: heading.trueHeading,
                        },
                    }
                })
            }) */

            const location = await Location.getCurrentPositionAsync({});

            setLocation(location);
        })().catch(err => console.error(err))

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            ws.removeEventListener("message", handleWebSocketMessage);
            PositionSubscrition.remove()
            // HeadingSuscription.remove()
        };
    }, []);

    return {
        markers,
        setMarkers,
        ws,
        setWs,
        location,
        setLocation,
        handleWebSocketMessage,
        historyLocation,
    }
}

export default useMapConnection