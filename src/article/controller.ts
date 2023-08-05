import { Article, PrismaClient } from "@prisma/client";
import prisma from "../../prisma/client";
import { ARTICLE_STATUS } from "./types";
import { ChaptersController } from "../chapters/controller";
import { GPTConnector } from "../GPTConnector";

export class ArticleController {
  articleRepository;
  chapterRepository: PrismaClient["chapter"];
  constructor(
    articleRepository: PrismaClient["article"],
    chapterRepository: PrismaClient["chapter"]
  ) {
    this.articleRepository = articleRepository;
    this.chapterRepository = chapterRepository;
  }

  private async changeArticleStatus(id: Article["id"], status: ARTICLE_STATUS) {
    return this.articleRepository.update({
      data: {
        status,
      },
      where: {
        id,
      },
    });
  }

  public async createNewArticle(title: Article["title"]) {
    return this.articleRepository.create({
      data: {
        status: 0,
        title: title,
      },
    });
  }

  public async addTableOfContentToArticle(
    articleId: Article["id"],
    chapterTitleArray: string[]
  ) {
    const inserts: any[] = [];
    chapterTitleArray.forEach((title) => {
      inserts.push(
        this.chapterRepository.create({ data: { title, articleId } })
      );
    });

    return prisma.$transaction(inserts);
  }

  public async finishArticle(id: Article["id"]) {
    return this.changeArticleStatus(id, ARTICLE_STATUS.FINISHED);
  }

  public async getUnfinishedArticles() {
    return this.articleRepository.findMany({
      where: {
        status: ARTICLE_STATUS.UNFINISHED,
      },
    });
  }

  public async getArticleById(id: Article["id"]) {
    const data = await this.articleRepository.findFirst({
      where: {
        id: id,
      },
      include: {
        chapters: true,
      },
    });

    if (!data) {
      throw new Error("Article not found");
    }

    return data;
  }

  public async createContentForArticle(articleID: Article["id"]) {
    const chaptersController = new ChaptersController(this.chapterRepository);
    const gptConnector = new GPTConnector();
    const articleData = await this.getArticleById(articleID);

    const unfinishedChapters = await chaptersController.getUnfinishedChapters(
      articleID
    );
    const articleChaptersSummary =
      await chaptersController.getChaptersSummaryByArticleId(articleID);

    const previousChaptersSummary = [
      ...articleChaptersSummary.map((item) => item.summary),
    ];

    for (let i = 0; i < unfinishedChapters.length; i++) {
      const chapterNumber =
        articleData.chapters.length - (unfinishedChapters.length - i) + 1;

      console.info(
        `Chapter (${chapterNumber} / ${articleData.chapters.length})`
      );

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
    }

    await this.finishArticle(articleID);
  }
}
