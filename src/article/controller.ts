import { Article, PrismaClient } from "@prisma/client";
import prisma from "../../prisma/client";
import { ARTICLE_STATUS } from "./types";

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
    });

    if (!data) {
      throw new Error("Article not found");
    }

    return data;
  }
}
