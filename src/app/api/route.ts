import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


// Set a reasonable revalidation time for this data
export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  // Apply rate limiting - 60 requests per minute
  const rateLimitResponse = checkRateLimit(request, {
    limit: 60,
    windowMs: 60 * 1000,
    message: 'Demasiadas solicitudes, por favor intenta más tarde'
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const url = 'https://script.google.com/macros/s/AKfycbwsdaiHOJPoPWV75uELoRola4qxTlGJW2j3FJe2YGhYO200F_07wIkKIu5Y53_0tMk/exec';

  try {
    // Realiza una solicitud GET al Google Apps Script
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    // Verifica si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    // Obtiene los datos en formato JSON
    const data = await response.json();

    // Devuelve los datos al cliente
    return NextResponse.json(data);
  } catch (error) {
    // Maneja los errores
    console.error(error);
    return NextResponse.json({ error: 'Fallo al obtener datos' }, { status: 500 });
  }
} 