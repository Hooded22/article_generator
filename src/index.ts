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

  const userInterface = new UserInterface();

  try {
    const unfishedArticles = await articleController.getUnfinishedArticles();
    const articleSelectedByUser = await userInterface.selectArticle(
      "Slect article to finish: ",
      unfishedArticles
    );

    console.log("Article to finish by GPT: ", articleSelectedByUser);
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

    //Second step - for each chapter generate content
    const unfinishedChapters = await chaptersController.getUnfinishedChapters(
      article.id
    );

    for (let i = 0; i < unfinishedChapters.length; i++) {
      const unfinishedChapter = unfinishedChapters[i];
      const chapterData = await gptConnector.generateChapterContentAndSummary({
        chapterTitle: unfinishedChapter.title,
        articleTitle: userInput,
        previousChaptersSummary: [],
      });
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
