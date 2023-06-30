
const WonderWoman = { uri: "http://i.imgur.com/sNam9iJ.jpg" };

export interface MarkerData {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    description: string;
    image: any;
}

export const initialMarkers: MarkerData[] = [
    {
        coordinate: {
            latitude: 23.1218644,
            longitude: -82.32806211,
        },
        title: "Best Place",
        description: "This is the best place in Portland",
        image: WonderWoman,
    },
    {
        coordinate: {
            latitude: 23.1118644,
            longitude: -82.31806211,
        },
        title: "Second Best Place",
        description: "This is the second best place in Portland",
        image: WonderWoman,
    },
    {
        coordinate: {
            latitude: 23.1318644,
            longitude: -82.33806211,
        },
        title: "Third Best Place",
        description: "This is the third best place in Portland",
        image: WonderWoman,
    },
    {
        coordinate: {
            latitude: 23.1148644,
            longitude: -82.34806211,
        },
        title: "Fourth Best Place",
        description: "This is the fourth best place in Portland",
        image: WonderWoman,
    },
];