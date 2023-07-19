import { useState, useRef, useCallback, useEffect } from 'react'
import { Dimensions, Easing, Platform } from 'react-native';
import { AnimatedRegion, Marker, type LatLng, type MapMarker } from 'react-native-maps';
import { getDirections } from '../utils/helpers';

const AnimatedMarker = () => {

    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.003;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const [anim_route, set_anim_route] = useState<LatLng[]>([])
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

    const animate = useCallback((latitude: number, longitude: number) => {
        const newCoordinate = { latitude, longitude };

        if (Platform.OS == 'android') {
            if (anim_route_marker_ref.current) {
                // anim_route_marker_ref.current.animateMarkerToCoordinate(newCoordinate, 7000)
                // anim_route_marker.coordinate.timing({ ...newCoordinate, duration: 2000 }).start();
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

        anim_route_marker.coordinate.timing({
            ...newCoordinate, duration: 2000, easing: Easing.linear,
            toValue: 0,
            useNativeDriver: false,
            latitudeDelta: 0,
            longitudeDelta: 0
        }).start();
    }, [anim_route_marker])

    const _getLiveLocation = useCallback(() => {
        console.log('locationCount: ', anim_route.length.toString() + ' - ' + 'count: ', route_count);
        if (anim_route.length !== route_count) {

            const latitude = anim_route[route_count + 1]?.latitude;
            const longitude = anim_route[route_count + 1]?.longitude;
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
    }, [anim_route, animate, route_count])


    useEffect(() => {

        void (async () => {
            const newDirection = await getDirections("23.1218644,-82.32806211", "23.1118644,-82.31806211")
            set_anim_route(newDirection === undefined ? [] : newDirection)
        }
        )()

    }, [])

    return (
        <>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                anim_route.length > 0 && <Marker.Animated coordinate={anim_route_marker.coordinate} ref={anim_route_marker_ref} />
            }
        </>
    )
}

export default AnimatedMarker