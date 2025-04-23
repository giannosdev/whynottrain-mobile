import React, { useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { ExpandableCalendar, AgendaList, CalendarProvider } from "react-native-calendars";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "~/app/context/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";

/**
 * Interface for workout data
 */
interface Workout {
    id: string;
    name: string;
    description?: string;
    exercises: Exercise[];
    completionStatus: number;
    programId?: string;
    programName?: string;
    scheduledDate?: string;
}

/**
 * Interface for exercise data
 */
interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps?: number;
    duration?: number;
    weight?: number;
    restTime?: number;
}

/**
 * Fetch workouts from the NestJS API
 */
const fetchWorkouts = async () => {
    const response = await axios.get("http://localhost:3000/workouts");
    return response.data;
};

/**
 * Combined Calendar and Workouts List Screen
 */
const CalendarScreen: React.FC = () => {
    // State for toggling between Calendar and List views
    const [view, setView] = useState<"calendar" | "list">("calendar");
    
    const router = useRouter();
    const { user } = useAuth();
    
    // Get workouts data using TanStack Query
    const {
        data: workouts = [],
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ["workouts"],
        queryFn: fetchWorkouts,
    });
    
    // ---- Calendar View Logic ----
    const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
    
    // Create calendar items from workouts data
    const calendarItems = React.useMemo(() => {
        const itemsMap: { [key: string]: any[] } = {};
        
        workouts.forEach((workout: Workout) => {
            if (workout.scheduledDate) {
                if (!itemsMap[workout.scheduledDate]) {
                    itemsMap[workout.scheduledDate] = [];
                }
                
                itemsMap[workout.scheduledDate].push({
                    id: workout.id,
                    name: workout.name,
                    time: `${workout.exercises?.length || 0} exercises`,
                    workout
                });
            }
        });
        
        return itemsMap;
    }, [workouts]);
    
    // Mark dates that have workouts
    const markedDates = React.useMemo(() => {
        return Object.keys(calendarItems).reduce((acc: any, date) => {
            acc[date] = { marked: true, dotColor: "#007AFF" };
            return acc;
        }, {});
    }, [calendarItems]);
    
    // Format agenda items for the selected day
    const agendaItems = 
        selectedDay in calendarItems
            ? [{ title: selectedDay, data: calendarItems[selectedDay] }]
            : [];
    
    // ---- List View Logic ----
    /**
     * Handle workout item press to navigate to details
     */
    const handleWorkoutPress = (workoutId: string) => {
        router.push(`/(root)/workouts/${workoutId}`);
    };
    
    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = () => {
        refetch();
    };
    
    /**
     * Calculate days from today to scheduled date
     */
    const getDaysToScheduled = (dateStr?: string): string => {
        if (!dateStr) return "";
        
        const today = new Date();
        const scheduledDate = new Date(dateStr);
        
        // Reset time portion for accurate day calculation
        today.setHours(0, 0, 0, 0);
        scheduledDate.setHours(0, 0, 0, 0);
        
        const diffTime = scheduledDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        
        return `In ${diffDays} days`;
    };
    
    // ---- Render Functions ----
    /**
     * Render calendar item for AgendaList
     */
    const renderCalendarItem = useCallback(({ item }: any) => {
        return (
            <TouchableOpacity
                onPress={() => router.push(`/(root)/workouts/${item.id}`)}
                className="mb-3"
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
    }, [router]);
    
    /**
     * Render workout item for the List view
     */
    const renderWorkout = ({ item }: { item: Workout }) => (
        <TouchableOpacity 
            className="px-4 mb-4" 
            onPress={() => handleWorkoutPress(item.id)}
        >
            <Card className="p-4 rounded-lg shadow-sm">
                <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Program: {item.programName || "Standalone Workout"}
                    </Text>
                </View>
                <View className="mt-2">
                    <Text className="text-sm text-gray-600 dark:text-gray-300">
                        {item.description || "No description available"}
                    </Text>
                </View>
                
                {item.scheduledDate && (
                    <View className="mt-2 flex-row justify-between items-center">
                        <Text className="text-xs text-blue-600 dark:text-blue-400">
                            {getDaysToScheduled(item.scheduledDate)}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {item.exercises?.length} exercises
                        </Text>
                    </View>
                )}
                
                {item.completionStatus > 0 && (
                    <View className="mt-3">
                        <Progress value={item.completionStatus} className="h-2" />
                        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                            {Math.round(item.completionStatus)}% complete
                        </Text>
                    </View>
                )}
            </Card>
        </TouchableOpacity>
    );
    
    /**
     * Render segmented control for view toggling
     */
    const renderSegmentedControl = () => (
        <View className="flex-row justify-center my-3 mx-4">
            <TouchableOpacity
                className={`px-4 py-2 rounded-l-full ${view === "calendar" ? "bg-blue-600" : "bg-gray-200"}`}
                onPress={() => setView("calendar")}
            >
                <Text className={view === "calendar" ? "text-white font-bold" : "text-gray-700"}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className={`px-4 py-2 rounded-r-full ${view === "list" ? "bg-blue-600" : "bg-gray-200"}`}
                onPress={() => setView("list")}
            >
                <Text className={view === "list" ? "text-white font-bold" : "text-gray-700"}>List</Text>
            </TouchableOpacity>
        </View>
    );
    
    // ---- Loading and Error States ----
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text className="text-red-500 mb-4">Failed to load workouts</Text>
                <Button onPress={() => refetch()} className="mt-4">Try Again</Button>
            </SafeAreaView>
        );
    }

    // ---- Main Render ----
    return (
        <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
            {renderSegmentedControl()}
            
            {view === "calendar" ? (
                <View className="flex-1">
                    <CalendarProvider 
                        date={selectedDay} 
                        showTodayButton 
                        onDateChanged={setSelectedDay}
                    >
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
                        {agendaItems.length > 0 ? (
                            <AgendaList
                                sections={agendaItems}
                                renderItem={renderCalendarItem}
                                sectionStyle={{ backgroundColor: "#f0f0f0" }}
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center p-4">
                                <Text className="text-gray-500">No workouts scheduled for this date</Text>
                            </View>
                        )}
                    </CalendarProvider>
                </View>
            ) : (
                <View className="flex-1">
                    <View className="px-4 py-3">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white">
                            My Workouts
                        </Text>
                    </View>
                    {workouts.length > 0 ? (
                        <FlatList
                            data={workouts}
                            keyExtractor={item => item.id}
                            renderItem={renderWorkout}
                            refreshControl={
                                <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
                            }
                            contentContainerStyle={{ paddingBottom: 32 }}
                        />
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-gray-600 dark:text-gray-300">No workouts found.</Text>
                            <Button onPress={() => refetch()} className="mt-4">Refresh</Button>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

export default CalendarScreen;
