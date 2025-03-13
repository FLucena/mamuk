'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckIcon } from 'lucide-react';

interface UserRolesManagerProps {
  userId: string;
  initialRoles: string[];
  onRolesUpdated: (roles: string[]) => void;
}

const ROLES = [
  { id: 'admin', label: 'Administrador' },
  { id: 'coach', label: 'Entrenador' },
  { id: 'customer', label: 'Cliente' }
];

export default function UserRolesManager({ userId, initialRoles, onRolesUpdated }: UserRolesManagerProps) {
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleToggle = async (roleId: string) => {
    setIsLoading(true);
    
    try {
      // Check if userId is defined
      if (!userId) {
        console.error('Cannot update roles: userId is undefined');
        toast.error('Error al actualizar los roles: ID de usuario no válido');
        setIsLoading(false);
        return;
      }
      
      // Create a new array with the role toggled
      let newRoles: string[];
      
      if (roles.includes(roleId)) {
        // Remove role if it exists
        newRoles = roles.filter(r => r !== roleId);
        
        // Ensure user always has at least one role
        if (newRoles.length === 0) {
          toast.error('El usuario debe tener al menos un rol');
          setIsLoading(false);
          return;
        }
      } else {
        // Add role if it doesn't exist
        newRoles = [...roles, roleId];
      }
      
      // Call API to update roles
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: newRoles }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar los roles');
      }
      
      const data = await response.json();
      
      // Update local state
      setRoles(data.roles);
      
      // Notify parent component
      onRolesUpdated(data.roles);
      
      toast.success('Roles actualizados correctamente');
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Error al actualizar los roles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Roles del Usuario</h3>
      
      <div className="flex flex-wrap gap-2">
        {ROLES.map(role => {
          const isActive = roles.includes(role.id);
          
          return (
            <button
              key={role.id}
              onClick={() => handleRoleToggle(role.id)}
              disabled={isLoading}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {role.label}
              {isActive && (
                <span className="ml-1">
                  <CheckIcon className="inline-block w-4 h-4" />
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 