import * as dotenv from "dotenv";
import { UserInterface } from "./UserInterface";
import { MENU_ACTIONS } from "./UserInterface/types";
import {
  createNewArticleBasedOnUserInput,
  deleteArticle,
  displayCreatedArticle,
  finishUnfinishedArticle,
} from "./flowControllFunctions";

dotenv.config();

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
        await deleteArticle();
        break;
      case MENU_ACTIONS.SEE_ARTICLES:
        await displayCreatedArticle();
        break;
      default:
        isItDone = true;
        return;
    }
  }
})();
