import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
 * Workout details screen component
 * Shows details of a specific workout and allows user to start execution
 */
const WorkoutDetails: React.FC = () => {
  const { workoutId } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch workout details from API
   */
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`http://localhost:3000/workouts/${workoutId}`);
        const data = await response.json();
        setWorkout(data);
      } catch (error) {
        console.error('Error fetching workout details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  /**
   * Start workout execution
   */
  const handleStartWorkout = () => {
    if (workout?.completionStatus && workout.completionStatus > 0) {
      // Confirm if the user wants to restart an in-progress workout
      Alert.alert(
        "Workout In Progress",
        "This workout is already in progress. Do you want to continue or restart?",
        [
          {
            text: "Continue",
            // Use the simplest navigation approach - this works reliably with Expo Router
            onPress: () => {
              if (workout?.id) {
                // @ts-ignore - Working around Expo Router typing issues
                router.navigate(`../execute/${workout.id}`);
              }
            },
          },
          {
            text: "Restart",
            onPress: () => console.log('Restart workout'),
            style: "destructive",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      // @ts-ignore - Working around Expo Router typing issues
      router.navigate(`../execute/${workout?.id}`);
    }
  };

  /**
   * Navigate to the exercise reordering screen
   */
  const handleReorderExercises = () => {
    if (workout) {
      // @ts-ignore - Working around Expo Router typing issues
      router.navigate(`../reorder/${workout.id}`);
    }
  };

  /**
   * Calculate total volume for strength exercises
   */
  const calculateVolume = (exercise: Exercise): number => {
    let volume = 0;
    
    exercise.sets.forEach(set => {
      if (set.targetReps && set.targetWeight) {
        volume += set.targetReps * set.targetWeight;
      }
    });
    
    return volume;
  };

  /**
   * Calculate estimated workout duration
   */
  const calculateDuration = (exercises: Exercise[]): number => {
    let totalMinutes = 0;
    
    exercises.forEach(exercise => {
      // Sum of all set durations (including rest times)
      exercise.sets.forEach(set => {
        // For strength exercises: approximate 30 seconds per set + rest time
        if (set.targetReps) {
          totalMinutes += (30 + set.restTime) / 60;
        } 
        // For cardio/timed exercises: use the target duration + rest time
        else if (set.targetDuration) {
          totalMinutes += (set.targetDuration + set.restTime) / 60;
        }
      });
    });
    
    // Add 5 minutes for warm-up and transitions
    return Math.ceil(totalMinutes) + 5;
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
            The workout you're looking for doesn't exist or has been deleted.
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ScrollView>
        {/* Workout Header */}
        <View className="bg-blue-600 dark:bg-blue-800 p-4">
          <Text className="text-2xl font-bold text-white">{workout.name}</Text>
          {workout.description && (
            <Text className="text-sm text-white text-opacity-90 mt-1">{workout.description}</Text>
          )}
          
          <View className="flex-row items-center mt-3">
            {workout.programName && (
              <View className="flex-row items-center mr-4">
                <Text className="text-xs text-white text-opacity-80">Program: </Text>
                <Text className="text-xs font-medium text-white">{workout.programName}</Text>
              </View>
            )}
            
            {workout.estimatedDuration && (
              <View className="flex-row items-center">
                <Text className="text-xs text-white text-opacity-80">Duration: </Text>
                <Text className="text-xs font-medium text-white">~{workout.estimatedDuration} min</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row justify-between items-center p-4 bg-white dark:bg-gray-800">
          <Button 
            className="flex-1 mr-2 bg-blue-600 dark:bg-blue-500" 
            onPress={handleStartWorkout}
          >
            <View className="flex-row items-center">
              <Ionicons name="play" size={18} color="white" />
              <Text className="text-white font-semibold ml-1">
                {workout.completionStatus > 0 ? 'Continue Workout' : 'Start Workout'}
              </Text>
            </View>
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 ml-2" 
            onPress={handleReorderExercises}
          >
            <View className="flex-row items-center">
              <Ionicons name="reorder-two-outline" size={18} color="#007AFF" />
              <Text className="text-blue-600 dark:text-blue-400 font-semibold ml-1">
                Reorder Exercises
              </Text>
            </View>
          </Button>
        </View>

        <Separator />
        
        {/* Exercises List */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Exercises ({workout?.workoutExercises?.length})
          </Text>

          {workout?.workoutExercises?.map((exercise, index) => (
            <Card key={exercise.id} className="mb-4 p-4 bg-white dark:bg-gray-800">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {index + 1}. {exercise.name}
                </Text>
                {exercise.type && (
                  <View className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1">
                    <Text className="text-xs capitalize text-gray-800 dark:text-gray-200">
                      {exercise.type}
                    </Text>
                  </View>
                )}
              </View>
              
              {exercise.description && (
                <Text className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {exercise.description}
                </Text>
              )}
              
              <Separator className="my-2" />
              
              <View className="mt-2">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Set Details:
                </Text>
                
                <View className="flex-row bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded-t-md">
                  <Text className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">Set</Text>
                  <Text className="flex-2 text-xs font-medium text-gray-700 dark:text-gray-300">Target</Text>
                  <Text className="flex-2 text-xs font-medium text-gray-700 dark:text-gray-300">Rest</Text>
                </View>
                
                {exercise.sets.map((set, setIndex) => (
                  <View 
                    key={set.id} 
                    className={`flex-row py-2 px-3 border-b border-gray-200 dark:border-gray-700 ${
                      setIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-750' : ''
                    }`}
                  >
                    <Text className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                      {setIndex + 1}
                    </Text>
                    <Text className="flex-2 text-sm text-gray-800 dark:text-gray-200">
                      {set.targetReps 
                        ? `${set.targetReps} reps × ${set.targetWeight || 0}kg` 
                        : set.targetDuration 
                          ? `${set.targetDuration}s`
                          : 'Not specified'
                      }
                    </Text>
                    <Text className="flex-2 text-sm text-gray-800 dark:text-gray-200">
                      {set.restTime}s
                    </Text>
                  </View>
                ))}
              </View>
              
              {exercise.type === 'strength' && (
                <View className="mt-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                  <Text className="text-xs text-blue-800 dark:text-blue-200">
                    Total Volume: {calculateVolume(exercise)}kg
                  </Text>
                </View>
              )}
              
              {exercise.note && (
                <View className="mt-3 bg-yellow-50 dark:bg-yellow-900 p-2 rounded">
                  <Text className="text-xs text-yellow-800 dark:text-yellow-200">
                    Note: {exercise.note}
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </View>
        
        {/* Notes Section */}
        {workout.notes && (
          <View className="px-4 mb-4">
            <Card className="p-4 bg-white dark:bg-gray-800">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Notes
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {workout.notes}
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
      
      {/* Fixed Start Button */}
      <SafeAreaView edges={['bottom']} className="bg-white dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <Button onPress={handleStartWorkout} className="bg-blue-600 dark:bg-blue-500">
          {workout.completionStatus > 0 
            ? `Continue Workout (${workout.completionStatus}% done)`
            : 'Start Workout'
          }
        </Button>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default WorkoutDetails;
