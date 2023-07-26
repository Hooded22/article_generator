import axios from "axios";
import {
  GenerateChapterContentAndSummaryPayload,
  ModelMessage,
  ModelParams,
  Models,
} from "./types";
import { createChaptersPrompt } from "../prompts/systemPrompts";
import {
  getGenerateContentPrompt,
  summaryChapterPrompt,
} from "../prompts/chapterPrompts";

export class GPTConnector {
  public async gptRequest(
    messages: ModelMessage[],
    params?: Partial<ModelParams>
  ) {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: params?.model || Models.GPT_TURBO,
        temperature: 0.7,
        max_tokens: 2000,
        ...params,
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GPT_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content as string;
  }

  private async summaryChapter(chapterContent: string) {
    return this.gptRequest([
      {
        role: "system",
        content: summaryChapterPrompt,
      },
      {
        role: "user",
        content: chapterContent,
      },
    ]);
  }

  private getJSONFromGPTResponse(response: string) {
    try {
      const jsonMatch = response.match(/\[".+",*\s*\]*/);
      if (!jsonMatch) {
        throw new Error("No json in response");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(error);
    }
  }

  public async generateChaptersForArticle(
    articleSubject: string
  ): Promise<string[]> {
    const gptResponse = await this.gptRequest(
      [
        {
          role: "system",
          content: createChaptersPrompt,
        },
        {
          role: "user",
          content: articleSubject,
        },
      ],
      {
        model: "gpt-3.5-turbo",
      }
    );

    return this.getJSONFromGPTResponse(gptResponse);
  }

  public async generateChapterContentAndSummary({
    articleTitle,
    chapterTitle,
    previousChaptersSummary,
    maxCharactersNumber = 2000,
  }: GenerateChapterContentAndSummaryPayload) {
    const prompt = getGenerateContentPrompt(
      articleTitle,
      previousChaptersSummary,
      maxCharactersNumber
    );

    const chapterContent = await this.gptRequest(
      [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: chapterTitle,
        },
      ],
      {
        model: Models.GTP_TURBO_16k,
        max_tokens: 12000,
      }
    );
    
    console.info("Chapter content generated");

    const chapterSummary = await this.summaryChapter(chapterContent);

    return {
      content: chapterContent,
      summary: chapterSummary,
    };
  }
}
