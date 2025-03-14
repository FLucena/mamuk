'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User } from '@/lib/types/user';
import CoachSelector from './CoachSelector';
import AssignCustomerModal from './AssignCustomerModal';

export default function AssignCustomersToCoach() {
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleCoachSelect = (coach: User) => {
    setSelectedCoach(coach);
    setIsAssignModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAssignModalOpen(false);
  };

  const handleAssignSubmit = async (coachId: string, customerIds: string[]) => {
    try {
      const response = await fetch('/api/admin/coach/assign-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachId, customerIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asignar clientes');
      }

      toast.success('Clientes asignados correctamente');
      setIsAssignModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al asignar clientes');
      }
      throw error;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Asignar Clientes a Coaches
      </h1>
      
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Primero, selecciona un coach al que deseas asignar clientes:
        </p>
        
        <CoachSelector onCoachSelect={handleCoachSelect} />
      </div>
      
      {selectedCoach && (
        <AssignCustomerModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseModal}
          coach={{
            id: selectedCoach._id,
            name: selectedCoach.name || 'Sin nombre',
            email: selectedCoach.email || 'Sin email',
            image: selectedCoach.image
          }}
          onAssign={handleAssignSubmit}
        />
      )}
    </div>
  );
} 