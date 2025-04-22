import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/app/context/auth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Interface for workout data
 */
interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  completionStatus: number;
  programId?: string;
  programName?: string;
  scheduledDate?: string;
}

/**
 * Interface for exercise data
 */
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number;
  weight?: number;
  restTime?: number;
}

/**
 * Fetch workouts from the NestJS API
 */
const fetchWorkouts = async () => {
  const response = await axios.get('http://localhost:3000/workouts'); // Update URL as needed
  console.log(response.data);
  return response.data;
};

/**
 * Workouts list screen component
 * Displays all workouts assigned to the user
 */
const WorkoutsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: workouts = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  });

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = () => {
    refetch();
  };

  /**
   * Navigate to workout details screen
   */
  const handleWorkoutPress = (workoutId: string) => {
    router.push(`/(root)/workouts/${workoutId}`);
  };

  /**
   * Calculate days from today to scheduled date
   */
  const getDaysToScheduled = (dateStr?: string): string => {
    if (!dateStr) return '';
    
    const today = new Date();
    const scheduledDate = new Date(dateStr);
    
    // Reset time portion for accurate day calculation
    today.setHours(0, 0, 0, 0);
    scheduledDate.setHours(0, 0, 0, 0);
    
    const diffTime = scheduledDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return `In ${diffDays} days`;
  };

  /**
   * Renders individual workout card
   */
  const renderWorkout = ({ item }: { item: Workout }) => (
    <TouchableOpacity 
      className="px-4 mb-4" 
      onPress={() => handleWorkoutPress(item.id)}
    >
      <Card className="p-4 rounded-lg shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.name}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Program: {item.programName || 'Standalone Workout'}
          </Text>
        </View>
        <View className="mt-2">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {item.description || 'No description available'}
          </Text>
        </View>
        
        {item.scheduledDate && (
          <View className="mt-2 flex-row justify-between items-center">
            <Text className="text-xs text-blue-600 dark:text-blue-400">
              {getDaysToScheduled(item.scheduledDate)}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {item.exercises?.length} exercises
            </Text>
          </View>
        )}
        
        {item.completionStatus > 0 && (
          <View className="mt-3">
            <Progress value={item.completionStatus} className="h-2" />
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {Math.round(item.completionStatus)}% complete
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  if (isLoading || isRefetching) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 mb-4">Failed to load workouts</Text>
        <Button onPress={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </View>
    );
  }

  if (!workouts?.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600 dark:text-gray-300">No workouts found.</Text>
        <Button onPress={() => refetch()} className="mt-4">
          Refresh
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="px-4 py-3">
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          My Workouts
        </Text>
      </View>
      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={renderWorkout}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

export default WorkoutsScreen;
