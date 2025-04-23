/**
 * User API service for fetching user-related data
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants";
import { jwtDecode } from "jwt-decode";

/**
 * User interface matching the backend model
 */
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * JWT payload interface
 */
interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Extract user ID from JWT token
 * @param token JWT token
 * @returns User ID from token
 */
export function getUserIdFromToken(token: string): string {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    throw new Error("Invalid token format");
  }
}

/**
 * Fetch the current user's profile information
 * @returns User profile data
 */
export async function fetchCurrentUser(): Promise<User> {
  const token = await AsyncStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  // Extract the user ID from the token
  const userId = getUserIdFromToken(token);
  
  // Fetch the user profile using the ID
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  
  return response.json();
}

/**
 * Update the current user's profile information
 * @param userData Partial user data to update
 * @returns Updated user profile
 */
export async function updateUserProfile(userData: Partial<User>): Promise<User> {
  const token = await AsyncStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  const response = await fetch(`${API_URL}/users/${userData.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error("Failed to update user profile");
  }
  
  return response.json();
}
