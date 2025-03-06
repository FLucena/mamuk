import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCoachByUserId } from '@/lib/services/coach';
import CustomerList from '@/components/coach/CustomerList';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Verificar que el usuario es coach
  if (session.user.role !== 'coach') {
    redirect('/');
  }

  const coachData = await getCoachByUserId(session.user.id);
  if (!coachData) {
    // Si el usuario es coach pero no tiene perfil de coach, redirigir
    redirect('/');
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Clientes</h1>
      <CustomerList coach={coach} />
    </div>
  );
} 