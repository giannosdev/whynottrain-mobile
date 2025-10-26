import 'react-native-reanimated';
import '~/global.css';

import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Navigator, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import AuthProvider from '~/app/context/auth';
import { QueryProvider } from '~/app/context/query';

const LIGHT_THEME: Theme = {
    ...DefaultTheme,
    colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
    ...DarkTheme,
    colors: NAV_THEME.dark,
};

export default function RootLayout() {
    const hasMounted = React.useRef(false);
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

    React.useLayoutEffect(() => {
        if (hasMounted.current) {
            return;
        }

        if (Platform.OS === 'web') {
            document.documentElement.classList.add('bg-background');
        }
        setAndroidNavigationBar(colorScheme);
        setIsColorSchemeLoaded(true);
        hasMounted.current = true;
    }, []);

    if (!isColorSchemeLoaded) {
        return null; // Show a splash/loading indicator while checking auth
    }

    return (
        <AuthProvider>
            <QueryProvider>
                <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
                    <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                    <Navigator>

                        <Slot />
                    </Navigator>
                    <PortalHost />
                </ThemeProvider>
            </QueryProvider>
        </AuthProvider>
    );
}
