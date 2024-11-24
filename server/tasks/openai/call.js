import { z } from "zod";
import { OpenAI } from "openai";

export default defineJob({
  meta: {
    name: "openaiChatCompletion",
    description: "Generate a chat completion using OpenAI",
    schema: z.object({
      prompt: z.string(),
      system: z.string().default("You are a helpful assistant."),
      model: z.string().default("llama-3.1-8b-instant"),
    }),
  },
  async run(event) {
    print("Running openai call task...")
    const { prompt, model, system } = event.payload;
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      console.log(completion.choices[0].message);
    } catch (error) {
      print("Error in openai call task: ", error)
    }

    print(response)

    return response.data.choices[0].text.trim();
  },
  // middlewares: [loggingMiddleware],
});

// print("Init openai call task...")
// runTask("openai:call", { payload: { prompt: "What is the meaning of life?", model: "llama-3.1-8b-instant" } });