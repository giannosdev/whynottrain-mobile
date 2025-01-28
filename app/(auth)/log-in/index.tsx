import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useAuth } from "~/app/context/auth"; // Import the useAuth hook
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const LogInScreen: React.FC = () => {
    const { signIn } = useAuth(); // Access signIn from AuthContext
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        try {
            setIsLoading(true);
            await signIn(email, password); // Call the signIn function from AuthContext
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to log in.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 items-center">
            <View className="w-11/12 pt-12">
                {/* Email Input */}
                <View className="mb-4">
                    <Label htmlFor="email" className="text-secondary-foreground text-sm mb-2">
                        Email
                    </Label>
                    <Input
                        id="email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        className="bg-secondary border-0"
                    />
                </View>

                {/* Password Input */}
                <View className="mb-6">
                    <Label htmlFor="password" className="text-secondary-foreground text-sm mb-2">
                        Password
                    </Label>
                    <Input
                        id="password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        className="bg-secondary border-0"
                    />
                </View>

                {/* Log In Button */}
                <Button
                    variant="default"
                    onPress={handleLogin}
                    disabled={isLoading}
                    className={`w-full py-2 ${isLoading ? "opacity-50" : ""}`}
                >
                    <Text className="text-primary-foreground">
                        {isLoading ? "Logging In..." : "Log In"}
                    </Text>
                </Button>
            </View>
        </View>
    );
};

export default LogInScreen;
