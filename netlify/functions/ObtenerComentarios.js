// functions/ObtenerComentarios.js
export async function handler(event, context) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    // Obtener comentarios ordenados por fecha (más recientes primero)
    const response = await fetch(
      `${supabaseUrl}/rest/v1/comentarios?select=*&order=fecha.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error Supabase: ${response.status}`);
    }
    
    const comentarios = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // IMPORTANTE para CORS
      },
      body: JSON.stringify(comentarios)
    };
    
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: "Error al cargar comentarios" })
    };
  }
}