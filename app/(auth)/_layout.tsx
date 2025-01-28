import {Stack} from "expo-router";
import * as React from "react";

export default function AuthLayout() {
    return (
        <Stack>
            {/* Auth Screens: Login/Signup */}
            <Stack.Screen
                name="index" // Splash Screen
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="log-in"
                options={{
                    title: 'Log In',
                }}
            />
            <Stack.Screen
                name="sign-up"
                options={{
                    title: 'Sign Up',
                }}
            />
        </Stack>
    )
}
