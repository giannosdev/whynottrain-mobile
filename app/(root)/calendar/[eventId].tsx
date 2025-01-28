import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {Button} from "~/components/ui/button";

const EventDetails: React.FC = () => {
    const { eventId } = useLocalSearchParams(); // Use useLocalSearchParams to fetch dynamic params
    const router = useRouter();


    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-lg font-bold">Event Details</Text>
            <Text className="text-base">Event ID: {eventId}</Text>
            <Text className="text-base">More details about this event...</Text>
            <Button title="Go Back" onPress={() => router.back()} />

        </View>
    );
};

export default EventDetails;
