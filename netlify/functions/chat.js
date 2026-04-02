export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message || "";

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "No message provided" })
      };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ajaykumarks-portfolio.netlify.app",
        "X-Title": "Ajay Portfolio"
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b:free",
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
- Projects: Banking & E-commerce

Understand spelling mistakes and broken English.
Keep answers short and friendly.
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

    console.log("OPENROUTER RESPONSE:", JSON.stringify(data));

    // ❗ HANDLE API ERROR
    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: data?.error?.message || "OpenRouter API error"
        })
      };
    }

    // ❗ HANDLE MISSING DATA
    if (!data.choices || !data.choices[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: "Invalid AI response format"
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
    console.error("FUNCTION ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server crashed"
      })
    };
  }
}