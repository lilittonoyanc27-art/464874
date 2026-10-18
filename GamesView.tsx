import React, { useState } from 'react';
import { Gamepad2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Eye, EyeOff, Sparkles } from 'lucide-react';
import { MiniGameQuestion, VideoMeta } from './types.ts';

interface GamesViewProps {
  video: VideoMeta;
  games: MiniGameQuestion[];
  onGameComplete: (gameId: string) => void;
  completedGameIds: string[];
}

export const GamesView: React.FC<GamesViewProps> = ({
  video,
  games,
  onGameComplete,
  completedGameIds,
}) => {
  const [activeCategory, setActiveCategory] = useState<'completa' | 'quien_lo_dijo' | 'responde'>('completa');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>({});
  const [revealedPrompts, setRevealedPrompts] = useState<Record<string, boolean>>({});
  const [revealedOptions, setRevealedOptions] = useState<Record<string, boolean>>({});

  const currentQuestions = games.filter((g) => g.gameCategory === activeCategory);

  const togglePromptTranslation = (id: string) => {
    setRevealedPrompts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOptionTranslation = (optKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealedOptions((prev) => ({ ...prev, [optKey]: !prev[optKey] }));
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (checkedStatus[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleCheckAnswer = (q: MiniGameQuestion) => {
    const chosen = selectedAnswers[q.id];
    if (!chosen) return;
    setCheckedStatus((prev) => ({ ...prev, [q.id]: true }));
    if (chosen === q.correctOptionId) {
      onGameComplete(q.id);
    }
  };

  const handleResetCategory = () => {
    const questionIds = currentQuestions.map((q) => q.id);
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      questionIds.forEach((id) => delete next[id]);
      return next;
    });
    setCheckedStatus((prev) => {
      const next = { ...prev };
      questionIds.forEach((id) => delete next[id]);
      return next;
    });
  };

  const getCategoryTitle = (cat: 'completa' | 'quien_lo_dijo' | 'responde') => {
    switch (cat) {
      case 'completa':
        return {
          es: 'Juego 1: Completa la frase',
          hy: 'Խաղ 1. Լրացրո՛ւ նախադասությունը',
          descEs: 'Elige la palabra correcta para completar la frase del vídeo.',
          descHy: 'Ընտրեք ճիշտ բառը տեսանյութի նախադասությունը լրացնելու համար։',
        };
      case 'quien_lo_dijo':
        return {
          es: 'Juego 2: ¿Quién lo dijo?',
          hy: 'Խաղ 2. Ո՞վ ասաց',
          descEs: 'Identifica qué personaje de la escena pronunció cada réplica.',
          descHy: 'Որոշեք, թե կերպարներից ով է արտասանել այս խոսքերը։',
        };
      case 'responde':
        return {
          es: 'Juego 3: Responde como el personaje',
          hy: 'Խաղ 3. Պատասխանի՛ր հերոսի նման',
          descEs: 'Elige la respuesta más natural y cómica que dio el personaje en la escena.',
          descHy: 'Ընտրեք ամենաբնական և դիպուկ պատասխանը տեսարանից։',
        };
    }
  };

  const categoryInfo = getCategoryTitle(activeCategory);

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#FFD166]/50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#D62839] bg-[#FFF8EF] px-3 py-1 rounded-full border border-[#FFD166]">
              {video.cardTitleEs}
            </span>
            <h3 className="text-2xl font-black text-[#750D32] mt-1 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-[#FF8C42]" />
              <span>Juegos interactivos</span>
            </h3>
            <p className="text-xs text-[#FF8C42] font-semibold">
              Ինտերակտիվ խաղեր — Իսպաներեն տեքստն անմիջապես, հայերենը՝ միայն սեղմելով
            </p>
          </div>

          <button
            onClick={handleResetCategory}
            className="text-xs font-bold text-gray-500 hover:text-[#750D32] flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar categoría / Կրկնել</span>
          </button>
        </div>

        {/* Game Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['completa', 'quien_lo_dijo', 'responde'] as const).map((cat) => {
            const info = getCategoryTitle(cat);
            const isCurrent = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`p-3 rounded-2xl text-left transition border-2 ${
                  isCurrent
                    ? 'bg-[#750D32] text-white border-[#FF8C42] shadow-md'
                    : 'bg-[#FFF8EF] text-gray-700 border-[#FFD166]/60 hover:border-[#FF8C42]'
                }`}
              >
                <div className={`text-xs font-black ${isCurrent ? 'text-white' : 'text-[#750D32]'}`}>
                  {info.es}
                </div>
                <div className={`text-[11px] font-sans ${isCurrent ? 'text-[#FFD166]' : 'text-[#FF8C42]'}`}>
                  {info.hy}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description of active game */}
      <div className="bg-[#FFF8EF] p-4 rounded-2xl border border-[#FFD166] text-xs">
        <span className="font-bold text-[#750D32] block mb-0.5">{categoryInfo.descEs}</span>
        <span className="text-gray-600 font-sans block">{categoryInfo.descHy}</span>
      </div>

      {/* Questions List for active game */}
      <div className="space-y-5">
        {currentQuestions.map((q, qIndex) => {
          const isPromptRevealed = !!revealedPrompts[q.id];
          const isChecked = !!checkedStatus[q.id];
          const selectedOpt = selectedAnswers[q.id];
          const isCorrect = selectedOpt === q.correctOptionId;

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#FFD166]/50 space-y-4"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-lg bg-[#FF8C42] text-white font-black text-xs flex items-center justify-center">
                      {qIndex + 1}
                    </span>
                    {q.contextEs && (
                      <span className="text-xs font-semibold text-gray-500 italic">
                        {q.contextEs}
                      </span>
                    )}
                  </div>

                  {/* Spanish Prompt (click reveals Armenian) */}
                  <div
                    onClick={() => togglePromptTranslation(q.id)}
                    className="cursor-pointer group/prompt"
                    title="Haz clic para ver traducción en armenio"
                  >
                    <p className="text-base sm:text-lg font-black text-gray-900 group-hover/prompt:text-[#D62839] transition">
                      {q.promptEs}
                    </p>
                  </div>

                  {isPromptRevealed && (
                    <div className="mt-2 text-xs font-semibold text-[#750D32] bg-[#FFF8EF] p-2 rounded-xl border border-[#FFD166] animate-fadeIn">
                      <span className="font-sans block">{q.promptHy}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => togglePromptTranslation(q.id)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    isPromptRevealed
                      ? 'bg-[#D62839] text-white'
                      : 'bg-[#FFF8EF] text-[#750D32] border border-[#FFD166] hover:bg-[#FFD166]/40'
                  }`}
                >
                  {isPromptRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">Հայերեն</span>
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {q.options.map((opt) => {
                  const optKey = `${q.id}-${opt.id}`;
                  const isSelected = selectedOpt === opt.id;
                  const isOptRevealed = !!revealedOptions[optKey];

                  let optClass = 'bg-[#FFF8EF] border-[#FFD166] hover:border-[#FF8C42] text-gray-800';
                  if (isSelected) {
                    optClass = 'bg-[#750D32] text-white border-[#FF8C42] shadow-md';
                  }

                  if (isChecked) {
                    if (opt.id === q.correctOptionId) {
                      optClass = 'bg-emerald-600 text-white border-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-red-600 text-white border-red-400';
                    }
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`rounded-2xl border-2 p-3 transition flex flex-col justify-between ${optClass}`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <button
                          type="button"
                          disabled={isChecked}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          className="flex-1 text-left font-bold text-sm cursor-pointer"
                        >
                          {opt.textEs}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleOptionTranslation(optKey, e)}
                          className="text-[10px] font-semibold opacity-80 hover:opacity-100 p-1 rounded"
                          title="Traducir opción al armenio"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>

                      {isOptRevealed && (
                        <div className="mt-1 pt-1 border-t border-black/10 text-[11px] font-sans opacity-95">
                          {opt.textHy}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Check Answer and Feedback */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {!isChecked ? (
                    <button
                      disabled={!selectedOpt}
                      onClick={() => handleCheckAnswer(q)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition ${
                        selectedOpt
                          ? 'bg-[#FF8C42] hover:bg-[#e07530] text-white cursor-pointer'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Comprobar — Ստուգել
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>¡Correcto! — Ճիշտ է!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-black text-red-700">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Incorrecto — Սխալ է</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isChecked && (
                  <p className="text-xs text-gray-600 max-w-sm text-right">
                    {q.explanationEs}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
