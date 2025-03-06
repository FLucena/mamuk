import { ImageResponse } from 'next/og';

// Ruta: /workout/[id]/opengraph-image
// Genera una imagen OpenGraph dinámica para compartir en redes sociales

export const runtime = 'edge';
export const alt = 'Rutina de entrenamiento Mamuk';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Definición de tipo simplificada para el workout
interface WorkoutDocument {
  name?: string;
  description?: string;
  days: Array<{
    name?: string;
    blocks: Array<{
      name?: string;
      exercises: Array<{
        name?: string;
        sets?: number;
        reps?: string;
        rest?: number;
        notes?: string;
      }>;
    }>;
  }>;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Función ligera para obtener un workout por ID usando fetch
async function getWorkoutForEdge(id: string): Promise<WorkoutDocument | null> {
  try {
    // Construir la URL absoluta a la API interna
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const url = `${protocol}://${host}/api/workout/${id}`;
    
    // Realizar la petición
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // No incluimos autenticación ya que es una imagen pública
      },
      next: { revalidate: 60 } // Revalidar cada minuto
    });
    
    if (!response.ok) {
      console.error(`Error obteniendo workout ${id}: ${response.status}`);
      return null;
    }
    
    const workout = await response.json();
    return workout;
  } catch (error) {
    console.error(`Error obteniendo workout ${id}:`, error);
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  try {
    // Usar la función ligera para obtener el workout
    const workout = await getWorkoutForEdge(params.id);
    
    // Si no existe el workout, mostrar una imagen genérica
    if (!workout) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#111827',
              color: 'white',
              fontFamily: 'sans-serif',
              padding: '40px',
            }}
          >
            <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
              Mamuk
            </div>
            <div style={{ fontSize: 36, textAlign: 'center' }}>
              Plataforma de Entrenamiento Personalizado
            </div>
          </div>
        ),
        { ...size }
      );
    }
    
    // Obtener datos de la rutina
    const name = workout.name || 'Rutina de entrenamiento';
    const description = workout.description || 'Rutina personalizada en Mamuk';
    const exerciseCount = Array.isArray(workout.days) ? workout.days.reduce(
      (count: number, day: any) => 
        count + (Array.isArray(day.blocks) ? day.blocks.reduce(
          (blockCount: number, block: any) => 
            blockCount + (Array.isArray(block.exercises) ? block.exercises.length : 0), 
          0
        ) : 0), 
      0
    ) : 0;
    
    // Generar la imagen
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#111827',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Fondo con patrón */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 25px 25px, #ffffff 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ffffff 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          />
          
          {/* Logo */}
          <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 40, color: '#3b82f6' }}>
            MAMUK
          </div>
          
          {/* Título de la rutina */}
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', maxWidth: '80%' }}>
            {name}
          </div>
          
          {/* Descripción */}
          <div style={{ fontSize: 24, marginBottom: 40, textAlign: 'center', maxWidth: '70%', color: '#d1d5db' }}>
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </div>
          
          {/* Estadísticas */}
          <div style={{ display: 'flex', gap: '40px', marginTop: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#3b82f6' }}>{Array.isArray(workout.days) ? workout.days.length : 0}</div>
              <div style={{ fontSize: 20 }}>Días</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#3b82f6' }}>{exerciseCount}</div>
              <div style={{ fontSize: 20 }}>Ejercicios</div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ position: 'absolute', bottom: 30, fontSize: 18, color: '#9ca3af' }}>
            mamuk.vercel.app
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    // En caso de error, mostrar una imagen genérica
    console.error('Error generando OpenGraph image:', error);
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#111827',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
            Mamuk
          </div>
          <div style={{ fontSize: 36, textAlign: 'center' }}>
            Plataforma de Entrenamiento Personalizado
          </div>
        </div>
      ),
      { ...size }
    );
  }
} 