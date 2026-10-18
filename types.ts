/**
 * Types for Español con Monita
 * Languages: Spanish (es) and Armenian (hy)
 */

export interface SubtitleItem {
  id: string;
  startSeconds: number;
  endSeconds: number;
  spanish: string;
  armenian: string;
  speaker: string;
  needsVerification?: boolean;
  verificationNote?: {
    es: string;
    hy: string;
  };
}

export interface VideoMeta {
  id: 'video1' | 'video2';
  youtubeId: string;
  titleEs: string;
  titleHy: string;
  cardTitleEs: string;
  cardTitleHy: string;
  durationSeconds: number;
  durationFormatted: string;
  charactersEs: string;
  charactersHy: string;
  descriptionEs: string;
  descriptionHy: string;
}

export type QuestionType =
  | 'comprension'
  | 'quien_lo_dijo'
  | 'completa'
  | 'verdadero_falso'
  | 'que_significa'
  | 'elige_correcta'
  | 'ordena_palabras'
  | 'expresiones';

export interface QuizOption {
  id: string;
  textEs: string;
  textHy: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  typeLabelEs: string;
  typeLabelHy: string;
  questionEs: string;
  questionHy: string;
  options: QuizOption[];
  correctOptionId: string;
  explanationEs: string;
  explanationHy: string;
  // For 'ordena_palabras' questions:
  scrambledWords?: string[];
  correctWordOrder?: string[];
  orderedSentenceTranslationHy?: string;
}

export interface VocabItem {
  id: string;
  expressionEs: string;
  expressionHy: string;
  typeTag: 'coloquial' | 'vulgar' | 'informal' | 'frase hecha';
  typeTagHy: string;
  explanationEs: string;
  explanationHy: string;
  exampleEs: string;
  exampleHy: string;
}

export interface MiniGameQuestion {
  id: string;
  gameCategory: 'completa' | 'quien_lo_dijo' | 'responde';
  promptEs: string;
  promptHy: string;
  contextEs?: string;
  contextHy?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanationEs: string;
  explanationHy: string;
}

export interface VideoProgress {
  subtitlesRevealedCount: number;
  quizHighScore: number;
  quizTotalQuestions: number;
  quizCompleted: boolean;
  vocabLearnedIds: string[];
  gamesCompletedIds: string[];
}

export interface AppProgressState {
  video1: VideoProgress;
  video2: VideoProgress;
}
