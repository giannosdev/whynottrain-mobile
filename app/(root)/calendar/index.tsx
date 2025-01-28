import React, { useState, useRef, useCallback } from "react";
import {View, Text, Alert, ImageBackground} from "react-native";
import { ExpandableCalendar, AgendaList, CalendarProvider } from "react-native-calendars";
import { Button } from "~/components/ui/button";
import {CalendarDays, CalendarXIcon as C1, EllipsisVertical} from "lucide-react-native";

const CalendarScreen: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState("2025-01-28");
    const itemsRef = useRef<{ [key: string]: any }>({
        "2025-01-28": [{ name: "Push Pull Legs (Beginner)", time: "0/4 activities done" }],
        "2025-01-29": [{ name: "Dentist Appointment", time: "1:00 PM" }],
        "2025-01-30": [{ name: "Grocery Shopping", time: "5:00 PM" }]
    });

    const agendaItems =
        itemsRef.current && typeof itemsRef.current === "object" && selectedDay in itemsRef.current
            ? [
                {
                    title: selectedDay,
                    data: itemsRef.current[selectedDay]
                }
            ]
            : [];


    const markedDates = Object.keys(itemsRef.current || {}).reduce((acc, date) => {
        acc[date] = { marked: true, dotColor: "blue" };
        return acc;
    }, {});

    const renderItem = useCallback(({ item }: any) => {
        return (
            <ImageBackground
                source={require("../../../assets/images/splash.jpg")} // Correct prop
                className="bg-gray-100 rounded-lg p-4"
                imageStyle={{ borderRadius: 8 }} // Optional: Smooth the edges
            >
                <View className="flex flex-row justify-between text-primary-foreground">
                    <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                    <EllipsisVertical size={18} color={"#333"} />
                </View>
                <Text className="text-sm text-gray-600">{item.time}</Text>
            </ImageBackground>
        );
    }, []);

    const onDatePress = (day: any) => {
        setSelectedDay(day.dateString);
    };

    return (
        <View className="flex-1 bg-white">
            <View className="p-4 flex flex-row items-center justify-between">
                {/*<Text>{new Date(selectedDay).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</Text>*/}
                <Text>Hello, Pantelis</Text>
            </View>

            <CalendarProvider
                date={selectedDay}
                showTodayButton
                onDateChanged={(date) => setSelectedDay(date)}
            >

                    <ExpandableCalendar
                        disableMonthChange
                        firstDay={1}
                        markedDates={markedDates}
                        theme={{
                            selectedDayBackgroundColor: "#007AFF",
                            selectedDayTextColor: "#ffffff",
                            todayTextColor: "#007AFF",
                            arrowColor: "#007AFF"
                        }}
                    />
                <AgendaList
                    sectionStyle={{display: "none"}}
                    sections={agendaItems.length > 0 ? agendaItems : []} // Ensure it's a valid array
                    renderItem={renderItem}
                    className="p-2 rounded-lg m-2 font-bold text-gray-800"
                />
            </CalendarProvider>
        </View>
    );
};

export default CalendarScreen;
