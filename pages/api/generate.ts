import { OpenAI } from "openai";

export const config = {
  runtime: "edge",
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: Request): Promise<Response> {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    // Call the new OpenAI API (GPT-4o-mini)
    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const text = completion.output_text;

    return new Response(text, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: any) {
    return new Response("Server error: " + err.message, { status: 500 });
  }
}
