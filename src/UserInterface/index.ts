import { select, input } from "@inquirer/prompts";
import { MENU_ACTIONS } from "./types";
import { Article } from "@prisma/client";

export class UserInterface {
  public async getUserMenuChoice() {
    return select({
      message: "Wybierz akcję: ",
      choices: [
        {
          name: "1. Choose unfinished article ",
          value: MENU_ACTIONS.CHOOSE_UNFINISHED,
        },
        { name: "2. Create new article ", value: MENU_ACTIONS.CREATE_NEW },
        {
          name: "3. Delete unfinished article ",
          value: MENU_ACTIONS.DELETE_UNFINISHED,
        },
        {
          name: "4. Exit ",
          value: MENU_ACTIONS.EXIT,
        },
      ],
    });
  }

  public async getBlogPostSubjectFromUser() {
    return input({
      message: "Provide blog post subject: ",
      validate: (value) => {
        return (
          value.length > 2 && value.length <= 255 && isNaN(parseInt(value))
        );
      },
    });
  }

  public async selectArticle(message: string, articleArray: Article[]) {
    return select({
      message,
      choices: articleArray.map((article) => ({
        name: `${article.title} (${article.id})`,
        value: article.id,
      })),
    });
  }
}
