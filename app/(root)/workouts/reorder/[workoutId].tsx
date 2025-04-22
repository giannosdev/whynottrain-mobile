import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import ReorderableExerciseList from '~/app/components/workout/ReorderableExerciseList';

/**
 * Interface for set data
 */
interface Set {
  id: string;
  setNumber: number;
  targetReps?: number;
  targetDuration?: number;
  targetWeight?: number;
  restTime: number;
  isCompleted?: boolean;
  actualReps?: number;
  actualDuration?: number;
  actualWeight?: number;
}

/**
 * Interface for exercise data
 */
interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets: Set[];
  type?: 'strength' | 'cardio' | 'flexibility';
  muscles?: string[];
  equipment?: string;
  videoUrl?: string;
  note?: string;
  isCompleted?: boolean;
  order?: number;
}

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
  estimatedDuration?: number;
  notes?: string;
}

/**
 * WorkoutReorderScreen component
 * Allows users to reorder exercises in a workout
 */
const WorkoutReorderScreen: React.FC = () => {
  const { workoutId } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  /**
   * Fetch workout data from API
   */
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`http://localhost:3000/workouts/${workoutId}`);
        const data = await response.json();
        setWorkout(data);
      } catch (error) {
        console.error('Error fetching workout for reordering:', error);
        Alert.alert('Error', 'Failed to load workout data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  /**
   * Handle exercise reordering
   * @param reorderedExercises - The newly ordered exercises array
   */
  const handleReorder = async (reorderedExercises: Exercise[]) => {
    if (!workout) return;
    
    // Update local state with new exercise order
    setWorkout({
      ...workout,
      exercises: reorderedExercises
    });
  };

  /**
   * Save the reordered workout to API
   */
  const handleSave = async () => {
    if (!workout) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:3000/workouts/${workoutId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workout)
      });
      if (response.ok) {
        // Navigate back
        router.back();
      } else {
        console.error('Error saving workout order:', response.status);
        Alert.alert('Error', 'Failed to save exercise order');
      }
    } catch (error) {
      console.error('Error saving workout order:', error);
      Alert.alert('Error', 'Failed to save exercise order');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancellation
   */
  const handleCancel = () => {
    // Confirm before discarding changes
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard changes to exercise order?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-2 text-gray-600 dark:text-gray-300">Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-800 dark:text-gray-200 mb-2">Workout Not Found</Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
            The workout you're trying to reorder doesn't exist or has been deleted.
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="bg-blue-600 dark:bg-blue-800 p-4">
        <Text className="text-xl font-bold text-white">{workout.name}</Text>
        <Text className="text-sm text-white text-opacity-90">Reorder Exercises</Text>
      </View>
      
      {workout.exercises.length > 0 ? (
        <ReorderableExerciseList 
          exercises={workout.exercises}
          onReorder={handleReorder}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-gray-700 dark:text-gray-300 text-center">
            No exercises found in this workout.
          </Text>
        </View>
      )}
      
      <SafeAreaView edges={['bottom']} className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row justify-between">
          <Button 
            variant="outline" 
            className="flex-1 mr-2"
            onPress={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 ml-2 bg-blue-600 dark:bg-blue-500"
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Order'}
          </Button>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default WorkoutReorderScreen;
