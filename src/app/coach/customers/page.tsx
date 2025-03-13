import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachByUserId } from '@/lib/services/coach';
import CustomerList from '@/components/coach/CustomerList';
import { getAllCoaches } from '@/lib/services/coach';
import { getCustomers } from '@/lib/services/user';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  
  // Authentication is already handled in the layout
  // But we still need to check for session to satisfy TypeScript
  if (!session?.user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-semibold text-red-600 dark:text-red-400 text-center py-10">Sesión no encontrada</h1>
          <p className="mt-2 dark:text-gray-300 text-center">Por favor, inicia sesión para acceder a esta página.</p>
        </div>
      </main>
    );
  }
  
  // Different behavior for admin and coach
  if (session.user.roles.includes('admin')) {
    // For admin, show all customers
    const allCustomers = await getCustomers();
    
    if (!allCustomers || allCustomers.length === 0) {
      return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white text-center py-10">No hay clientes registrados</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-center">No se encontraron clientes en el sistema.</p>
          </div>
        </main>
      );
    }
    
    // Create a virtual coach with all customers for admin view
    const adminCoach = {
      _id: 'admin',
      userId: {
        _id: session.user.id,
        name: session.user.name || 'Administrador',
        email: session.user.email || '',
        image: session.user.image || undefined
      },
      customers: allCustomers.map(customer => ({
        _id: customer.id,
        name: customer.name || 'Cliente sin nombre',
        email: customer.email,
        image: customer.image
      }))
    };
    
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Clientes (Vista de Administrador)</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-200">
            Como administrador, puedes ver los clientes de todos los coaches.
          </p>
          <CustomerList coach={adminCoach} />
        </div>
      </main>
    );
  } else {
    // Regular coach view
    const coachData = await getCoachByUserId(session.user.id);
    if (!coachData) {
      return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-semibold text-red-600 dark:text-red-400 text-center py-10">Perfil de coach no encontrado</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-center">No se encontró un perfil de coach asociado a tu cuenta.</p>
          </div>
        </main>
      );
    }

    // Adaptar el coach al formato esperado por CustomerList
    const coach = {
      _id: coachData._id,
      userId: typeof coachData.userId === 'string'
        ? {
            _id: coachData._id, // Usamos el _id del coach como fallback
            name: 'Coach',
            email: '',
            image: undefined
          }
        : {
            _id: coachData.userId._id,
            name: coachData.userId.name || 'Coach',
            email: coachData.userId.email,
            image: coachData.userId.image
          },
      customers: coachData.customers.map(customer => ({
        _id: customer._id,
        name: customer.name || 'Cliente sin nombre',
        email: customer.email,
        image: customer.image
      }))
    };

    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Mis Clientes</h1>
          <CustomerList coach={coach} />
        </div>
      </main>
    );
  }
} 