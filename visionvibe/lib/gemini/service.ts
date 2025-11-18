import { GoogleGenAI, Modality } from "@google/genai";
import { VisionVibeControls, ImageFile } from "@/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildPrompt(controls: VisionVibeControls): string {
  const { theme, subTheme, budget, prompt } = controls;

  return `Decorate the provided empty room image with a creative and visually appealing design.

**Theme:** ${theme}

**Sub-Theme/Style:** ${subTheme}

**Budget:** ${budget}

**Specific Instructions:** "${prompt}"

Please generate a new image that realistically integrates these elements into the room's existing structure, perspective, and lighting. The final image should be a photorealistic representation of the decorated space. Do not add any text overlays or watermarks.`;
}

export async function decorateImage(
  imageFile: ImageFile,
  controls: VisionVibeControls
): Promise<string> {
  const model = "gemini-2.0-flash-exp";
  const fullPrompt = buildPrompt(controls);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageFile.base64,
                mimeType: imageFile.mimeType,
              },
            },
            { text: fullPrompt },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image was generated in the response.");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to decorate image. Please check the console for details.");
  }
}

export async function describeImage(imageFile: ImageFile): Promise<string> {
  const model = "gemini-2.0-flash-exp";
  const prompt = `You are an expert interior designer. Provide a short, appealing description of this decorated room. Highlight the theme, key furniture pieces, and the overall ambiance.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageFile.base64,
                mimeType: imageFile.mimeType,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    // Safely extract output text
    return response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "No description generated.";
  } catch (error) {
    console.error("Error calling Gemini API for description:", error);
    throw new Error("Failed to generate description.");
  }
}
