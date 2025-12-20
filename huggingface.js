export async function clasificarComentario(texto) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/pysentimiento/robertuito-sentiment-analysis",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: texto })
    }
  );

  return response.json();
}
