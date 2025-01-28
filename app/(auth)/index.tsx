import React from "react";
import { View, Image, Text, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const carouselItems = [
    {
        image: require("../../assets/images/slide1.jpg"), // Replace with your slide image
        title: "Programs for everyone",
        subtitle: "Ready or tailored programs for all levels",
    },
    {
        image: require("../../assets/images/slide2.jpg"), // Replace with your slide image
        title: "Keep control",
        subtitle: "Track your workouts, become better everyday",
    },
    {
        image: require("../../assets/images/slide3.jpg"), // Replace with your slide image
        title: "Anywhere, Anytime",
        subtitle: "Extensive collection of exercise videos",
    },
];

const LandingScreen: React.FC = () => {
    const router = useRouter();

    return (
        <View className="flex-1">
            {/* Carousel */}
            <Carousel
                loop
                width={width}
                height={height}
                autoPlay
                autoPlayInterval={3000}
                data={carouselItems}
                scrollAnimationDuration={1000}
                renderItem={({ item }) => (
                    <View className="flex-1">
                        <Image
                            source={item.image}
                            style={{ width, height }}
                            resizeMode="cover"
                            blurRadius={3}
                        />
                        <View className="gap-2 absolute top-[50%] w-full items-center z-10 -translate-y-10 px-6">
                            <Text className="text-center text-white text-xl font-semibold">
                                {item.title}
                            </Text>
                            <Text className="text-center text-white text-md font-semibold">
                                {item.subtitle}
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Logo at the top */}
            <View className="absolute top-12 w-full items-center z-10">
                <Text className="text-white text-2xl font-semibold">Why Not Train?</Text>
            </View>

            {/* Bottom Buttons */}
            <View className="absolute bottom-12 w-full flex-row items-center justify-center gap-12 px-6 z-10">
                <Button variant="ghost" onPress={() => router.push("/sign-up")}>
                    <Text className="text-white">Sign up</Text>
                </Button>
                <Separator orientation="vertical" className="bg-white h-6" />
                <Button variant="ghost" onPress={() => router.push("/log-in")}>
                    <Text className="text-white">Log in</Text>
                </Button>
            </View>
        </View>
    );
};

export default LandingScreen;
