import { useState } from 'react';
import { User } from '@/types/models';
import { Badge, Award } from 'lucide-react';

interface ProfileMenuProps {
  user: User;
}

const levels = ['Monito', 'Chimpancé', 'Orangután', 'Gorila', 'King Kong'];

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Perfil de Usuario</h2>
      <div className="flex items-center mb-4">
        <Badge className="w-6 h-6 text-yellow-500 mr-2" />
        <span className="text-lg font-medium text-gray-900 dark:text-white">Nivel: {selectedLevel}</span>
      </div>
      <div className="flex items-center mb-4">
        <Award className="w-6 h-6 text-blue-500 mr-2" />
        <span className="text-lg font-medium text-gray-900 dark:text-white">Premios y Reconocimientos</span>
      </div>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
        <li>Premio al esfuerzo</li>
        <li>Mejor progreso</li>
        <li>Consistencia</li>
      </ul>
    </div>
  );
} 