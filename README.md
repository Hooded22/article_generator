# AI-Based Article Management System
### Educational Project

## Overview 📖
This project has been conceived as an extension of a homework assignment from the AI_devs course. The system is presented in a user-friendly console application format. The primary goal of this venture is to provide a playground for my experimentation revolving around technology fuelled by LLM models and the OpenAI API.

## Features 💻
* Users have the ability to create articles employing the LLM model simply by supplying an article title.
* Article creation unfolds in the following manner:
    * The LLM model generates a list of chapters based on the given title.
    * These chapters are then stored in a database.
    * The LLM model confers a unique content and summary for each chapter, one at a time.
    * Succeeding chapters are formulated from the titles and short summaries of preceding chapters - enhancing contextual connectivity.
    * Upon the completion of all chapters, the article is stamped as finished.
* Users can abort the article generation process at any given time.
* Users have the ability to choose an incomplete article and resume its generation from the last completed chapter.
* Users can access a comprehensive list of all articles, finished or otherwise.
* Users are given the option to delete articles.

## Knowledge Gained 🎓
* Familiarised self with Prisma controller testing.
* Acquired skills in inline prompting.
* Gained proficiency in incorporation of GPT models using the OpenAI API.
* Mastered Prisma mocking techniques.

## Technologies Deployed 🧑‍🔬
* Prisma
* OpenAI API
* GPT Models
* Axios
* Node.js
* Jest
* TypeScript