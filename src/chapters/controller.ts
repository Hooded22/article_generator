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

  public async addChapterContent(
    chapterId: Chapter["id"],
    content: Chapter["content"]
  ) {
    const chapterWithContent = await this.chapterRepository.update({
      data: {
        content,
      },
      where: {
        id: chapterId,
      },
    });

    await this.finishChapter(chapterId);

    return chapterWithContent;
  }
}
