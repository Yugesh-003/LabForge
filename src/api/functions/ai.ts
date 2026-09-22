import { createServerFn } from "@tanstack/react-start";
import { processGeminiChat, ChatMessageData } from "../services/aiService";

export const chatWithGeminiServerFn = createServerFn({ method: "POST" })
  .validator((data: ChatMessageData) => data)
  .handler(async ({ data }) => {
    return await processGeminiChat(data);
  });
