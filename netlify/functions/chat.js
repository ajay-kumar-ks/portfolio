export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message;

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "No message provided" })
      };
    }

    // 🔥 Try multiple models (fallback system)
    const models = [
      "meta-llama/llama-3-8b-instruct:free",
      "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free"
    ];

    let finalReply = null;
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ajaykumarks-portfolio.netlify.app",
            "X-Title": "Ajay Portfolio"
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: `
You are Ajay's personal portfolio assistant.

Answer ONLY about Ajay.

Details:
- Full Stack Developer
- 1 year experience at Ignosi
- Skills: PHP, React, Spring Boot, MySQL
- Projects: Banking & E-commerce systems
- Education: MCA student

Rules:
- Understand spelling mistakes
- Handle broken English
- Keep answers short and friendly
- If unrelated → say "I can only answer about Ajay"
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

        console.log("MODEL:", model);
        console.log("RESPONSE:", JSON.stringify(data));

        if (data?.choices?.[0]?.message?.content) {
          finalReply = data.choices[0].message.content;
          break; // ✅ success → stop loop
        } else {
          lastError = data?.error?.message || "Invalid response";
        }

      } catch (err) {
        console.error("MODEL ERROR:", err);
        lastError = err.message;
      }
    }

    // ❗ If all models failed
    if (!finalReply) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: "AI is currently unavailable. Please try again later."
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: finalReply
      })
    };

  } catch (err) {
    console.error("FUNCTION ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error. Try again."
      })
    };
  }
}