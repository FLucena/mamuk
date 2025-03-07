import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachByUserId } from '@/lib/services/coach';
import CustomerList from '@/components/coach/CustomerList';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  
  // Authentication is already handled in the layout
  // But we still need to check for session to satisfy TypeScript
  if (!session?.user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">Sesión no encontrada</h2>
        <p className="mt-2">Por favor, inicia sesión para acceder a esta página.</p>
      </div>
    );
  }
  
  const coachData = await getCoachByUserId(session.user.id);
  if (!coachData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">Perfil de coach no encontrado</h2>
        <p className="mt-2">No se encontró un perfil de coach asociado a tu cuenta.</p>
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
      <h1 className="text-3xl font-bold mb-8">Mis Clientes</h1>
      <CustomerList coach={coach} />
    </div>
  );
} 