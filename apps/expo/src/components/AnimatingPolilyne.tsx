import React, { useEffect } from "react";
import { useState } from "react";
import { type LatLng, Polyline } from "react-native-maps";


export default function AnimatingPolyline({ pathArray }: { pathArray: LatLng[] }) {
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

    useEffect(() => {
        const intervalSus = setInterval(() => animatePolylineStart(), 70);


        return () => {
            clearInterval(intervalSus);
        }
    }, [])

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