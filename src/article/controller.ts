import { Article, PrismaClient } from "@prisma/client";
import prisma from "../../prisma/client";

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
}
