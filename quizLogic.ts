import type { SubtitleItem } from './types.ts';

/**
 * Format seconds into mm:ss display
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Find the subtitle active at the given video time in seconds
 */
export function getActiveSubtitleIndex(subtitles: SubtitleItem[], currentTime: number): number {
  if (!subtitles || subtitles.length === 0) return -1;
  for (let i = 0; i < subtitles.length; i++) {
    const item = subtitles[i];
    // Give half-second buffer so subtitle displays cleanly
    if (currentTime >= item.startSeconds && currentTime < item.endSeconds + 0.3) {
      return i;
    }
  }
  // If between lines, find the closest previous line
  for (let i = subtitles.length - 1; i >= 0; i--) {
    if (currentTime >= subtitles[i].startSeconds) {
      return i;
    }
  }
  return 0;
}

/**
 * Calculate quiz results summary
 */
export function calculateQuizScore(
  userAnswers: Record<string, string>,
  correctAnswers: Record<string, string>
): {
  correctCount: number;
  incorrectCount: number;
  totalAnswered: number;
  percentage: number;
} {
  let correctCount = 0;
  let incorrectCount = 0;

  for (const [id, answer] of Object.entries(userAnswers)) {
    if (correctAnswers[id] !== undefined) {
      if (answer === correctAnswers[id]) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  }

  const totalAnswered = correctCount + incorrectCount;
  const percentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return {
    correctCount,
    incorrectCount,
    totalAnswered,
    percentage,
  };
}

/**
 * Check if ordered words match target sentence array
 */
export function checkWordOrder(selectedWords: string[], correctWords: string[]): boolean {
  if (selectedWords.length !== correctWords.length) return false;
  return selectedWords.every((word, idx) => word === correctWords[idx]);
}

/**
 * Calculate video completion percentage
 */
export function calculateOverallProgress(
  revealedCount: number,
  totalSubtitles: number,
  quizHighScore: number,
  totalQuizQuestions: number,
  vocabCount: number,
  totalVocab: number
): number {
  const subtitleWeight = 0.35;
  const quizWeight = 0.45;
  const vocabWeight = 0.20;

  const subRatio = totalSubtitles > 0 ? Math.min(revealedCount / totalSubtitles, 1) : 0;
  const quizRatio = totalQuizQuestions > 0 ? Math.min(quizHighScore / totalQuizQuestions, 1) : 0;
  const vocabRatio = totalVocab > 0 ? Math.min(vocabCount / totalVocab, 1) : 0;

  const total = (subRatio * subtitleWeight + quizRatio * quizWeight + vocabRatio * vocabWeight) * 100;
  return Math.round(total);
}
