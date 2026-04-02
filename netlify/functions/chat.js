export async function handler(event, context) {
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
You are Ajay's personal portfolio assistant.

Answer ONLY about Ajay.

Details:
- Full Stack Developer
- 1 year experience at Ignosi
- Skills: PHP, React, Spring Boot, MySQL
- Projects: Banking & E-commerce systems

Rules:
- Be friendly
- Short answers
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

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: data.choices[0].message.content
    })
  };
}

