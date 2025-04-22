import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Text} from "~/components/ui/text";

// Define types for the AuthContext
interface AuthContextType {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

interface User {
    token: string;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to access AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Hook to handle protected routes
function useProtectedRoute(user: User | null) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const inAuthGroup = segments[0] === "(auth)";

        if (!user && !inAuthGroup) {
            // Redirect to the sign-in page if no user is authenticated
            router.replace("/(auth)");
        } else if (user && inAuthGroup) {
            // Redirect to the main app if already authenticated
            router.replace("/(root)/calendar");
        }
    }, [user, segments]);
}

// AuthProvider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check token and authenticate user on app initialization
    useEffect(() => {
        const loadUserFromStorage = async () => {
            const token = await AsyncStorage.getItem("token");

            if (token) {
                // If a token exists, set the user in context
                setUser({ token });
            }

            setIsLoading(false); // Finish the loading process
        };

        loadUserFromStorage();
    }, []);

    // Apply route protection
    useProtectedRoute(user);

    // Function to handle sign-in
    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            const response = await fetch("http://10.0.2.2:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to log in.");
            }

            // Save the token to AsyncStorage
            await AsyncStorage.setItem("token", data.access_token);

            // Set the user in context
            setUser({ token: data.access_token });
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    // Function to handle sign-out
    const signOut = async (): Promise<void> => {
        await AsyncStorage.removeItem("token");
        setUser(null);
    };

    if (isLoading) {
        // Render a loading screen while token is being checked
        return <Text className="text-center mt-4">Loading...</Text>;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
