import React from 'react';
import { Stack } from 'expo-router';

/**
 * Layout for Workout-related screens 
 * Configures the navigation stack for the workout execution flow
 */
export default function WorkoutLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Workouts',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="[workoutId]"
        options={{
          title: 'Workout Details',
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="execute/[workoutId]"
        options={{
          title: 'Workout In Progress',
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="reorder/[workoutId]"
        options={{
          title: 'Reorder Exercises',
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="complete"
        options={{
          title: 'Workout Complete',
          headerTitleAlign: 'center',
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
