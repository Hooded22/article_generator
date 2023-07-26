import { GPTConnector } from "./GPTConnector";
import * as dotenv from "dotenv";
import { ArticleController } from "./article/controller";
import prisma from "../prisma/client";

dotenv.config();

(async () => {
  const userInput = "How to become software developer in 2023";
  const gptConnector = new GPTConnector();
  const articleController = new ArticleController(
    prisma.article,
    prisma.chapter
  );

  try {
    //First step - generate article with table of content
    const article = await articleController.createNewArticle(userInput);
    const chaptersGeneratedByGPT =
      await gptConnector.generateChaptersForArticle(userInput);
    await articleController.addTableOfContentToArticle(
      article.id,
      chaptersGeneratedByGPT
    );

    //Second step - for each chapter generate content
    const chapterData = await gptConnector.generateChapterContentAndSummary({
      chapterTitle: chaptersGeneratedByGPT[0],
      articleTitle: userInput,
      previousChaptersSummary: [],
    });

    console.log("Success!", chapterData);
  } catch (error) {
    console.error("ERROR: ", error);
  }
})();
