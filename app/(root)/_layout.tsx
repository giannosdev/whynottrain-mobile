import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
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
                {/* Calendar Tab */}
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
            </Tabs>
        </SafeAreaView>
    );
}
