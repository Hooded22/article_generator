export const Models = {
  GPT_4: "gpt-4",
  GPT_TURBO: "gpt-3.5-turbo",
  GTP_TURBO_16k: "gpt-3.5-turbo-16k",
} as const;

export interface ModelParams {
  model: (typeof Models)[keyof typeof Models];
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelData {
  knowledge?: string;
  tags: string[];
}

export interface GenerateChapterContentAndSummaryPayload {
  chapterTitle: string;
  articleTitle: string;
  previousChaptersSummary: string[];
  maxCharactersNumber?: number;
}
