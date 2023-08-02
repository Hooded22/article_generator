import { Article, Chapter, PrismaClient } from "@prisma/client";
import { CHAPTER_STATUS } from "./types";

export class ChaptersController {
  chapterRepository: PrismaClient["chapter"];
  constructor(chapterRepository: PrismaClient["chapter"]) {
    this.chapterRepository = chapterRepository;
  }

  public getUnfinishedChapters(articleId: Article["id"]) {
    return this.chapterRepository.findMany({
      where: {
        articleId: articleId,
        status: 0,
      },
    });
  }

  private finishChapter(chapterId: Chapter["id"]) {
    return this.chapterRepository.update({
      data: {
        status: CHAPTER_STATUS.FINISHED,
      },
      where: {
        id: chapterId,
      },
    });
  }

  public async addChapterContentAndSummary(
    chapterId: Chapter["id"],
    content: Chapter["content"],
    summary: Chapter["summary"]
  ) {
    const chapterWithContent = await this.chapterRepository.update({
      data: {
        content,
        summary,
      },
      where: {
        id: chapterId,
      },
    });

    await this.finishChapter(chapterId);

    return chapterWithContent;
  }

  public async getChaptersSummaryByArticleId(articleID: Article["id"]) {
    return this.chapterRepository.findMany({
      where: {
        articleId: articleID,
      },
      select: {
        summary: true,
      },
    });
  }
}
