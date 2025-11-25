import OpenAI from "openai";

export const config = {
  runtime: "edge",
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: Request): Promise<Response> {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("No prompt provided.", { status: 400 });
    }

    // Use the new Chat Completions API
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    // Convert the streamed response to a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices?.[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response("Failed to generate summary.", { status: 500 });
  }
}
