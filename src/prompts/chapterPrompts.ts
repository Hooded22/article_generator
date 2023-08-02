export const getGenerateContentPrompt = (
  titleOfArticle: string,
  previousChaptersSummary: string[],
  maxCharactersNumber: number
) => `
As a professional copywriter, you're to prepare content for a single chapter of a blog post titled, "${titleOfArticle}". Title of a chapter will be provided by user and cannot be changed.

Please adhere to the following:

**Do**
1. Make the content understandable for the average reader.
2. Write the content mostly in prose.
3. Ensure content doesn't exceed ${maxCharactersNumber} characters.
4. Consider information from previous chapters if needed but do not copy previous chapters.
5. Provide content on chapter title provided by user

**Don't**
1. Include a summary of any previous or current chapters.
2. Refer to or speculate about content for the next chapter.
3. Insert empty lines in the content or split the chapter into sub-chapters.
4. Generate content that isn't related or extrapolated from the given title of the chapter.
5. Add any prefix with chapter number like 'Chapter 1: ' or 'Chapter: ' or even '1. ' 

###Previous chapters
${previousChaptersSummary.join("\n")}
`;

export const summaryChapterPrompt = `
Please act as a content manager. I will now provide you with a longer text that I would like you to summarize for me. Please extract the most important information, facts, and figures from it, excluding repetitive elements and opinions. Present the key facts in a bullet-pointed list with one additional sentence of commentary. The summary should not exceed 200 words and should be written in an objective and accessible tone, while providing maximum informational value. I assume that the reader is already familiar with the subject and does not require additional context.`;
