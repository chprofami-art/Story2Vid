
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ConceptAnalysis, Character, ConceptModule, ImageStyle, AspectRatio, Subject, AcademicLevel, Scene, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: Language) => {
  switch (lang) {
    case 'ar': return 'Arabic';
    case 'en': return 'English';
    case 'fr': return 'French';
    default: return 'English';
  }
};

export const analyzeConcept = async (
  prompt: string, 
  subject: Subject,
  level: AcademicLevel,
  moduleCount: number,
  language: Language
): Promise<ConceptAnalysis> => {
  const modelId = "gemini-3-pro-preview";
  const languageName = getLanguageName(language);

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Analyze the following academic concept: "${prompt}".
    Subject: ${subject}
    Target Audience Level: ${level}
    
    Decompose this into EXACTLY ${moduleCount} logical learning modules.
    For each module, provide:
    1. A clear Title.
    2. A technical explanation suitable for the ${level} level.
    3. A visual metaphor or scene that illustrates the core idea (for AI image generation).
    4. Characters involved (e.g., a narrator or historical figures).

    IMPORTANT: Use ${languageName} for all educational content, titles, and explanations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["id", "name", "description"],
            },
          },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                order: { type: Type.INTEGER },
                title: { type: Type.STRING },
                technicalExplanation: { type: Type.STRING },
                visualMetaphor: { type: Type.STRING },
                charactersInvolved: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["id", "order", "title", "technicalExplanation", "visualMetaphor", "charactersInvolved"],
            },
          },
        },
        required: ["characters", "modules"],
      },
    },
  });

  const data = JSON.parse(response.text || "{}");
  return {
    subject,
    level,
    language,
    characters: data.characters,
    modules: data.modules.map((m: any) => ({ ...m, status: 'pending' }))
  };
};

export const generateModuleVisual = async (
  module: ConceptModule,
  allCharacters: Character[],
  style: ImageStyle,
  aspectRatio: AspectRatio
): Promise<string> => {
  const charDetails = allCharacters
    .filter(c => module.charactersInvolved.includes(c.id))
    .map(c => `${c.name}: ${c.description}`)
    .join("; ");

  const prompt = `Style: ${style}. Concept: ${module.title}. Visualization: ${module.visualMetaphor}. Details: ${charDetails}. Ensure high academic quality, clear focus, NO distorted text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio } }
  });

  const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Image failed");
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
};

export const editModuleVisual = async (
  currentImageBase64: string,
  editPrompt: string,
): Promise<string> => {
  // Strip header if present
  const base64Data = currentImageBase64.split(',')[1] || currentImageBase64;
  const mimeType = currentImageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `Modify this image: ${editPrompt}. Maintain the academic style.`,
        },
      ],
    },
  });

  const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Image edit failed");
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
};

export const generateModuleVideo = async (
  imageUrl: string,
  prompt: string
): Promise<string> => {
  const base64Data = imageUrl.split(',')[1];
  const mimeType = imageUrl.split(',')[0].split(':')[1].split(';')[0];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64Data,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video download link not found");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateModuleAudio = async (text: string, language: Language): Promise<string> => {
  const intro = {
    'ar': 'بصوت أكاديمي واضح وهادئ: ',
    'en': 'In a clear and calm academic voice: ',
    'fr': 'D\'une voix académique claire et calme : '
  }[language];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `${intro}${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed");
  
  return `data:audio/wav;base64,${base64Audio}`; 
};

export const generateSceneImage = async (
  scene: Scene,
  allCharacters: Character[],
  style: ImageStyle,
  aspectRatio: AspectRatio
): Promise<{ imageUrl: string; prompt: string }> => {
  const charDetails = allCharacters
    .filter(c => scene.charactersInvolved.includes(c.id))
    .map(c => `${c.name}: ${c.description}`)
    .join("; ");

  const prompt = `Style: ${style}. Scene: ${scene.description}. Dialogue: ${scene.dialogue || ''}. Characters: ${charDetails}. Ensure high quality visual storytelling.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio } }
  });

  const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Image generation failed");
  
  return {
    imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
    prompt: prompt
  };
};

export const generateSceneVideo = async (
  scene: Scene,
  imageUrl: string,
  promptUsed?: string
): Promise<string> => {
  const base64Data = imageUrl.split(',')[1];
  const mimeType = imageUrl.split(',')[0].split(':')[1].split(';')[0];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: promptUsed || scene.description,
    image: {
      imageBytes: base64Data,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video download link not found");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
