/**
 * Award Service
 * 
 * Provides functions to manage awards and achievements
 * In a real application, these functions would interact with an API/database
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

export interface AwardAssignment {
  id: string;
  customerId: string;
  achievementId: string;
  assignedBy: string;
  assignedAt: Date;
  notes?: string;
}

// This would be fetched from an API in a real application
export const getAchievements = async (): Promise<Achievement[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: 'first_workout',
      name: 'First Workout',
      description: 'Complete your first workout',
      icon: '🏋️',
      category: 'beginner',
      points: 10,
    },
    {
      id: 'workout_streak',
      name: 'Workout Streak',
      description: 'Complete workouts for 7 consecutive days',
      icon: '🔥',
      category: 'consistency',
      points: 50,
    },
    {
      id: 'weight_milestone',
      name: 'Weight Milestone',
      description: 'Reach your first weight goal',
      icon: '⚖️',
      category: 'progress',
      points: 100,
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete 5 workouts before 8 AM',
      icon: '🌅',
      category: 'habits',
      points: 30,
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete 5 workouts after 8 PM',
      icon: '🌙',
      category: 'habits',
      points: 30,
    },
    {
      id: 'variety_pack',
      name: 'Variety Pack',
      description: 'Try 5 different workout types',
      icon: '🔄',
      category: 'exploration',
      points: 40,
    },
    {
      id: 'personal_best',
      name: 'Personal Best',
      description: 'Beat your personal record in any exercise',
      icon: '🏆',
      category: 'progress',
      points: 25,
    },
    {
      id: 'nutrition_master',
      name: 'Nutrition Master',
      description: 'Log your meals consistently for 14 days',
      icon: '🥗',
      category: 'habits',
      points: 45,
    },
  ];
};

// Get user achievements (those that have been assigned)
export const getUserAchievements = async (userId: string): Promise<string[]> => {
  // In a real app, this would be a database query
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get from localStorage for demo purposes
  try {
    const savedAwards = localStorage.getItem('assignedAwards');
    if (savedAwards) {
      const assignments = JSON.parse(savedAwards);
      return assignments[userId] || [];
    }
  } catch (error) {
    console.error('Error retrieving user achievements:', error);
  }
  
  return [];
};

// Assign an achievement to a user
export const assignAchievement = async (
  customerId: string,
  achievementId: string,
  coachId: string,
  notes?: string
): Promise<boolean> => {
  // In a real app, this would save to a database
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // For demo, we'll use localStorage
    const savedAwards = localStorage.getItem('assignedAwards') || '{}';
    const assignments = JSON.parse(savedAwards);
    
    // Get current user's achievements or initialize empty array
    const customerAwards = assignments[customerId] || [];
    
    // Only add if not already assigned
    if (!customerAwards.includes(achievementId)) {
      assignments[customerId] = [...customerAwards, achievementId];
      localStorage.setItem('assignedAwards', JSON.stringify(assignments));
      
      // In a real app, we might want to notify the user here
      // e.g., sendAchievementNotification(customerId, achievementId);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error assigning achievement:', error);
    return false;
  }
};

// Get customers with their assigned achievements count
export const getCustomersWithAchievements = async (): Promise<{ id: string; name: string; email: string; achievementsCount: number }[]> => {
  // This would be an API call in a real application
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Sample customers for the demo
  const customers = [
    { id: 'c1', name: 'Carolina Rivas', email: 'carolrivascoccio@gmail.com', image: '/avatar1.png' },
    { id: 'c2', name: 'Miguel Hernández', email: 'miguel@example.com', image: '/avatar2.png' },
    { id: 'c3', name: 'Ana García', email: 'ana@example.com', image: '/avatar3.png' },
    { id: 'c4', name: 'Javier Torres', email: 'javier@example.com', image: '/avatar4.png' },
  ];
  
  // Get achievement counts from localStorage for the demo
  try {
    const savedAwards = localStorage.getItem('assignedAwards');
    if (savedAwards) {
      const assignments = JSON.parse(savedAwards);
      
      return customers.map(customer => ({
        ...customer,
        achievementsCount: assignments[customer.id]?.length || 0,
      }));
    }
  } catch (error) {
    console.error('Error retrieving customer achievements:', error);
  }
  
  return customers.map(customer => ({
    ...customer,
    achievementsCount: 0,
  }));
}; 