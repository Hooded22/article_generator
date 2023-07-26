import { GPTConnector } from "./GPTConnector";
import * as dotenv from "dotenv";
import { ArticleController } from "./article/controller";
import prisma from "../prisma/client";
import { ChaptersController } from "./chapters/controller";

dotenv.config();

(async () => {
  const userInput = "How to become software developer in 2023";
  const gptConnector = new GPTConnector();
  const articleController = new ArticleController(
    prisma.article,
    prisma.chapter
  );
  const chaptersController = new ChaptersController(prisma.chapter);

  try {
    //First step - generate article with table of content
    const article = await articleController.createNewArticle(userInput);
    const chaptersGeneratedByGPT =
      await gptConnector.generateChaptersForArticle(userInput);
    await articleController.addTableOfContentToArticle(
      article.id,
      chaptersGeneratedByGPT
    );
    console.info("Article added");

    //Second step - for each chapter generate content
    const unfinishedChapters = await chaptersController.getUnfinishedChapters(
      article.id
    );
    const chapterData = await gptConnector.generateChapterContentAndSummary({
      chapterTitle: unfinishedChapters[0].title,
      articleTitle: userInput,
      previousChaptersSummary: [],
    });
    await chaptersController.addChapterContentAndSummary(
      unfinishedChapters[0].id,
      chapterData.content,
      chapterData.summary
    );

    console.log("Success!", chapterData);
  } catch (error) {
    console.error("ERROR: ", error);
  }
})();
