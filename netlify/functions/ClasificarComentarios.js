export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const nombre = body.payload.data.nombre;
    const comentario = body.payload.data.comentario;
    const valoracion = parseInt(body.payload.data.valoracion);

    // --- 1. Moderación con Hugging Face ---
    let esToxico = false;
    
    try {
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/pysentimiento/robertuito-base-uncased",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: comentario,
            parameters: {
              return_all_scores: true
            }
          }),
          timeout: 10000 // 10 segundos timeout
        }
      );

      if (hfResponse.ok) {
        const hfResult = await hfResponse.json();
        
        // Procesar respuesta del modelo
        if (Array.isArray(hfResult) && hfResult.length > 0) {
          const scores = hfResult[0]; // Primer elemento es el array de resultados
          
          scores.forEach(resultado => {
            // Buscar etiquetas de odio u ofensivas con alta confianza
            if ((resultado.label.includes('hate') || 
                 resultado.label.includes('offensive') ||
                 resultado.label.includes('toxic')) && 
                resultado.score > 0.7) {
              esToxico = true;
            }
          });
        }
      }
    } catch (hfError) {
      console.warn("Error con Hugging Face:", hfError.message);
      // Fallback: validación básica por palabras
      const palabrasToxicas = [
        'odio', 'asco', 'mierda', 'puto', 'idiota', 'estúpido',
        'imbécil', 'retrasado', 'basura', 'culo', 'joder', 'coño'
      ];
      esToxico = palabrasToxicas.some(palabra => 
        comentario.toLowerCase().includes(palabra)
      );
    }

    // --- 2. Clasificación final ---
    let clasificacion = "bueno";

    if (esToxico) {
      clasificacion = "bloqueado";
    } else if (valoracion <= 2) {
      clasificacion = "malo";
    }

    // --- 3. Guardar en Supabase (solo si no está bloqueado) ---
    if (clasificacion !== "bloqueado") {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      await fetch(`${supabaseUrl}/rest/v1/comentarios`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          nombre,
          comentario,
          valoracion,
          clasificacion,
          fecha: new Date().toISOString()
        })
      });
    }

    // --- 4. Log y respuesta ---
    console.log({
      nombre,
      comentario,
      valoracion,
      clasificacion,
      esToxico
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        clasificacion,
        mensaje: clasificacion === 'bloqueado' 
          ? 'Comentario bloqueado por contenido inapropiado' 
          : 'Comentario procesado correctamente'
      })
    };

  } catch (error) {
    console.error("Error general:", error);
    return { 
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" })
    };
  }
}