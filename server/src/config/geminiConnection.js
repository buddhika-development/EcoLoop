import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const GEMINI = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0
});

export default GEMINI;