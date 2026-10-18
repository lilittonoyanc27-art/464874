import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  getActiveSubtitleIndex,
  calculateQuizScore,
  checkWordOrder,
  calculateOverallProgress,
} from './quizLogic.ts';
import type { SubtitleItem } from './types.ts';

test('formatTime formats seconds properly', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(9), '0:09');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(122), '2:02');
  assert.equal(formatTime(-5), '0:00');
});

test('getActiveSubtitleIndex identifies active subtitle line', () => {
  const sampleSubs: SubtitleItem[] = [
    { id: '1', startSeconds: 0, endSeconds: 4, spanish: 'A', armenian: 'Ա', speaker: 'M' },
    { id: '2', startSeconds: 4, endSeconds: 8, spanish: 'B', armenian: 'Բ', speaker: 'M' },
    { id: '3', startSeconds: 8, endSeconds: 15, spanish: 'C', armenian: 'Գ', speaker: 'M' },
  ];

  assert.equal(getActiveSubtitleIndex(sampleSubs, 2), 0);
  assert.equal(getActiveSubtitleIndex(sampleSubs, 5), 1);
  assert.equal(getActiveSubtitleIndex(sampleSubs, 10), 2);
  assert.equal(getActiveSubtitleIndex([], 5), -1);
});

test('calculateQuizScore calculates correct and incorrect numbers and percentage', () => {
  const userAnswers = {
    q1: 'a',
    q2: 'b',
    q3: 'c',
    q4: 'a',
  };
  const correctAnswers = {
    q1: 'a',
    q2: 'b',
    q3: 'b', // wrong
    q4: 'a',
  };

  const result = calculateQuizScore(userAnswers, correctAnswers);
  assert.equal(result.correctCount, 3);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.totalAnswered, 4);
  assert.equal(result.percentage, 75);
});

test('checkWordOrder evaluates word arrangement accurately', () => {
  const correct = ['Págame', 'la', 'pizza', 'que', 'no', 'traje', 'plata'];
  const userCorrect = ['Págame', 'la', 'pizza', 'que', 'no', 'traje', 'plata'];
  const userWrong = ['Págame', 'pizza', 'la', 'que', 'no', 'traje', 'plata'];

  assert.equal(checkWordOrder(userCorrect, correct), true);
  assert.equal(checkWordOrder(userWrong, correct), false);
  assert.equal(checkWordOrder(['Págame'], correct), false);
});

test('calculateOverallProgress generates accurate percentage weighted', () => {
  const progress100 = calculateOverallProgress(36, 36, 13, 13, 9, 9);
  assert.equal(progress100, 100);

  const progressHalf = calculateOverallProgress(18, 36, 0, 13, 0, 9);
  // 0.5 * 0.35 * 100 = 17.5 -> 18%
  assert.equal(progressHalf, 18);
});
