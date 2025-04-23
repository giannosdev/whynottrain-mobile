import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarCheck2, Contact } from 'lucide-react-native';

export default function TabsLayout() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: 'gray',
                }}
            >
                {/* Calendar Tab - Also includes Workouts List View via toggle */}
                <Tabs.Screen
                    name="calendar/index" // Matches `pages/(root)/calendar/index.tsx`
                    options={{
                        headerShown: false,
                        title: 'Calendar',
                        tabBarLabel: 'Calendar',
                        tabBarIcon: ({ color }) => <CalendarCheck2 color={color} size={18} />,
                    }}
                />

                {/* Profile Tab */}
                <Tabs.Screen
                    name="profile/index" // Matches `pages/(root)/profile/index.tsx`
                    options={{
                        headerShown: false,
                        title: 'Profile',
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ color }) => <Contact color={color} size={18} />,
                    }}
                />

                {/* --- IMPORTANT FIX: Hide the entire workouts directory --- */}
                <Tabs.Screen
                    name="workouts" // Refers to the directory
                    options={{
                        headerShown: false,
                        href: null, // Hides this route from the tab bar
                        tabBarStyle: { display: "none" }, // Hides the tab bar when on any screen in this directory
                    }}
                />

                {/* Hidden routes - don't show in tab bar */}
                <Tabs.Screen
                    name="calendar/[eventId]" // Matches `app/(root)/calendar/[eventId].tsx`

                    options={{
                        headerShown: false,
                        href: null, // Hides this route from the tab bar
                        tabBarStyle: { display: "none" }, // Hides the tab bar when on this screen
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
