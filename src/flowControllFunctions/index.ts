import { ArticleController } from "../article/controller";
import prisma from "../../prisma/client";
import { UserInterface } from "../UserInterface";
import { GPTConnector } from "../GPTConnector";

const CHAPTERS_NUMBER = parseInt(process.env.CHAPTERS_NUMBER || "5");

export async function displayCreatedArticle() {
  const articleController = new ArticleController(
    prisma.article,
    prisma.chapter
  );
  const userInterface = new UserInterface();
  const articles = await articleController.getAllArticles();
  const articleSelectedByUserID = await userInterface.selectArticle(
    "Select article to display: ",
    articles
  );
  const articleData = await articleController.getArticleById(
    articleSelectedByUserID
  );

  const articleContent = articleData.chapters.map(
    (chapterData) => `
  ${chapterData.title}\n
  ${chapterData.content}
  `
  );

  console.info(`
    ${articleData.title}\n
    ${articleContent.join("\n")}
  `);

  return;
}

export async function deleteArticle() {
  const articleController = new ArticleController(
    prisma.article,
    prisma.chapter
  );
  const userInterface = new UserInterface();
  const articles = await articleController.getAllArticles();
  const articleSelectedByUserID = await userInterface.selectArticle(
    "Select article to delete: ",
    articles
  );

  await articleController.deleteArticleById(articleSelectedByUserID);

  console.log("ARTICLE DELETED");
}

export async function finishUnfinishedArticle() {
  const articleController = new ArticleController(
    prisma.article,
    prisma.chapter
  );
  const userInterface = new UserInterface();

  try {
    const unfishedArticles = await articleController.getUnfinishedArticles();
    const articleSelectedByUserID = await userInterface.selectArticle(
      "Select article to finish: ",
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
