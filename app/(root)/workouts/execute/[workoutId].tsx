import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  Animated,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Progress } from '~/components/ui/progress';
import { SafeAreaView } from 'react-native-safe-area-context';

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
 * Timer component for rest periods
 */
const RestTimer: React.FC<{
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ duration, onComplete, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const animationValue = useRef(new Animated.Value(0)).current;
  
  // Start the timer animation
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();
    
    // Timer countdown logic
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate progress width
  const progressWidth = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg my-2">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-blue-800 dark:text-blue-200 font-medium">Rest Timer</Text>
        <Text className="text-blue-800 dark:text-blue-200 font-bold">
          {timeLeft}s
        </Text>
      </View>
      
      <View className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-blue-600"
          style={{ width: progressWidth }}
        />
      </View>
      
      <TouchableOpacity 
        className="mt-2 items-center" 
        onPress={onSkip}
      >
        <Text className="text-blue-700 dark:text-blue-300 font-medium">
          Skip Rest
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Workout execution screen component
 * Allows users to track their sets and complete a workout
 */
const WorkoutExecution: React.FC = () => {
  const { workoutId } = useLocalSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const router = useRouter();

  /**
   * Starts the workout timer
   */
  useEffect(() => {
    if (!workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
    
    // Update elapsed time
    const timer = setInterval(() => {
      if (workoutStartTime) {
        const elapsed = Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [workoutStartTime]);

  /**
   * Format seconds into HH:MM:SS
   */
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean);
    
    return parts.join(':');
  };

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
        console.error('Error fetching workout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  /**
   * Get the current exercise and set
   */
  const getCurrentExercise = (): Exercise | undefined => {
    return workout?.exercises[currentExerciseIndex];
  };

  const getCurrentSet = (): Set | undefined => {
    const exercise = getCurrentExercise();
    return exercise?.sets[currentSetIndex];
  };

  /**
   * Calculate completion percentage
   */
  const calculateCompletionPercentage = (): number => {
    if (!workout) return 0;
    
    let completedSets = 0;
    let totalSets = 0;
    
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalSets++;
        if (set.isCompleted) completedSets++;
      });
    });
    
    return totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  };

  /**
   * Mark current set as completed
   */
  const completeSet = async (
    reps?: number, 
    weight?: number, 
    duration?: number
  ) => {
    if (!workout) return;
    
    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises[currentExerciseIndex];
    const set = exercise.sets[currentSetIndex];
    
    // Update the set with actual values
    set.isCompleted = true;
    if (reps !== undefined) set.actualReps = reps;
    if (weight !== undefined) set.actualWeight = weight;
    if (duration !== undefined) set.actualDuration = duration;
    
    // Move to next set or exercise
    let newExerciseIndex = currentExerciseIndex;
    let newSetIndex = currentSetIndex;
    
    if (currentSetIndex < exercise.sets.length - 1) {
      // Move to next set in the same exercise
      newSetIndex = currentSetIndex + 1;
      
      // Start rest timer
      setRestDuration(set.restTime);
      setIsResting(true);
    } else {
      // Current exercise is completed
      exercise.isCompleted = true;
      
      // Try to move to the next exercise
      if (currentExerciseIndex < updatedWorkout.exercises.length - 1) {
        newExerciseIndex = currentExerciseIndex + 1;
        newSetIndex = 0;
      } else {
        // Workout is complete
        await saveWorkout(updatedWorkout);
        router.push('/(root)/workouts/complete');
        return;
      }
    }
    
    // Update completion status
    updatedWorkout.completionStatus = calculateCompletionPercentage();
    
    // Save updated workout
    await saveWorkout(updatedWorkout);
    
    // Update state
    setWorkout(updatedWorkout);
    setCurrentExerciseIndex(newExerciseIndex);
    setCurrentSetIndex(newSetIndex);
  };

  /**
   * Handle rest timer completion
   */
  const handleRestComplete = () => {
    setIsResting(false);
  };

  /**
   * Save workout progress to API
   */
  const saveWorkout = async (updatedWorkout: Workout) => {
    setSaveInProgress(true);
    try {
      const response = await fetch(`http://localhost:3000/workouts/${workoutId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkout),
      });
      if (!response.ok) {
        throw new Error('Failed to save workout progress');
      }
    } catch (error) {
      console.error('Error saving workout progress:', error);
      Alert.alert('Error', 'Failed to save your progress');
    } finally {
      setSaveInProgress(false);
    }
  };

  /**
   * Handle user input for completing a set
   */
  const handleSetComplete = () => {
    const currentSet = getCurrentSet();
    const currentExercise = getCurrentExercise();
    
    if (!currentSet || !currentExercise) return;
    
    let reps = currentSet.targetReps;
    let weight = currentSet.targetWeight;
    let duration = currentSet.targetDuration;
    
    // For strength exercises
    if (currentSet.targetReps !== undefined) {
      Alert.prompt(
        'Complete Set',
        `Enter the reps and weight completed for set ${currentSetIndex + 1} of ${currentExercise.name}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: (input) => {
              const [inputReps, inputWeight] = (input || '').split(',').map(Number);
              completeSet(
                !isNaN(inputReps) ? inputReps : reps,
                !isNaN(inputWeight) ? inputWeight : weight
              );
            },
          },
        ],
        'plain-text',
        `${reps},${weight || 0}`,
        'numbers-and-punctuation'
      );
    } 
    // For timed exercises
    else if (currentSet.targetDuration !== undefined) {
      Alert.prompt(
        'Complete Set',
        `Enter the duration completed (in seconds) for set ${currentSetIndex + 1} of ${currentExercise.name}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: (input) => {
              const inputDuration = Number(input);
              completeSet(undefined, undefined, !isNaN(inputDuration) ? inputDuration : duration);
            },
          },
        ],
        'plain-text',
        `${duration}`,
        'number-pad'
      );
    } else {
      // Simple complete for other types
      completeSet();
    }
  };

  /**
   * Handle skipping an exercise
   */
  const handleSkipExercise = () => {
    Alert.alert(
      'Skip Exercise',
      'Are you sure you want to skip this exercise? It will be marked as incomplete.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            if (!workout) return;
            
            const updatedWorkout = { ...workout };
            let newExerciseIndex = currentExerciseIndex;
            
            // Try to move to the next exercise
            if (currentExerciseIndex < updatedWorkout.exercises.length - 1) {
              newExerciseIndex = currentExerciseIndex + 1;
              
              // Update state
              setCurrentExerciseIndex(newExerciseIndex);
              setCurrentSetIndex(0);
              setWorkout(updatedWorkout);
            } else {
              // Last exercise - go to completion
              router.push('/(root)/workouts/complete');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle ending the workout early
   */
  const handleEndWorkoutEarly = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout? Your progress will be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Workout',
          onPress: async () => {
            if (!workout) return;
            
            // Save current progress
            const updatedWorkout = { ...workout };
            updatedWorkout.completionStatus = calculateCompletionPercentage();
            await saveWorkout(updatedWorkout);
            
            // Navigate to completion screen
            router.push('/(root)/workouts/complete');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
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

  const currentExercise = getCurrentExercise();
  const currentSet = getCurrentSet();
  const completionPercentage = calculateCompletionPercentage();

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      {/* Header with workout name and elapsed time */}
      <View className="bg-blue-600 dark:bg-blue-800 p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-white">{workout.name}</Text>
          <Text className="text-sm text-white text-opacity-90">
            {completionPercentage}% Complete
          </Text>
        </View>
        <View className="bg-blue-700 dark:bg-blue-900 px-3 py-2 rounded-lg">
          <Text className="text-white font-mono">{formatTime(elapsedTime)}</Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View className="px-4 py-2">
        <Progress value={completionPercentage} />
      </View>
      
      <ScrollView className="flex-1 px-4">
        {isResting ? (
          <RestTimer 
            duration={restDuration} 
            onComplete={handleRestComplete}
            onSkip={handleRestComplete}
          />
        ) : currentExercise ? (
          <Card className="my-4 p-4 bg-white dark:bg-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {currentExerciseIndex + 1}. {currentExercise.name}
            </Text>
            
            {currentExercise.description && (
              <Text className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {currentExercise.description}
              </Text>
            )}
            
            <Separator className="my-3" />
            
            <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Set {currentSetIndex + 1} of {currentExercise.sets.length}
            </Text>
            
            {currentSet && (
              <View className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                {currentSet.targetReps !== undefined && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Reps:
                    </Text>
                    <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {currentSet.targetReps}
                    </Text>
                  </View>
                )}
                
                {currentSet.targetWeight !== undefined && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Weight:
                    </Text>
                    <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {currentSet.targetWeight} kg
                    </Text>
                  </View>
                )}
                
                {currentSet.targetDuration !== undefined && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Duration:
                    </Text>
                    <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {currentSet.targetDuration} sec
                    </Text>
                  </View>
                )}
                
                <View className="flex-row justify-between">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rest After:
                  </Text>
                  <Text className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {currentSet.restTime} sec
                  </Text>
                </View>
              </View>
            )}
            
            {currentExercise.note && (
              <View className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg mb-4">
                <Text className="text-xs text-yellow-800 dark:text-yellow-200">
                  Note: {currentExercise.note}
                </Text>
              </View>
            )}
            
            <Button 
              onPress={handleSetComplete}
              className="bg-green-600 dark:bg-green-700 mb-2"
              disabled={saveInProgress}
            >
              {saveInProgress 
                ? 'Saving...' 
                : `Complete Set ${currentSetIndex + 1}`
              }
            </Button>
            
            <TouchableOpacity 
              className="mt-2 items-center" 
              onPress={handleSkipExercise}
              disabled={saveInProgress}
            >
              <Text className="text-red-600 dark:text-red-400 font-medium">
                Skip This Exercise
              </Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-700 dark:text-gray-300">
              No more exercises in this workout.
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Bottom action bar */}
      <SafeAreaView edges={['bottom']} className="bg-white dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <Button 
          onPress={handleEndWorkoutEarly} 
          className="bg-red-600 dark:bg-red-700"
          disabled={saveInProgress}
        >
          End Workout Early
        </Button>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default WorkoutExecution;
