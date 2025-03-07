export async function GET(req, res) {
  const url = 'https://script.google.com/macros/s/AKfycbwsdaiHOJPoPWV75uELoRola4qxTlGJW2j3FJe2YGhYO200F_07wIkKIu5Y53_0tMk/exec';

  try {
    // Realiza una solicitud GET al Google Apps Script
    const response = await fetch(url);
    
    // Verifica si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    // Obtiene los datos en formato JSON
    const data = await response.json();

    // Devuelve los datos al cliente
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    // Maneja los errores
    console.error(error);
    return new Response(JSON.stringify({ error: 'Fallo al obtener datos' }), { status: 500 });
  }
}