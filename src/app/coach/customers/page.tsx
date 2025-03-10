import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getCoachByUserId, getAllCoaches } from '@/lib/services/coach';
import CustomerList from '@/components/coach/CustomerList';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // Check if user is admin
  if (session.user.roles?.includes('admin')) {
    // For admin, show all coaches and their customers
    const allCoaches = await getAllCoaches();
    
    if (!allCoaches || allCoaches.length === 0) {
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No hay coaches registrados</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">No se encontraron coaches en el sistema.</p>
        </div>
      );
    }
    
    // Use the first coach for display (admin view should be improved in the future)
    const coach = {
      _id: allCoaches[0]._id,
      userId: typeof allCoaches[0].userId === 'string'
        ? {
            _id: allCoaches[0]._id,
            name: 'Coach',
            email: '',
            image: undefined
          }
        : {
            _id: allCoaches[0].userId._id,
            name: allCoaches[0].userId.name || 'Coach',
            email: allCoaches[0].userId.email,
            image: allCoaches[0].userId.image
          },
      customers: allCoaches[0].customers.map(customer => ({
        _id: customer._id,
        name: customer.name || 'Cliente sin nombre',
        email: customer.email,
        image: customer.image
      }))
    };
    
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Clientes (Vista de Administrador)</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-200">
          Como administrador, puedes ver los clientes de todos los coaches.
        </p>
        <CustomerList coach={coach} />
      </div>
    );
  } else {
    // Regular coach view
    const coachData = await getCoachByUserId(session.user.id);
    if (!coachData) {
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Perfil de coach no encontrado</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">No se encontró un perfil de coach asociado a tu cuenta.</p>
        </div>
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
      <div>
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Mis Clientes</h1>
        <CustomerList coach={coach} />
      </div>
    );
  }
} 