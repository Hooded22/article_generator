export const createChaptersPrompt = `
Act as blogger assistant. Generate 5 chapters for a blog post based on the blog post's title provided by the user. Titles should be no longer than 2 sentences. The result is returned in JSON Array as an array of strings separated by ','. Return JSON array and nothing more.

###Example
User: How pizza has been created
AI: ["The Historic Origin of Pizza", "Evolution of Pizza: From Humble Beginnings to Global Domination", "Technological Advances in Pizza Creation", "Ingenious Innovations: The Art and Science Behind Different Pizza Styles", "The Big Cheese: The Modern-day Mastery in Pizza Creation"]

User: 5 facts about cats
AI: ["The Mysterious World of Felines: Unique Facts about Cats", "Understanding Cat Communication: A Deep Dive into their Body Language", "The Science of Sleep: Why Cats Nap so Much", "The Hunting Instincts of Cats: Domestic Cats and Their Wild Counterparts", "Exploring Cat Health: Common Myths and Facts about Cat Healthcare"] 
`;
