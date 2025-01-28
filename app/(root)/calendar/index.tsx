import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Agenda, Calendar } from "react-native-calendars";
import { Button } from "~/components/ui/button";
import {NAV_THEME} from "~/lib/constants";
import {Tabs} from "expo-router";
import {CalendarDays, CalendarXIcon as C1} from "lucide-react-native";

const CalendarScreen: React.FC = () => {
    const [view, setView] = useState<'agenda' | 'month'>('agenda'); // Toggle between views
    const [items, setItems] = useState<{ [date: string]: any }>({
        '2025-01-28': [{ name: 'Meeting with John', time: '10:00 AM' }],
        '2025-01-29': [{ name: 'Dentist Appointment', time: '1:00 PM' }],
        '2025-01-30': [{ name: 'Grocery Shopping', time: '5:00 PM' }],
    });

    const onDayPress = (day: { dateString: string }) => {
        Alert.alert('Selected Date', day.dateString);
    };

    return (

        <View className="flex-1 bg-white">
            {/* Toggle Button */}
            <View className="p-4 bg-gray-100 flex flex-row items-center justify-between">
                <Text>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
                <Button
                    size="icon"
                    variant="ghost"
                    onPress={() => setView(view === 'agenda' ? 'month' : 'agenda')}
                >
                    {view === 'agenda' ? <CalendarDays color={'#333'} /> : <C1 color={'#333'} />}
                </Button>
            </View>

            {/* Agenda View */}
            {view === 'agenda' ? (
                <Agenda
                    items={items}
                    selected={new Date().toISOString().split('T')[0]} // Default to today's date
                    renderItem={(item, firstItemInDay) => (
                        <View className="bg-gray-100 rounded-lg p-4 my-2 mx-4 shadow">
                            <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                            <Text className="text-sm text-gray-600">{item.time}</Text>
                        </View>
                    )}
                    renderEmptyDate={() => (
                        <View className="flex-1 justify-center items-center py-4">
                            <Text className="text-gray-500 text-sm">No events for this day.</Text>
                        </View>
                    )}
                    rowHasChanged={(r1, r2) => r1.name !== r2.name}
                />
            ) : (
                // Month View
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={{
                        '2025-01-28': { marked: true, dotColor: 'blue' },
                        '2025-01-29': { marked: true, dotColor: 'green' },
                        '2025-01-30': { marked: true, dotColor: 'red' },
                    }}
                    theme={{
                        todayTextColor: '#007AFF',
                        arrowColor: '#007AFF',
                        selectedDayBackgroundColor: '#007AFF',
                        selectedDayTextColor: '#ffffff',
                    }}
                />
            )}
        </View>
    );
};

export default CalendarScreen;
