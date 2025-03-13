'use client';

import { useState, useEffect } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import UserBadges, { INSIGNIAS } from '@/components/user/UserBadges';
import UserLevel, { NIVELES_USUARIO } from '@/components/user/UserLevel';
import { Award, Trophy, Target, Star } from 'lucide-react';

export default function AchievementsPage() {
  const { session, isLoading } = useAuthRedirect();
  const [userLevel, setUserLevel] = useState(1);
  const [userExperience, setUserExperience] = useState(350);
  const [nextLevelExperience, setNextLevelExperience] = useState(1000);
  const [userBadges, setUserBadges] = useState(['constancia', 'progreso', 'madrugador']);
  const [availableBadges, setAvailableBadges] = useState(INSIGNIAS.map(badge => badge.id));
  const [loading, setLoading] = useState(true);

  // Simulate loading user data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // In a real app, you would fetch the user's achievements from an API
  useEffect(() => {
    // This would be replaced with an actual API call
    if (session?.user) {
      // Simulate fetching user data
      // In a real app, you would fetch this data from your backend
    }
  }, [session]);

  if (isLoading || loading) {
    return (
      <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Trophy className="w-8 h-8 mr-2 text-yellow-500" />
          Logros y Reconocimientos
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <UserLevel 
              level={userLevel} 
              experience={userExperience} 
              nextLevelExperience={nextLevelExperience} 
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-2">
                Estadísticas
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Nivel actual:</span>
                <span className="font-medium text-gray-900 dark:text-white">{NIVELES_USUARIO[userLevel].nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Insignias obtenidas:</span>
                <span className="font-medium text-gray-900 dark:text-white">{userBadges.length} / {INSIGNIAS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Días activos:</span>
                <span className="font-medium text-gray-900 dark:text-white">42</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-blue-500" />
            Tus Insignias
          </h2>
          <UserBadges 
            insigniasObtenidas={userBadges} 
            displayFormat="list" 
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2 text-green-500" />
            Insignias por Desbloquear
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INSIGNIAS.filter(badge => !userBadges.includes(badge.id)).map(badge => (
                <div key={badge.id} className="flex items-start p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div className="text-3xl mr-3 opacity-50">{badge.icono}</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{badge.nombre}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{badge.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 