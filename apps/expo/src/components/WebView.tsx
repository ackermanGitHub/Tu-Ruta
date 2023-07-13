import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';


export default function WebViewComponent() {
    const [result, setResult] = useState<WebBrowser.WebBrowserResult | null>(null);

    const _handlePressButtonAsync = async () => {
        const openBrowserReturn = await WebBrowser.openBrowserAsync('https://expo.dev');
        console.log("openBrowserReturn", openBrowserReturn);
        setResult(openBrowserReturn);
    };

    return (
        <View className='w-full h-full flex justify-center items-center'>
            <Button title="Open WebBrowser" onPress={() => {

                void (async () => {
                    await _handlePressButtonAsync()
                })()

            }} />
            <Text>{result && JSON.stringify(result)}</Text>
        </View>
    );
}