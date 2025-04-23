import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/app/context/auth";
import { Card } from "~/components/ui/card";
import { User } from '~/lib/api/user';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Ionicons } from '@expo/vector-icons';

/**
 * Profile screen component that displays user information
 */
const ProfileScreen: React.FC = () => {
    const { user, signOut, refreshUserProfile } = useAuth();
    console.log(user);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Refresh user profile on component mount
    useEffect(() => {
        handleRefresh();
    }, []);
    
    // Handle profile refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshUserProfile();
        } catch (error) {
            console.error('Error refreshing profile:', error);
            Alert.alert('Error', 'Failed to refresh profile information');
        } finally {
            setIsRefreshing(false);
        }
    };
    
    // Get user profile from auth context
    const userProfile = user?.profile;
    
    // Generate initials for avatar
    const getInitials = (): string => {
        if (!userProfile) return '?';
        
        const firstName = userProfile.firstName || '';
        const lastName = userProfile.lastName || '';
        
        if (!firstName && !lastName) return '?';
        
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };
    
    // Format role for display
    const formatRole = (role?: string): string => {
        if (!role) return 'User';
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    };
    
    return (
        <ScrollView className="flex-1 bg-background p-4">
            <View className="items-center mb-6 mt-4">
                <Avatar className="h-24 w-24 mb-4 bg-primary">
                    <AvatarFallback>
                        <Text className="text-3xl text-white font-bold">{getInitials()}</Text>
                    </AvatarFallback>
                </Avatar>
                
                <Text className="text-2xl font-bold">
                    {userProfile?.firstName || ''} {userProfile?.lastName || ''}
                </Text>
                
                <View className="flex-row items-center mt-1">
                    <Text className="text-muted-foreground text-sm">
                        {userProfile?.email || 'No email provided'}
                    </Text>
                </View>
                
                <View className="mt-2">
                    <Text className="text-xs px-3 py-1 bg-primary/10 rounded-full text-primary">
                        {formatRole(userProfile?.role)}
                    </Text>
                </View>
            </View>
            
            {isRefreshing ? (
                <ActivityIndicator size="small" color="#0000ff" className="my-4" />
            ) : (
                <TouchableOpacity 
                    onPress={handleRefresh}
                    className="items-center my-4"
                >
                    <Text className="text-primary text-sm">Refresh Profile</Text>
                </TouchableOpacity>
            )}
            
            <Card className="mb-4 p-4">
                <Text className="text-lg font-semibold mb-2">Account Information</Text>
                
                <View className="flex-row justify-between items-center py-2 border-b border-border">
                    <Text className="text-muted-foreground">ID</Text>
                    <Text className="font-medium">{userProfile?.id || 'Unknown'}</Text>
                </View>
                
                <View className="flex-row justify-between items-center py-2 border-b border-border">
                    <Text className="text-muted-foreground">Email</Text>
                    <Text className="font-medium">{userProfile?.email || 'No email'}</Text>
                </View>
                
                <View className="flex-row justify-between items-center py-2 border-b border-border">
                    <Text className="text-muted-foreground">Role</Text>
                    <Text className="font-medium">{formatRole(userProfile?.role)}</Text>
                </View>
                
                <View className="flex-row justify-between items-center py-2">
                    <Text className="text-muted-foreground">Member Since</Text>
                    <Text className="font-medium">
                        {userProfile?.createdAt 
                            ? new Date(userProfile.createdAt).toLocaleDateString() 
                            : 'Unknown'}
                    </Text>
                </View>
            </Card>
            
            <Card className="mb-4 p-4">
                <Text className="text-lg font-semibold mb-2">Actions</Text>
                
                <TouchableOpacity 
                    className="flex-row items-center py-3 border-b border-border"
                    onPress={() => Alert.alert('Coming Soon', 'Edit profile feature coming soon!')}
                >
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <Text className="ml-3">Edit Profile</Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color="#666" 
                        style={{ marginLeft: 'auto' }} 
                    />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className="flex-row items-center py-3 border-b border-border"
                    onPress={() => Alert.alert('Coming Soon', 'Change password feature coming soon!')}
                >
                    <Ionicons name="lock-closed-outline" size={20} color="#666" />
                    <Text className="ml-3">Change Password</Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color="#666" 
                        style={{ marginLeft: 'auto' }} 
                    />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className="flex-row items-center py-3"
                    onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon!')}
                >
                    <Ionicons name="notifications-outline" size={20} color="#666" />
                    <Text className="ml-3">Notification Settings</Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color="#666" 
                        style={{ marginLeft: 'auto' }} 
                    />
                </TouchableOpacity>
            </Card>
            
            <Button 
                variant="destructive" 
                onPress={() => signOut()}
                className="mb-8"
            >
                <Text className="text-white">Logout</Text>
            </Button>
        </ScrollView>
    );
};

export default ProfileScreen;
