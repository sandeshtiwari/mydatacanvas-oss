export type LLMCompletion = {
  text: string;
};

export type LLMOptions = {
  temperature?: number;
  maxTokens?: number;
};

export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<LLMCompletion>;
}

export interface EmbedProvider {
  embed(texts: string[]): Promise<number[][]>;
}
