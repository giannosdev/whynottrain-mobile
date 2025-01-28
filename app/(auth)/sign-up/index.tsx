import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useRouter } from "expo-router";

const SignUpScreen: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        try {
            setIsLoading(true);

            // Make API request to /auth/sign-up
            const response = await fetch("http://10.0.2.2:3000/auth/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle backend errors
                Alert.alert("Error", data.message || "Failed to sign up.");
            } else {
                Alert.alert("Success", "Account created successfully.");
                router.replace("/log-in"); // Redirect to Log In
            }
        } catch (error) {
            console.error("Sign-Up error:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 items-center px-6">
            <Label htmlFor="email" className="text-secondary-foreground text-sm mb-2">
                Email
            </Label>
            <Input
                id="email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                className="bg-secondary border-0 mb-4"
            />

            <Label htmlFor="password" className="text-secondary-foreground text-sm mb-2">
                Password
            </Label>
            <Input
                id="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create your password"
                secureTextEntry
                className="bg-secondary border-0 mb-6"
            />

            <Button
                variant="default"
                onPress={handleSignUp}
                disabled={isLoading}
                className={`w-full py-2 ${isLoading ? "opacity-50" : ""}`}
            >
                <Text className="text-primary-foreground">
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </Text>
            </Button>
        </View>
    );
};

export default SignUpScreen;
