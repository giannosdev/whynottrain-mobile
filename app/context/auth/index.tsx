import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "~/components/ui/text";
import { User, fetchCurrentUser } from "~/lib/api/user";

// Define types for the AuthContext
interface AuthContextType {
    user: UserState | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

interface UserState {
    token: string;
    profile?: User;
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
function useProtectedRoute(user: UserState | null) {
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
    const [user, setUser] = useState<UserState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch user profile data
    const fetchUserProfile = async (token: string): Promise<User | undefined> => {
        try {
            return await fetchCurrentUser();
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return undefined;
        }
    };

    // Function to refresh user profile
    const refreshUserProfile = async (): Promise<void> => {
        if (!user?.token) return;
        
        try {
            const profile = await fetchUserProfile(user.token);
            if (profile) {
                setUser({ ...user, profile });
            }
        } catch (error) {
            console.error("Error refreshing user profile:", error);
        }
    };

    // Check token and authenticate user on app initialization
    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (token) {
                    // If a token exists, fetch the user profile
                    const profile = await fetchUserProfile(token);
                    setUser({ token, profile });
                }
            } catch (error) {
                console.error("Error loading user from storage:", error);
            } finally {
                setIsLoading(false); // Finish the loading process
            }
        };

        loadUserFromStorage();
    }, []);

    // Apply route protection
    useProtectedRoute(user);

    // Function to handle sign-in
    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            const response = await fetch("http://localhost:3000/auth/login", {
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

            // Fetch user profile with the new token
            const profile = await fetchUserProfile(data.access_token);

            // Set the user in context
            setUser({ token: data.access_token, profile });
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
                refreshUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
