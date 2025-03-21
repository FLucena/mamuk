'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Award, Search, TrendingUp, Trophy, Users } from 'lucide-react';
import { useLightSession } from '@/hooks/useOptimizedSession';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievements, getCustomersWithAchievements, assignAchievement, Achievement } from '@/services/awardService';

// Define the Customer type
interface Customer {
  id: string;
  name: string;
  email: string;
  image?: string;
  achievementsCount: number;
}

export default function AwardsPage() {
  const { data: session, status } = useLightSession();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedAwards, setAssignedAwards] = useState<Record<string, string[]>>({});
  const [selectedAward, setSelectedAward] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load achievements and customers in parallel
        const [achievementsData, customersData] = await Promise.all([
          getAchievements(),
          getCustomersWithAchievements()
        ]);
        
        setAchievements(achievementsData);
        setCustomers(customersData);
        
        // Create a mapping of customer IDs to their achievements
        const awardsMap: Record<string, string[]> = {};
        for (const customer of customersData) {
          if (customer.achievementsCount > 0) {
            // This would be an API call in a real app to get specific achievements
            // For now, we'll just initialize an empty array
            awardsMap[customer.id] = [];
          }
        }
        setAssignedAwards(awardsMap);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignAward = useCallback(async () => {
    if (!selectedCustomer || !selectedAward || !session?.user?.id) return;
    
    try {
      // Call the service to assign the achievement
      const success = await assignAchievement(
        selectedCustomer, 
        selectedAward, 
        session.user.id
      );
      
      if (success) {
        // Update local state
        setAssignedAwards(prev => {
          const customerAwards = prev[selectedCustomer] || [];
          // Only add if not already assigned
          if (!customerAwards.includes(selectedAward)) {
            return {
              ...prev,
              [selectedCustomer]: [...customerAwards, selectedAward]
            };
          }
          return prev;
        });
        
        // Show confetti effect
        setShowConfetti(true);
        setMessage(`¡Premio asignado con éxito!`);
        
        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error assigning award:', error);
    }
  }, [selectedCustomer, selectedAward, session?.user?.id]);

  // Check if user is authorized (coach role)
  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Check if user has coach role
  const isCoach = session?.user?.roles?.includes('coach');
  if (!isCoach) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200 mb-4">
          <Users size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Acceso Restringido</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Solo entrenadores pueden acceder a esta sección.
        </p>
        <Link 
          href="/"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reconocimientos y Logros
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Asigna reconocimientos a tus clientes para motivarlos en su progreso
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg">
            <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Search and select clients */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id}
              onClick={() => setSelectedCustomer(customer.id === selectedCustomer ? null : customer.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                customer.id === selectedCustomer 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {/* This would be a real image in production */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {customer.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    {customer.achievementsCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                        {customer.achievementsCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No se encontraron clientes con tu búsqueda.
          </div>
        )}
      </div>

      {/* Awards selection */}
      {selectedCustomer && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Seleccionar Reconocimiento
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {achievements.map(achievement => {
              const isAssigned = assignedAwards[selectedCustomer]?.includes(achievement.id);
              
              return (
                <div 
                  key={achievement.id}
                  onClick={() => {
                    if (!isAssigned) {
                      setSelectedAward(achievement.id === selectedAward ? null : achievement.id);
                    }
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    isAssigned 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-not-allowed opacity-60' 
                      : achievement.id === selectedAward 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 text-2xl">{achievement.icon}</div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                        {achievement.name}
                        {isAssigned && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                            Asignado
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <Award className="w-4 h-4 mr-1 text-purple-500" />
                        <span className="text-purple-600 dark:text-purple-400 font-medium">{achievement.points} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAssignAward}
              disabled={!selectedAward}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                selectedAward 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Asignar Reconocimiento
            </button>
          </div>
        </div>
      )}

      {/* Confetti animation and success message */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => {
                const randomLeft = Math.random() * 100;
                const randomWidth = Math.random() * 10 + 5;
                const randomHeight = Math.random() * 10 + 5;
                const randomBg = `hsl(${Math.random() * 360}, 100%, 50%)`;
                const randomDelay = Math.random() * 3;
                const randomDuration = Math.random() * 3 + 3;
                
                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${randomLeft}%`,
                      width: randomWidth,
                      height: randomHeight,
                      backgroundColor: randomBg,
                      borderRadius: '2px',
                    }}
                    initial={{ top: '-10%', rotate: 0 }}
                    animate={{
                      top: '110%',
                      rotate: 360,
                      transition: {
                        duration: randomDuration,
                        delay: randomDelay,
                        ease: 'easeOut',
                      },
                    }}
                  />
                );
              })}
            </div>
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                <span>{message}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 