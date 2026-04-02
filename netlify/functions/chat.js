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

    // 🔥 MANY fallback models
    const models = [
      "meta-llama/llama-3-8b-instruct:free",
      "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
      "microsoft/phi-3-mini-128k-instruct:free",
      "google/gemma-2b-it:free",
      "openchat/openchat-7b:free",
      "gryphe/mythomist-7b:free"
    ];

    let finalReply = null;

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
You are Ajay's portfolio assistant.

Answer ONLY about Ajay.

Details:
- Full Stack Developer
- 1 year experience at Ignosi
- Skills: PHP, React, Spring Boot, MySQL

Understand spelling mistakes and broken English.
Keep answers short.
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

        console.log("Trying model:", model);
        console.log("Response:", JSON.stringify(data));

        if (data?.choices?.[0]?.message?.content) {
          finalReply = data.choices[0].message.content;
          break;
        }

      } catch (err) {
        console.log("Model failed:", model);
      }
    }

    // ❗ FINAL FALLBACK (IMPORTANT)
    if (!finalReply) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: localFallback(message)
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
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error"
      })
    };
  }
}

/* 🔥 LOCAL BACKUP (never fail UX) */
function localFallback(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("hi") || msg.includes("hey")) {
    return "Hello 👋";
  }

  if (msg.includes("skill") || msg.includes("tech")) {
    return "Ajay works with PHP, React, Spring Boot, and MySQL ⚡";
  }

  if (msg.includes("experience")) {
    return "Ajay has 1 year experience at Ignosi 🏢";
  }

  if (msg.includes("project")) {
    return "Check the projects section above 🚀";
  }

  if (msg.includes("contact")) {
    return "You can contact Ajay via email 📩";
  }

  return "I'm having trouble connecting right now, but you can explore the portfolio sections above 😊";
}