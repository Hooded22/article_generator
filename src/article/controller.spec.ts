import { ArticleController } from "./controller";
import { prismaMock } from "../../prisma/prismaMock";
import { ARTICLE_STATUS } from "./types";
import { Article, Chapter } from "@prisma/client";
import { CHAPTER_STATUS } from "../chapters/types";
import { GPTConnector } from "../GPTConnector";
import Mock = jest.Mock;

const GPTConnectorMock = GPTConnector as Mock;

const mockedChapters: Chapter[] = [
  {
    id: 0,
    title: "test1",
    status: CHAPTER_STATUS.FINISHED,
    content: "Chapter 1",
    summary: "Chapter 1",
    articleId: 0,
  },
  {
    id: 1,
    title: "test2",
    status: CHAPTER_STATUS.FINISHED,
    content: "Chapter 2",
    summary: "Chapter 2",
    articleId: 0,
  },
  {
    id: 1,
    title: "test 3",
    status: CHAPTER_STATUS.FINISHED,
    content: "Chapter 3",
    summary: "Chapter 3",
    articleId: 0,
  },
];

const mockedArticle: Article = {
  id: 0,
  title: "Test",
  status: ARTICLE_STATUS.UNFINISHED,
};

jest.mock("../GPTConnector", () => ({
  __esModule: true,
  GPTConnector: jest.fn(() => ({
    generateChapterContentAndSummary: jest.fn(),
  })),
}));

describe("ArticleController", () => {
  let articleController: ArticleController;

  beforeEach(() => {
    articleController = new ArticleController(
      prismaMock.article,
      prismaMock.chapter
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("createNewArticle", () => {
    it("Should call .create with data when method createNewArticle is called", async () => {
      await articleController.createNewArticle("Test title");

      expect(prismaMock.article.create).toHaveBeenCalledWith({
        data: {
          status: 0,
          title: "Test title",
        },
      });
    });

    it("should call articleRepository.create with the correct parameters", async () => {
      const title = "Test title";
      await articleController.createNewArticle(title);

      expect(prismaMock.article.create).toHaveBeenCalledWith({
        data: {
          status: 0,
          title,
        },
      });
    });
  });

  describe("getAllArticles", () => {
    it("should call articleRepository.findMany", async () => {
      await articleController.getAllArticles();

      expect(prismaMock.article.findMany).toHaveBeenCalled();
    });
  });

  describe("deleteArticleById", () => {
    it("should call articleRepository.delete with the correct parameters", async () => {
      const articleID = 1;
      await articleController.deleteArticleById(articleID);

      expect(prismaMock.article.delete).toHaveBeenCalledWith({
        where: { id: articleID },
      });
    });
  });

  describe("changeArticleStatus", () => {
    it("should call articleRepository.update with the correct parameters when finishArticle is called", async () => {
      const id = 1;
      const status = ARTICLE_STATUS.FINISHED;
      await articleController.finishArticle(id);

      expect(prismaMock.article.update).toHaveBeenCalledWith({
        data: { status },
        where: { id },
      });
    });
  });

  describe("getUnfinishedArticles", () => {
    it("should return the unfinished articles", async () => {
      await articleController.getUnfinishedArticles();

      expect(prismaMock.article.findMany).toHaveBeenCalledWith({
        where: { status: ARTICLE_STATUS.UNFINISHED },
      });
    });
  });

  describe("getArticleById", () => {
    it("should return the article with the given ID", async () => {
      prismaMock.article.findFirst.mockResolvedValue({
        id: 0,
        title: "Test1",
        status: ARTICLE_STATUS.UNFINISHED,
      });
      const id = 1;

      await articleController.getArticleById(id);

      expect(prismaMock.article.findFirst).toHaveBeenCalledWith({
        where: { id },
        include: { chapters: true },
      });
    });

    it("Should throw error when article is not found", async () => {
      prismaMock.article.findFirst.mockResolvedValue(null);
      const id = 1;

      await expect(articleController.getArticleById(id)).rejects.toThrow(
        "Article not found"
      );

      expect(prismaMock.article.findFirst).toHaveBeenCalledWith({
        where: { id },
        include: { chapters: true },
      });
    });
  });

  describe("createContentForArticle", () => {
    const generateChapterContentAndSummarySpy = jest.fn(() =>
      Promise.resolve(mockedChapters[0])
    );

    beforeEach(() => {
      GPTConnectorMock.mockImplementation(() => ({
        generateChapterContentAndSummary: generateChapterContentAndSummarySpy,
      }));

      prismaMock.article.findFirst.mockResolvedValue({
        ...mockedArticle,
        chapters: [...mockedChapters, ...mockedChapters],
      } as any);
      prismaMock.chapter.findMany.mockResolvedValue(mockedChapters);
    });

    afterEach(() => {
      prismaMock.article.findFirst.mockClear();
      prismaMock.chapter.findMany.mockClear();
      generateChapterContentAndSummarySpy.mockClear();
    });

    it.skip("should call the relevant methods for creating content for an article", async () => {
      const id = 1;
      const finishArticleSpy = jest.spyOn(articleController, "finishArticle");
      const getArticleByIdSpy = jest.spyOn(articleController, "getArticleById");

      await articleController.createContentForArticle(id);

      expect(getArticleByIdSpy).toHaveBeenCalledWith(id);
      expect(finishArticleSpy).toHaveBeenCalledWith(id);
    });

    it("Should get all chapters summary for current article", async () => {
      const id = mockedArticle.id;

      await articleController.createContentForArticle(id);

      expect(prismaMock.chapter.findMany).toHaveBeenCalledWith({
        where: {
          articleId: mockedArticle.id,
          status: mockedArticle.status,
        },
      });
    });

    it("Should get all unfinished chapters for current article", async () => {
      const id = mockedArticle.id;

      await articleController.createContentForArticle(id);

      expect(prismaMock.chapter.findMany).toHaveBeenCalledWith({
        where: {
          articleId: id,
        },
        select: {
          summary: true,
        },
      });
    });

    it("Should generate content and summary for unfinished chapters", async () => {
      const generateChapterContentAndSummarySpy = jest.fn(
        () => mockedChapters[0]
      );
      GPTConnectorMock.mockImplementationOnce(() => ({
        generateChapterContentAndSummary: generateChapterContentAndSummarySpy,
      }));
      const id = mockedArticle.id;

      await articleController.createContentForArticle(id);

      expect(generateChapterContentAndSummarySpy).toHaveBeenCalled();
    });
    it.todo("Should save generated content and summary into database");
    it.todo("Should finish article after saving all chapters");
  });
});
