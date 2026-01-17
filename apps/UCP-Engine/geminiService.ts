
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const routeCommand: FunctionDeclaration = {
  name: 'route_command',
  parameters: {
    type: Type.OBJECT,
    description: 'Routes a command to a specific Omega UI entity.',
    properties: {
      entity: {
        type: Type.STRING,
        description: 'Targeted sub-entity.',
        enum: ['GLYTCH CORE', 'Cloud Connect', 'Legendary Leads', 'LegenDatabase', 'Cloud Collect', 'Face 2 Face', 'ABC Dashboard', 'SynCloud', 'SynCloud ARC'],
      },
      action: {
        type: Type.STRING,
        description: 'The UCP operation name (e.g., SYNC_RESOURCES).',
      },
      payload: {
        type: Type.OBJECT,
        description: 'Parameters for execution.',
      },
    },
    required: ['entity', 'action', 'payload'],
  },
};

export async function processUCPCommand(prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [routeCommand] }],
      temperature: 0.1,
    },
  });

  return response;
}

export async function generateTTS(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `GLYTCH RESPONSE: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS synthesis failure:", error);
    return null;
  }
}
