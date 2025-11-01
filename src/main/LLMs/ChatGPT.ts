import { ChatOpenAI } from "@langchain/openai";

export const llm = new ChatOpenAI({
  modelName: "gpt-4.0-mini",
  temperature: 0,
});