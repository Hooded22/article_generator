import { ArticleController } from "./controller";
import { prismaMock } from "../../prisma/prismaMock";
import { mockReset } from "jest-mock-extended";

describe("Add new article", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });
  it("Should call .create with data when method createOne is called", async () => {
    const createSpy = jest.spyOn(prismaMock.article, "create");
    const controller = new ArticleController(
      prismaMock.article,
      prismaMock.chapter
    );

    await controller.createNewArticle("Test title");

    expect(createSpy).toHaveBeenCalledWith({
      data: {
        status: 0,
        title: "Test title",
      },
    });
  });
});
