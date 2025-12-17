// netlify/functions/ClasificarComentarios.js
export async function handler(event) {
  console.log("=== INICIANDO PROCESO DE COMENTARIO ===");
  
  try {
    let body;
    
    // Verificar si viene de JavaScript directo
    if (event.body) {
      body = JSON.parse(event.body);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No hay datos" })
      };
    }
    
    console.log("Body recibido:", JSON.stringify(body, null, 2));
    
    // Manejar dos posibles formatos
    let nombre, comentario, valoracion;
    
    if (body.payload && body.payload.data) {
      // Formato de JavaScript directo
      nombre = body.payload.data.nombre;
      comentario = body.payload.data.comentario;
      valoracion = parseInt(body.payload.data.valoracion);
    } else if (body.data) {
      // Formato alternativo
      nombre = body.data.nombre;
      comentario = body.data.comentario;
      valoracion = parseInt(body.data.valoracion);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Formato de datos incorrecto" })
      };
    }
    
    console.log("Datos extraídos:", { nombre, comentario, valoracion });

    // --- 1. Moderación con Hugging Face ---
    let esToxico = false;
    console.log("Iniciando moderación con Hugging Face...");
    
    try {
      // PRIMERO verifica que exista el token
      if (!process.env.HUGGINGFACE_TOKEN) {
        console.error("ERROR: HUGGINGFACE_TOKEN no está definido");
        throw new Error("Token de Hugging Face no configurado");
      }
      
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
          })
        }
      );

      console.log("Respuesta Hugging Face status:", hfResponse.status);
      
      if (hfResponse.ok) {
        const hfResult = await hfResponse.json();
        console.log("Resultado Hugging Face:", JSON.stringify(hfResult, null, 2));
        
        if (Array.isArray(hfResult) && hfResult.length > 0) {
          const scores = hfResult[0];
          
          scores.forEach(resultado => {
            if ((resultado.label.includes('hate') || 
                 resultado.label.includes('offensive') ||
                 resultado.label.includes('toxic')) && 
                resultado.score > 0.7) {
              esToxico = true;
            }
          });
        }
      } else {
        const errorText = await hfResponse.text();
        console.warn("Hugging Face API error:", errorText);
      }
    } catch (hfError) {
      console.warn("Error con Hugging Face:", hfError.message);
      const palabrasToxicas = [
        'odio', 'asco', 'mierda', 'puto', 'idiota', 'estúpido',
        'imbécil', 'retrasado', 'basura', 'culo', 'joder', 'coño'
      ];
      esToxico = palabrasToxicas.some(palabra => 
        comentario.toLowerCase().includes(palabra)
      );
    }

    console.log("Resultado moderación - esToxico:", esToxico);

    // --- 2. Clasificación final ---
    let clasificacion = "bueno";
    if (esToxico) {
      clasificacion = "bloqueado";
    } else if (valoracion <= 2) {
      clasificacion = "malo";
    }
    
    console.log("Clasificación final:", clasificacion);

    // --- 3. Guardar en Supabase (solo si no está bloqueado) ---
    if (clasificacion !== "bloqueado") {
      console.log("Intentando guardar en Supabase...");
      
      // VERIFICAR variables de entorno
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      console.log("Supabase URL definida?:", !!supabaseUrl);
      console.log("Supabase Key definida?:", !!supabaseKey);
      
      if (!supabaseUrl || !supabaseKey) {
        console.error("ERROR: Variables de Supabase no configuradas");
        throw new Error("Configuración de Supabase incompleta");
      }
      
      // Preparar datos para Supabase
      const datosSupabase = {
        nombre,
        comentario,
        valoracion,
        clasificacion,
        fecha: new Date().toISOString()
      };
      
      console.log("Datos para Supabase:", datosSupabase);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/comentarios`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(datosSupabase)
        });
        
        console.log("Supabase response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("ERROR Supabase:", errorText);
          throw new Error(`Error Supabase: ${response.status} - ${errorText}`);
        } else {
          console.log("✅ ÉXITO: Comentario guardado en Supabase");
        }
      } catch (supabaseError) {
        console.error("ERROR al guardar en Supabase:", supabaseError.message);
        throw supabaseError;
      }
    } else {
      console.log("Comentario bloqueado - NO se guarda en Supabase");
    }

    // --- 4. Respuesta final ---
    console.log("=== PROCESO COMPLETADO ===");
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // IMPORTANTE para CORS
      },
      body: JSON.stringify({ 
        clasificacion,
        mensaje: clasificacion === 'bloqueado' 
          ? 'Comentario bloqueado por contenido inapropiado' 
          : '✅ Comentario enviado y moderado correctamente'
      })
    };

  } catch (error) {
    console.error("❌ ERROR GENERAL EN LA FUNCIÓN:", error);
    console.error("Stack trace:", error.stack);
    
    return { 
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: "Error interno del servidor",
        detalle: error.message 
      })
    };
  }
}