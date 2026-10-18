import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Film,
  Award,
  Eye,
  EyeOff,
  Sparkles,
  Shuffle,
  Volume2,
} from 'lucide-react';
import { QuizQuestion, VideoMeta } from './types.ts';
import { checkWordOrder } from './quizLogic.ts';

interface QuizViewProps {
  video: VideoMeta;
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onBackToVideo: () => void;
  savedHighScore: number;
}

export const QuizView: React.FC<QuizViewProps> = ({
  video,
  questions,
  onComplete,
  onBackToVideo,
  savedHighScore,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [showQuestionTranslation, setShowQuestionTranslation] = useState<boolean>(false);
  const [revealedOptionTranslations, setRevealedOptionTranslations] = useState<Record<string, boolean>>({});
  const [showExplanationTranslation, setShowExplanationTranslation] = useState<boolean>(false);

  // For interactive 'ordena_palabras'
  const [orderedWordList, setOrderedWordList] = useState<string[]>([]);
  const [showOrderedSentenceTranslation, setShowOrderedSentenceTranslation] = useState<boolean>(false);

  // Score tracking
  const [answersRecord, setAnswersRecord] = useState<Record<number, { isCorrect: boolean; selected: string }>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQuestion = questions[currentIndex];
  const isWordOrderType = currentQuestion?.type === 'ordena_palabras' && currentQuestion?.correctWordOrder;

  // Toggle translation of the question itself
  const toggleQuestionTranslation = () => {
    setShowQuestionTranslation((prev) => !prev);
  };

  // Toggle translation of an option (DOES NOT SELECT IT!)
  const toggleOptionTranslation = (optionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setRevealedOptionTranslations((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  // Explicit selection handler
  const handleSelectOption = (optionId: string) => {
    if (isAnswerChecked) return;
    setSelectedOptionId(optionId);
  };

  // Word ordering handlers
  const handleAddWord = (word: string, indexInScrambled: number) => {
    if (isAnswerChecked) return;
    setOrderedWordList((prev) => [...prev, word]);
  };

  const handleRemoveWord = (indexInOrdered: number) => {
    if (isAnswerChecked) return;
    setOrderedWordList((prev) => prev.filter((_, i) => i !== indexInOrdered));
  };

  // Check the answer
  const handleCheckAnswer = () => {
    if (isWordOrderType) {
      const isCorrectOrder = checkWordOrder(orderedWordList, currentQuestion.correctWordOrder || []);
      setAnswersRecord((prev) => ({
        ...prev,
        [currentIndex]: {
          isCorrect: isCorrectOrder,
          selected: orderedWordList.join(' '),
        },
      }));
      setIsAnswerChecked(true);
      return;
    }

    if (!selectedOptionId) return;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    setAnswersRecord((prev) => ({
      ...prev,
      [currentIndex]: {
        isCorrect,
        selected: selectedOptionId,
      },
    }));
    setIsAnswerChecked(true);
  };

  // Proceed to next question or finish
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerChecked(false);
      setShowQuestionTranslation(false);
      setRevealedOptionTranslations({});
      setShowExplanationTranslation(false);
      setOrderedWordList([]);
      setShowOrderedSentenceTranslation(false);
    } else {
      // Calculate final score
      const correctCount = Object.values(answersRecord).filter((a) => a.isCorrect).length;
      onComplete(correctCount, questions.length);
      setIsFinished(true);
    }
  };

  // Reset quiz
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setShowQuestionTranslation(false);
    setRevealedOptionTranslations({});
    setShowExplanationTranslation(false);
    setOrderedWordList([]);
    setShowOrderedSentenceTranslation(false);
    setAnswersRecord({});
    setIsFinished(false);
  };

  const correctTotal = Object.values(answersRecord).filter((a) => a.isCorrect).length;
  const incorrectTotal = Object.values(answersRecord).filter((a) => !a.isCorrect).length;

  if (isFinished) {
    const percentage = Math.round((correctTotal / questions.length) * 100);
    const isNewRecord = correctTotal > savedHighScore;

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-[#FF8C42] overflow-hidden p-6 sm:p-8 animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#750D32] to-[#D62839] flex items-center justify-center text-[#FFD166] shadow-xl border-4 border-[#FFD166]">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#D62839] bg-[#FFF8EF] px-3 py-1 rounded-full border border-[#FFD166]">
              {video.cardTitleEs}
            </span>
            <h3 className="text-3xl font-black text-gray-900 mt-2">
              ¡Quiz Completado!
            </h3>
            <p className="text-sm font-bold text-[#FF8C42]">
              Վիկտորինան ավարտված է
            </p>
          </div>

          {/* Score Circle Card */}
          <div className="bg-[#FFF8EF] p-6 rounded-3xl border-2 border-[#FFD166] max-w-sm mx-auto shadow-inner">
            <div className="text-5xl font-black text-[#750D32] mb-1">
              {correctTotal} <span className="text-2xl text-gray-400">/ {questions.length}</span>
            </div>
            <div className="text-sm font-bold text-gray-600 mb-2">
              Puntuación: {percentage}% — Միավորներ՝ {percentage}%
            </div>

            {isNewRecord && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>¡Nuevo récord personal! / Նոր ռեկորդ:</span>
              </div>
            )}
          </div>

          {/* Stats breakdown */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <div className="text-xl font-black text-emerald-800">{correctTotal}</div>
              <div className="text-xs font-semibold text-emerald-700">Respuestas correctas</div>
              <div className="text-[11px] text-emerald-600 font-sans">Ճիշտ պատասխաններ</div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <div className="text-xl font-black text-red-800">{incorrectTotal}</div>
              <div className="text-xs font-semibold text-red-700">Respuestas incorrectas</div>
              <div className="text-[11px] text-red-600 font-sans">Սխալ պատասխաններ</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#D62839] hover:bg-[#b51e2d] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#FFD166]" />
              <span>Repetir el quiz — Կրկնել վիկտորինան</span>
            </button>

            <button
              onClick={onBackToVideo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#750D32] hover:bg-[#580824] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4 text-[#FFD166]" />
              <span>Volver al vídeo — Վերադառնալ տեսանյութին</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentAnswer = answersRecord[currentIndex];
  const canCheck = isWordOrderType
    ? orderedWordList.length > 0 && !isAnswerChecked
    : !!selectedOptionId && !isAnswerChecked;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Progress Header */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-[#FFD166]/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#D62839]">
            {video.cardTitleEs}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="text-xl font-black text-[#750D32]">
              Pregunta {currentIndex + 1} de {questions.length}
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              (Հարց {currentIndex + 1} / {questions.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-[#FF8C42] block">
              {currentQuestion.typeLabelEs}
            </span>
            <span className="text-[11px] text-gray-500 font-sans block">
              {currentQuestion.typeLabelHy}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#FFF8EF] border-2 border-[#FFD166] flex items-center justify-center font-black text-[#750D32] text-sm">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-[#FFD166]/50 overflow-hidden">
        {/* Question Header & Armenian toggle */}
        <div className="bg-[#750D32] text-white p-6 border-b-2 border-[#FF8C42]">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-[#FFD166] bg-[#580824] px-3 py-1 rounded-full border border-[#941341]">
              {currentQuestion.typeLabelEs}
            </span>

            <button
              onClick={toggleQuestionTranslation}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                showQuestionTranslation
                  ? 'bg-[#D62839] text-white shadow'
                  : 'bg-[#580824] text-[#FFD166] hover:bg-[#941341]'
              }`}
              title="Ver/Ocultar traducción armenia de la pregunta"
            >
              {showQuestionTranslation ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Հայերեն թարգմանություն</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Թարգմանել հարցը</span>
                </>
              )}
            </button>
          </div>

          {/* Spanish Question text (Clicking it also toggles translation) */}
          <div
            onClick={toggleQuestionTranslation}
            className="cursor-pointer group/q"
            title="Haz clic para ver la traducción al armenio"
          >
            <h4 className="text-lg sm:text-xl font-black text-white group-hover/q:text-[#FFD166] transition leading-snug">
              {currentQuestion.questionEs}
            </h4>
          </div>

          {/* Armenian Question translation */}
          {showQuestionTranslation && (
            <div className="mt-3 pt-3 border-t border-[#941341] bg-[#580824]/80 p-3 rounded-2xl border border-[#FF8C42]/40 animate-fadeIn">
              <span className="text-[11px] text-[#FFD166] font-bold block mb-1">
                Հայերեն հարց:
              </span>
              <p className="text-sm font-semibold text-white font-sans">
                {currentQuestion.questionHy}
              </p>
            </div>
          )}
        </div>

        {/* Options / Word Ordering Area */}
        <div className="p-6 space-y-4">
          {/* Instructions reminder */}
          <div className="text-[11px] text-gray-500 bg-[#FFF8EF] px-3 py-2 rounded-xl border border-[#FFD166]/50 flex items-center justify-between">
            <span>
              💡 Haz clic en el texto de una opción para ver su traducción al armenio sin seleccionarla.
            </span>
            <span className="text-[10px] text-[#750D32] font-bold hidden sm:inline">
              Սեղմեք տեքստին՝ թարգմանությունը տեսնելու համար
            </span>
          </div>

          {/* If Word Order type question */}
          {isWordOrderType ? (
            <div className="space-y-4">
              {/* Construction zone */}
              <div className="bg-gray-50 border-2 border-dashed border-[#FF8C42] rounded-2xl p-4 min-h-[70px] flex flex-wrap gap-2 items-center">
                {orderedWordList.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">
                    Haz clic en las palabras de abajo en el orden correcto... / Սեղմեք բառերին ճիշտ հերթականությամբ...
                  </span>
                ) : (
                  orderedWordList.map((word, wIdx) => (
                    <button
                      key={`${word}-${wIdx}`}
                      disabled={isAnswerChecked}
                      onClick={() => handleRemoveWord(wIdx)}
                      className="bg-[#750D32] hover:bg-[#D62839] text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{word}</span>
                      {!isAnswerChecked && <span className="text-xs text-[#FFD166]">✕</span>}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled word pool */}
              <div className="flex flex-wrap gap-2 pt-2">
                {currentQuestion.scrambledWords?.map((word, wIdx) => {
                  const occurrencesInOrdered = orderedWordList.filter((w) => w === word).length;
                  const totalOccurrences = (currentQuestion.scrambledWords || []).filter((w) => w === word).length;
                  const isExhausted = occurrencesInOrdered >= totalOccurrences;

                  return (
                    <button
                      key={`scramble-${word}-${wIdx}`}
                      disabled={isExhausted || isAnswerChecked}
                      onClick={() => handleAddWord(word, wIdx)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-sm transition border-2 ${
                        isExhausted
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white hover:bg-[#FFF8EF] text-[#750D32] border-[#FFD166] shadow-sm cursor-pointer hover:border-[#FF8C42]'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>

              {/* Translation hint button for ordered sentence */}
              <button
                type="button"
                onClick={() => setShowOrderedSentenceTranslation(!showOrderedSentenceTranslation)}
                className="text-xs font-semibold text-[#D62839] hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {showOrderedSentenceTranslation
                    ? 'Ocultar pista en armenio'
                    : 'Ver pista en armenio — Տեսնել հայերեն հուշումը'}
                </span>
              </button>

              {showOrderedSentenceTranslation && (
                <div className="p-3 bg-[#FFF8EF] rounded-xl border border-[#FFD166] text-xs font-semibold text-[#750D32]">
                  {currentQuestion.orderedSentenceTranslationHy}
                </div>
              )}
            </div>
          ) : (
            /* Standard Multiple Choice Options */
            <div className="space-y-3">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedOptionId === option.id;
                const isRevealed = !!revealedOptionTranslations[option.id];
                const optionLetter = String.fromCharCode(65 + optIdx);

                // Styling based on checked state
                let cardStyle = 'bg-white border-gray-200 hover:border-[#FF8C42]';
                if (isSelected) {
                  cardStyle = 'bg-[#FFF8EF] border-[#FF8C42] ring-2 ring-[#FF8C42]/20';
                }

                if (isAnswerChecked) {
                  if (option.id === currentQuestion.correctOptionId) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20';
                  } else if (isSelected && !currentAnswer?.isCorrect) {
                    cardStyle = 'bg-red-50 border-red-500 ring-2 ring-red-500/20';
                  }
                }

                return (
                  <div
                    key={option.id}
                    className={`rounded-2xl border-2 transition-all p-3 sm:p-4 ${cardStyle}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Radio Selection Button (EXPLICIT SELECTION) */}
                      <button
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => handleSelectOption(option.id)}
                        className="flex items-center gap-3 text-left focus:outline-none cursor-pointer flex-shrink-0 pt-0.5"
                      >
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition ${
                            isSelected
                              ? 'bg-[#D62839] border-[#D62839] text-white shadow-sm'
                              : 'border-gray-300 text-gray-500 hover:border-[#FF8C42]'
                          }`}
                        >
                          {isSelected ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          ) : (
                            optionLetter
                          )}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 sm:hidden">
                          {isSelected ? 'Elegido' : 'Elegir'}
                        </span>
                      </button>

                      {/* Middle: Spanish Option Text (Clicking toggles translation without selecting!) */}
                      <div
                        onClick={(e) => toggleOptionTranslation(option.id, e)}
                        className="flex-1 cursor-pointer group/opt"
                        title="Haz clic para ver la traducción al armenio (no selecciona la opción)"
                      >
                        <p className="text-sm sm:text-base font-bold text-gray-900 group-hover/opt:text-[#D62839] transition">
                          {option.textEs}
                        </p>
                      </div>

                      {/* Right: Armenian toggle icon button */}
                      <button
                        type="button"
                        onClick={(e) => toggleOptionTranslation(option.id, e)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                          isRevealed
                            ? 'bg-[#D62839] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-[#FFD166]/50'
                        }`}
                        title="Ver traducción armenia"
                      >
                        {isRevealed ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">Հայերեն</span>
                      </button>
                    </div>

                    {/* Armenian Translation for this option (Revealed on click) */}
                    {isRevealed && (
                      <div className="mt-2.5 pt-2 border-t border-[#FFD166]/50 text-xs font-semibold text-[#750D32] bg-[#FFF8EF] p-2.5 rounded-xl border border-[#FFD166] animate-fadeIn">
                        <span className="text-[10px] text-gray-500 block">Հայերեն տարբերակ:</span>
                        <p className="font-sans text-gray-800">{option.textHy}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback & Explanation Box (After Check) */}
          {isAnswerChecked && (
            <div
              className={`p-5 rounded-2xl border-2 animate-fadeIn ${
                currentAnswer?.isCorrect
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-red-50 border-red-400 text-red-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {currentAnswer?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-black text-base">¡Correcto! — Ճիշտ է!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="font-black text-base">Incorrecto — Սխալ է</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setShowExplanationTranslation(!showExplanationTranslation)}
                  className="text-xs font-bold underline text-gray-700 hover:text-black flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {showExplanationTranslation
                      ? 'Ocultar armenio'
                      : 'Ver explicación en armenio — Հայերեն բացատրություն'}
                  </span>
                </button>
              </div>

              {/* Spanish Explanation */}
              <p
                onClick={() => setShowExplanationTranslation(!showExplanationTranslation)}
                className="text-xs sm:text-sm font-semibold cursor-pointer hover:opacity-90"
                title="Haz clic para ver explicación en armenio"
              >
                {currentQuestion.explanationEs}
              </p>

              {/* Armenian Explanation (revealed on click) */}
              {showExplanationTranslation && (
                <div className="mt-2.5 pt-2 border-t border-gray-300 text-xs font-sans text-gray-800">
                  <span className="font-bold text-[11px] block text-gray-700 mb-0.5">
                    Բացատրություն հայերենով:
                  </span>
                  {currentQuestion.explanationHy}
                </div>
              )}
            </div>
          )}

          {/* Controls Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {isAnswerChecked ? (
                <span className="text-emerald-700 font-bold">
                  Respuesta registrada / Պատասխանը գրանցված է
                </span>
              ) : (
                <span>Elige una opción y pulsa comprobar / Ընտրեք պատասխանը և ստուգեք</span>
              )}
            </div>

            <div>
              {!isAnswerChecked ? (
                <button
                  disabled={!canCheck}
                  onClick={handleCheckAnswer}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2 ${
                    canCheck
                      ? 'bg-[#FF8C42] hover:bg-[#e07530] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Comprobar — Ստուգել</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-[#750D32] hover:bg-[#580824] text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 < questions.length
                      ? 'Siguiente pregunta — Հաջորդ հարցը'
                      : 'Ver resultados — Տեսնել արդյունքները'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FFD166]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
