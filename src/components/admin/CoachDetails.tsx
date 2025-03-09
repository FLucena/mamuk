'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiEdit2, FiTrash2, FiUsers, FiUserPlus } from 'react-icons/fi';
import Icon, { IconName } from '@/components/ui/Icon';
import EditCoachModal from './EditCoachModal';
import DeleteCoachModal from './DeleteCoachModal';
import AddCustomerModal from './AddCustomerModal';
import { MongoUser } from '@/lib/types/user';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Coach {
  id: string;
  userId: User;
  specialties: string[];
  biography: string;
  customers: Customer[];
}

interface CoachDetailsProps {
  coach: Coach;
}

export default function CoachDetails({ coach }: CoachDetailsProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const handleEditConfirm = async (data: {
    specialties: string[];
    biography: string;
  }) => {
    try {
      const response = await fetch(`/api/admin/coaches/${coach.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el coach');
      }

      router.refresh();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error:', error);
      // TODO: Mostrar error al usuario
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/admin/coaches/${coach.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el coach');
      }

      router.push('/admin/coaches');
    } catch (error) {
      console.error('Error:', error);
      // TODO: Mostrar error al usuario
    }
  };

  const handleAddCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/coaches/${coach.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          action: 'add',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el cliente');
      }

      router.refresh();
      setShowAddCustomerModal(false);
    } catch (error) {
      console.error('Error:', error);
      // TODO: Mostrar error al usuario
    }
  };

  const handleRemoveCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/coaches/${coach.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          action: 'remove',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al remover el cliente');
      }

      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      // TODO: Mostrar error al usuario
    }
  };

  // Convert Coach to MongoUser format for EditCoachModal
  const coachForModal: MongoUser & { specialties?: string[], bio?: string, customers?: string[] } = {
    _id: coach.id,
    name: coach.userId.name,
    email: coach.userId.email,
    role: 'coach',
    roles: ['coach'],
    image: coach.userId.image,
    specialties: coach.specialties,
    bio: coach.biography,
    customers: coach.customers.map(c => c.id)
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {coach.userId.image ? (
                <img
                  src={coach.userId.image}
                  alt={coach.userId.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Icon icon="FiUser" className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{coach.userId.name}</h2>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Icon icon="FiMail" className="w-4 h-4 mr-1" />
                  <span>{coach.userId.email}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Icon icon="FiEdit2" className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Icon icon="FiTrash2" className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {coach.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Biografía</h3>
            <p className="text-gray-600 dark:text-gray-400">{coach.biography}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Clientes ({coach.customers.length})
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Icon icon="FiUserPlus" className="w-4 h-4 mr-2" />
                Agregar Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coach.customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {customer.image ? (
                      <img
                        src={customer.image}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Icon icon="FiUser" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCustomer(customer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon icon="FiTrash2" className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {coach.customers.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  Este coach no tiene clientes asignados aún.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditCoachModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onConfirm={handleEditConfirm}
          coach={coachForModal}
        />
      )}

      {showDeleteModal && (
        <DeleteCoachModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {showAddCustomerModal && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          onConfirm={handleAddCustomer}
          existingCustomerIds={coach.customers.map(c => c.id)}
        />
      )}
    </>
  );
} 