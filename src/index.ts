import { GPTConnector } from "./GPTConnector";
import * as dotenv from "dotenv";
import { ArticleController } from "./article/controller";
import prisma from "../prisma/client";
import { UserInterface } from "./UserInterface";
import { MENU_ACTIONS } from "./UserInterface/types";

dotenv.config();

const CHAPTERS_NUMBER = 5;

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
    const articleSelectedByUserID = await userInterface.selectArticle(
      "Slect article to finish: ",
      unfishedArticles
    );

    console.log("Article to finish by GPT: ", articleSelectedByUserID);
    await articleController.createContentForArticle(articleSelectedByUserID);

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

  try {
    //First step - generate article with table of content
    const article = await articleController.createNewArticle(userInput);
    const chaptersGeneratedByGPT =
      await gptConnector.generateChaptersForArticle(userInput, CHAPTERS_NUMBER);
    await articleController.addTableOfContentToArticle(
      article.id,
      chaptersGeneratedByGPT
    );
    console.info(
      "Table of content for artilce has been generated: ",
      chaptersGeneratedByGPT
    );
    console.info("Chapter added to database");
    await articleController.createContentForArticle(article.id);

    console.log("Success!");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}
