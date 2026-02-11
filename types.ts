
export type Subject = 'science' | 'history' | 'philosophy' | 'engineering' | 'medicine' | 'general';
export type AcademicLevel = 'primary' | 'secondary' | 'university' | 'expert';
export type Language = 'ar' | 'en' | 'fr';

export interface ConceptModule {
  id: string;
  order: number;
  title: string;
  technicalExplanation: string;
  visualMetaphor: string; // Description for image gen
  charactersInvolved: string[];
  status: 'pending' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface ConceptAnalysis {
  subject: Subject;
  level: AcademicLevel;
  language: Language;
  characters: Character[];
  modules: ConceptModule[];
}

export enum AppStep {
  INPUT_CONCEPT = 'INPUT_CONCEPT',
  PREVIEW_STRUCTURE = 'PREVIEW_STRUCTURE',
  RENDER_VISUALS = 'RENDER_VISUALS',
  INPUT_STORY = 'INPUT_STORY',
  REVIEW_CHARACTERS = 'REVIEW_CHARACTERS',
  GENERATE_SCENES = 'GENERATE_SCENES',
}

export type ImageStyle = 
  | 'scientific-diagram' 
  | 'blueprint' 
  | 'cinematic-history' 
  | '3d-medical' 
  | 'abstract-concept'
  | 'educational-comic'
  | 'cinematic' 
  | 'cartoon' 
  | '3d-render' 
  | 'classic-disney' 
  | 'anime' 
  | 'cyberpunk' 
  | 'pixel-art' 
  | 'sketch' 
  | 'watercolor' 
  | 'claymation' 
  | 'oil-painting';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface Scene {
  id: string;
  number: number;
  description: string;
  dialogue?: string;
  charactersInvolved: string[];
  imageStatus: 'pending' | 'generating' | 'completed' | 'failed';
  videoStatus: 'pending' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  videoUrl?: string;
  promptUsed?: string;
}
