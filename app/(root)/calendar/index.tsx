import React, { useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { ExpandableCalendar, AgendaList, CalendarProvider } from "react-native-calendars";
import { useRouter } from "expo-router";

const CalendarScreen: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState("2025-01-28");
    const router = useRouter();
    const itemsRef = useRef<{ [key: string]: any }>({
        "2025-01-28": [{ id: "1", name: "Push Pull Legs (Beginner)", time: "0/4 activities done" }],
        "2025-01-29": [{ id: "2", name: "Dentist Appointment", time: "1:00 PM" }],
        "2025-01-30": [{ id: "3", name: "Grocery Shopping", time: "5:00 PM" }],
    });

    const agendaItems =
        itemsRef.current && typeof itemsRef.current === "object" && selectedDay in itemsRef.current
            ? [
                {
                    title: selectedDay,
                    data: itemsRef.current[selectedDay],
                },
            ]
            : [];

    const markedDates = Object.keys(itemsRef.current || {}).reduce((acc, date) => {
        acc[date] = { marked: true, dotColor: "blue" };
        return acc;
    }, {});

    const renderItem = useCallback(({ item }: any) => {
        return (
            <TouchableOpacity
                onPress={() => router.push(`/(root)/calendar/${item.id}`)} // Navigate to event details
            >
                <ImageBackground
                    source={require("../../../assets/images/splash.jpg")}
                    className="bg-gray-100 rounded-lg p-4"
                    imageStyle={{ borderRadius: 8 }}
                >
                    <View className="flex flex-row justify-between">
                        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                    </View>
                    <Text className="text-sm text-gray-600">{item.time}</Text>
                </ImageBackground>
            </TouchableOpacity>
        );
    }, []);

    return (
        <View className="flex-1 bg-white">
            <CalendarProvider date={selectedDay} showTodayButton onDateChanged={(date) => setSelectedDay(date)}>
                <ExpandableCalendar
                    disableMonthChange
                    firstDay={1}
                    markedDates={markedDates}
                    theme={{
                        selectedDayBackgroundColor: "#007AFF",
                        selectedDayTextColor: "#ffffff",
                        todayTextColor: "#007AFF",
                        arrowColor: "#007AFF",
                    }}
                />
                <AgendaList
                    sections={agendaItems}
                    renderItem={renderItem}
                    className="p-2 rounded-lg m-2"
                />
            </CalendarProvider>
        </View>
    );
};

export default CalendarScreen;
