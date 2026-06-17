exports.handler = async function(event) {
  if(event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    var body = JSON.parse(event.body);
    var messages = body.messages || [];
    var context = body.context || "";

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: "Sei Gloria, l'assistente AI di GlowUp, un marketplace italiano di medicina estetica. Il tuo compito è aiutare i pazienti a trovare il professionista giusto per le loro esigenze estetiche.\n\nQuando l'utente descrive cosa cerca, rispondi in modo caldo e professionale. Fai domande per capire meglio le esigenze (zona del corpo, città, budget). Quando hai abbastanza informazioni, suggerisci i medici più adatti tra quelli disponibili.\n\nMedici disponibili (con portfolio casi clinici):\n" + context + "\n\nRegole:\n- Rispondi sempre in italiano\n- Sii empatica e professionale\n- Risposte brevi (max 3-4 frasi)\n- Non inventare medici che non sono nella lista\n- Se non capisci la richiesta chiedi chiarimenti\n- Quando l'utente chiede se un medico ha foto o casi di un trattamento specifico, consulta il campo Portfolio nella lista medici e rispondi in base a quello che trovi\n- Se il portfolio contiene casi del trattamento richiesto, confermalo citando i titoli dei casi\n- Se il portfolio è vuoto o non contiene casi rilevanti, dillo chiaramente",
        messages: messages
      })
    });

    var data = await response.json();

    if(!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error || "Errore API" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ content: data.content[0].text })
    };

  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
