export const getGenerateContentPrompt = (
  titleOfArticle: string,
  previousChaptersSummary: string[],
  maxCharactersNumber: number
) => `
Act as a professional copywriter. The user will provide the title of the single chapter for the blog post. Use that title to prepare content for the chapter based on the title provided by the user and other data below. Do not change the title of the chapter use the one provided by the user.

The title of the blog post and summary of previous chapters are below. Consider them during your work.

Requirements:
* Write in a way understandable for a common reader.
* Use prose mostly.
* Result must has maximum of ${maxCharactersNumber} characters
* Avoid empty lines

During your work, you cannot:
* Include a summary of previous chapters and a summary of the current one. 
* Provide any information about the next chapter

###Article title
${titleOfArticle}

###Chapters
${previousChaptersSummary.join("\n")}
`;

export const summaryChapterPrompt = `
Please act as a content manager. I will now provide you with a longer text that I would like you to summarize for me. Please extract the most important information, facts, and figures from it, excluding repetitive elements and opinions. Present the key facts in a bullet-pointed list with one additional sentence of commentary. The summary should not exceed 200 words and should be written in an objective and accessible tone, while providing maximum informational value. I assume that the reader is already familiar with the subject and does not require additional context.`;
