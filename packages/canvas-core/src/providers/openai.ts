import type { LLMProvider, LLMOptions, LLMCompletion } from "./types";

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey = process.env.OPENAI_API_KEY || "", model = "gpt-4o-mini") {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for OpenAIProvider");
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(prompt: string, options: LLMOptions = {}): Promise<LLMCompletion> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: prompt,
        temperature: options.temperature ?? 0.2,
        max_output_tokens: options.maxTokens ?? 600
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OpenAI error: ${message}`);
    }

    const data = await response.json();
    const text = data.output?.[0]?.content?.map((c: { text?: string }) => c.text || "").join("") || "";
    return { text };
  }
}
