import { View, Text, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const EventDetails: React.FC = () => {
    const { eventId } = useLocalSearchParams(); // Use useLocalSearchParams to fetch dynamic params
    const router = useRouter();

    return (
        <View className="flex-1">
            {/* ImageBackground extending to the entire screen */}
            <ImageBackground
                source={require("../../../assets/images/splash.jpg")}
                style={{ height: "60%" }} // Covers entire screen
            >
                <SafeAreaView className="flex-1 px-4">
                    <View className="flex flex-row justify-between">
                        <Text className="text-lg font-semibold text-white">Workout Name</Text>
                    </View>
                    <Text className="text-sm text-white">Workout Time</Text>
                </SafeAreaView>
            </ImageBackground>

            {/* Main content */}
            <SafeAreaView className="absolute bottom-0 w-full bg-white p-4 rounded-t-xl">
                <Text className="text-lg font-bold">Event Details</Text>
                <Text className="text-base">Event ID: {eventId}</Text>
                <Text className="text-base">More details about this event...</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </SafeAreaView>
        </View>
    );
};

export default EventDetails;
