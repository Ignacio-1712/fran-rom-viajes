export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    // Datos que vienen de Netlify Forms
    const nombre = body.payload.data.nombre;
    const comentario = body.payload.data.comentario;
    const valoracion = parseInt(body.payload.data.valoracion);

    // --- 1. Moderación (toxicidad) ---
    const modResponse = await fetch(
      "https://api.openai.com/v1/moderations",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: comentario
        })
      }
    );

    const modResult = await modResponse.json();
    const flagged = modResult.results[0].flagged;

    // --- 2. Clasificación final ---
    let clasificacion = "bueno";

    if (flagged) {
      clasificacion = "bloqueado";
    } else if (valoracion <= 2) {
      clasificacion = "malo";
    }

    // --- 3. Resultado (por ahora log) ---
    console.log({
      nombre,
      comentario,
      valoracion,
      clasificacion
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clasificacion })
    };

  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500 };
  }
}
