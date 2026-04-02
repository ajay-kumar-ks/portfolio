export async function handler(event, context) {
  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `
You are Ajay's portfolio assistant.
Answer only about Ajay.
Handle spelling mistakes and broken English.
            `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    // 🔍 DEBUG LOG (check Netlify logs)
    console.log("AI RESPONSE:", JSON.stringify(data));

    // ❗ HANDLE ERROR RESPONSE
    if (!data.choices || !data.choices[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: "AI is not responding properly. Check API key or quota."
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.choices[0].message.content
      })
    };

  } catch (err) {
    console.error("ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error. Please try again."
      })
    };
  }
}