import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DraggableFlatList, { 
  ScaleDecorator,
  RenderItemParams 
} from 'react-native-draggable-flatlist';
import { Card } from '~/components/ui/card';
import { Ionicons } from '@expo/vector-icons';

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
 * Props for ReorderableExerciseList component
 */
interface ReorderableExerciseListProps {
  exercises: Exercise[];
  onReorder: (exercises: Exercise[]) => void;
  onExercisePress?: (exerciseId: string) => void;
}

/**
 * ReorderableExerciseList component
 * Allows drag and drop reordering of exercises
 * 
 * @param props - Component props including exercises, onReorder callback, and onExercisePress callback
 * @returns JSX.Element
 */
const ReorderableExerciseList: React.FC<ReorderableExerciseListProps> = ({ 
  exercises, 
  onReorder, 
  onExercisePress 
}) => {
  const [data, setData] = useState(exercises);

  /**
   * Handle drag end and update exercise order
   */
  const handleDragEnd = useCallback(({ data }: { data: Exercise[] }) => {
    // Update local state
    setData(data);
    
    // Pass the updated data to the parent component
    // Update each exercise's order property based on its new position
    const updatedExercises = data.map((exercise, index) => ({
      ...exercise,
      order: index
    }));
    
    onReorder(updatedExercises);
  }, [onReorder]);

  /**
   * Render drag handle 
   */
  const renderDragHandle = useCallback(() => {
    return (
      <View className="p-2">
        <Ionicons name="reorder-three-outline" size={24} color="#888" />
      </View>
    );
  }, []);

  /**
   * Render individual exercise item
   */
  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Exercise>) => {
    // Calculate completion status for the exercise
    const completedSets = item.sets.filter(set => set.isCompleted).length;
    const totalSets = item.sets.length;
    const completionPercentage = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
    
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          onPress={() => onExercisePress && onExercisePress(item.id)}
          className="mb-3"
        >
          <Card className="flex-row items-center p-3 bg-white dark:bg-gray-800">
            {renderDragHandle()}
            
            <View className="flex-1 ml-2">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {item.name}
              </Text>
              
              {item.description && (
                <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {item.description}
                </Text>
              )}
              
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {item.sets.length} sets
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {completionPercentage}% complete
                </Text>
              </View>
            </View>
            
            <View className="ml-2">
              {item.type && (
                <View className="bg-blue-100 dark:bg-blue-900 rounded-full px-2 py-1">
                  <Text className="text-xs text-blue-800 dark:text-blue-200">
                    {item.type}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [onExercisePress]);

  return (
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 px-4">
        Drag to Reorder Exercises
      </Text>
      
      <DraggableFlatList
        data={data}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default ReorderableExerciseList;
