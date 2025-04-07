import Constants from "../../data/Constants";
import { OpenRouter } from "../openrouter";

// Standard React API function for fetching from the API server
export async function generateCode(model: string, description: string, imageUrl: string) {
  const ModelObj = Constants.AiModelList.find(item => item.name === model);
  const modelName = ModelObj?.modelName;
  
  console.log("Using model:", modelName);

  const openRouter = new OpenRouter({
    apiKey: process.env.REACT_APP_OPENROUTER_API_KEY || '',
  });

  try {
    const response = await openRouter.createChatCompletion({
      model: modelName ?? 'google/gemini-2.0-pro-exp-02-05:free',
      stream: true,
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": description
            },
            {
              "type": "image_url",
              "image_url": {
                "url": imageUrl
              }
            }
          ]
        }
      ]
    });

    return response; // Return the stream directly for the client to consume
  } catch (error) {
    console.error("API error:", error);
    throw new Error("Failed to generate response");
  }
} 