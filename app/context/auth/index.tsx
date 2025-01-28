import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types for the AuthContext
interface AuthContextType {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// Define types for the User object
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
            // Redirect to the sign-in page if not authenticated
            router.replace("/(auth)/index");
        } else if (user && inAuthGroup) {
            // Redirect to the main app if already authenticated
            router.replace("(root)/calendar");
        }
    }, [user, segments]);
}

// AuthProvider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

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
