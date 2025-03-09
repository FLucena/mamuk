'use client';

import { useState } from 'react';
import { Role } from '@/lib/types/user';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UserRolesManagerProps {
  userId: string;
  initialRoles: Role[];
  onRolesUpdated?: (roles: Role[]) => void;
}

export default function UserRolesManager({ 
  userId, 
  initialRoles,
  onRolesUpdated 
}: UserRolesManagerProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles: { value: Role; label: string }[] = [
    { value: 'admin', label: 'Administrador' },
    { value: 'coach', label: 'Entrenador' },
    { value: 'customer', label: 'Cliente' }
  ];

  const handleRoleToggle = async (role: Role) => {
    // No permitir eliminar todos los roles
    if (roles.length === 1 && roles.includes(role)) {
      toast.error('El usuario debe tener al menos un rol');
      return;
    }

    setIsLoading(true);
    
    try {
      // Crear un nuevo array de roles
      const newRoles = roles.includes(role)
        ? roles.filter(r => r !== role) // Eliminar el rol si ya existe
        : [...roles, role]; // Añadir el rol si no existe
      
      // Llamar a la API para actualizar los roles
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: newRoles }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los roles');
      }

      const data = await response.json();
      
      // Actualizar el estado local
      setRoles(data.roles);
      
      // Notificar al componente padre
      if (onRolesUpdated) {
        onRolesUpdated(data.roles);
      }
      
      toast.success('Roles actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar roles:', error);
      toast.error('Error al actualizar los roles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Roles del Usuario
      </h3>
      <div className="flex flex-wrap gap-2">
        {availableRoles.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleRoleToggle(value)}
            disabled={isLoading}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              roles.includes(value)
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
          >
            {label}
            {roles.includes(value) && (
              <span className="ml-1">✓</span>
            )}
          </button>
        ))}
        {isLoading && (
          <div className="ml-2 flex items-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Haz clic en un rol para activarlo o desactivarlo. Un usuario puede tener múltiples roles.
      </p>
    </div>
  );
} 