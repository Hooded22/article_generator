import { GPTConnector } from "./GPTConnector";
import * as dotenv from "dotenv";
import { ArticleController } from "./article/controller";
import prisma from "../prisma/client";
import { ChaptersController } from "./chapters/controller";
import { UserInterface } from "./UserInterface";
import { MENU_ACTIONS } from "./UserInterface/types";

dotenv.config();

(async () => {
  const userInterface = new UserInterface();
  let isItDone = false;

  while (!isItDone) {
    const userMenuChoice = await userInterface.getUserMenuChoice();
    switch (userMenuChoice) {
      case MENU_ACTIONS.CHOOSE_UNFINISHED:
        await finishUnfinishedArticle();
        break;
      case MENU_ACTIONS.CREATE_NEW:
        const userInput = await userInterface.getBlogPostSubjectFromUser();
        await createNewArticleBasedOnUserInput(userInput);
        break;
      case MENU_ACTIONS.DELETE_UNFINISHED:
        console.info("Comming soon...");
        break;
      default:
        isItDone = true;
        return;
    }
  }
})();

export async function finishUnfinishedArticle() {
  const articleController = new ArticleController(
    prisma.article,
    prisma.chapter
  );
  const chaptersController = new ChaptersController(prisma.chapter);
  const userInterface = new UserInterface();
  const gptConnector = new GPTConnector();

  try {
    const unfishedArticles = await articleController.getUnfinishedArticles();
    const articleSelectedByUserID = await userInterface.selectArticle(
      "Slect article to finish: ",
      unfishedArticles
    );

    console.log("Article to finish by GPT: ", articleSelectedByUserID);
    const articleData = await articleController.getArticleById(
      articleSelectedByUserID
    );
    //TODO: Extract code below to another function
    const unfinishedChapters = await chaptersController.getUnfinishedChapters(
      articleSelectedByUserID
    );
    const articleChaptersSummary =
      await chaptersController.getChaptersSummaryByArticleId(
        articleSelectedByUserID
      );
    const previousChaptersSummary = [
      ...articleChaptersSummary.map((item) => item.summary),
    ];

    for (let i = 0; i < unfinishedChapters.length; i++) {
      const unfinishedChapter = unfinishedChapters[i];
      const chapterData = await gptConnector.generateChapterContentAndSummary({
        chapterTitle: unfinishedChapter.title,
        articleTitle: articleData.title,
        previousChaptersSummary: previousChaptersSummary,
      });

      previousChaptersSummary.push(chapterData.summary);

      await chaptersController.addChapterContentAndSummary(
        unfinishedChapter.id,
        chapterData.content,
        chapterData.summary
      );
      console.info(`Chapter (${i + 1} / ${unfinishedChapters.length})`);
    }

    await articleController.finishArticle(articleSelectedByUserID);

    console.log("Success!");
    return;
  } catch (error) {
    console.error("ERROR: ", error);
  }
}

export async function createNewArticleBasedOnUserInput(userInput: string) {
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
    //TODO: Extract code below to another function
    //Second step - for each chapter generate content
    const unfinishedChapters = await chaptersController.getUnfinishedChapters(
      article.id
    );
    const articleChaptersSummary =
      await chaptersController.getChaptersSummaryByArticleId(article.id);
    const previousChaptersSummary = [
      ...articleChaptersSummary.map((item) => item.summary),
    ];

    for (let i = 0; i < unfinishedChapters.length; i++) {
      const unfinishedChapter = unfinishedChapters[i];
      const chapterData = await gptConnector.generateChapterContentAndSummary({
        chapterTitle: unfinishedChapter.title,
        articleTitle: userInput,
        previousChaptersSummary: previousChaptersSummary,
      });

      previousChaptersSummary.push(chapterData.summary);

      await chaptersController.addChapterContentAndSummary(
        unfinishedChapter.id,
        chapterData.content,
        chapterData.summary
      );
      console.info(`Chapter (${i + 1} / ${unfinishedChapters.length})`);
    }

    await articleController.finishArticle(article.id);

    console.log("Success!");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}
