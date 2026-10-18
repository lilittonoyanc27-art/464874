import React, { useState } from 'react';
import { BookOpen, Check, Eye, EyeOff, Sparkles, Filter, Volume2 } from 'lucide-react';
import { VocabItem, VideoMeta } from './types.ts';

interface DictionaryViewProps {
  video: VideoMeta;
  items: VocabItem[];
  learnedIds: string[];
  onToggleLearned: (id: string) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  video,
  items,
  learnedIds,
  onToggleLearned,
}) => {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [filterTag, setFilterTag] = useState<string>('todos');

  const toggleTranslation = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = items.filter((item) => {
    if (filterTag === 'todos') return true;
    return item.typeTag === filterTag;
  });

  const getBadgeColor = (tag: VocabItem['typeTag']) => {
    switch (tag) {
      case 'vulgar':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'coloquial':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'informal':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'frase hecha':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#FFD166]/50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#D62839] bg-[#FFF8EF] px-3 py-1 rounded-full border border-[#FFD166]">
                {video.cardTitleEs}
              </span>
              <span className="text-xs text-gray-500 font-bold">
                {learnedIds.length} / {items.length} սովորած
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#750D32] mt-1 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#FF8C42]" />
              <span>Diccionario argentino</span>
            </h3>
            <p className="text-xs text-[#FF8C42] font-semibold">
              Արգենտինական արտահայտությունների բառարան — Սեղմեք քարտին թարգմանությունը տեսնելու համար
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400 mr-1" />
            <button
              onClick={() => setFilterTag('todos')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterTag === 'todos'
                  ? 'bg-[#750D32] text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setFilterTag('coloquial')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterTag === 'coloquial'
                  ? 'bg-[#FF8C42] text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Coloquial
            </button>
            <button
              onClick={() => setFilterTag('vulgar')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterTag === 'vulgar'
                  ? 'bg-[#D62839] text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vulgar
            </button>
          </div>
        </div>

        {/* Tip */}
        <p className="text-xs text-gray-600 bg-[#FFF8EF] p-3 rounded-2xl border border-[#FFD166]/40">
          💡 Las expresiones marcadas como <strong className="text-red-700">«vulgar»</strong> son groseras en contextos formales y deben usarse con precaución. El español de Argentina (voseo rioplatense) tiene giros únicos como <em>«querés»</em> o <em>«mina»</em>.
        </p>
      </div>

      {/* Grid of Flashcards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isRevealed = !!revealedIds[item.id];
          const isLearned = learnedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                isLearned
                  ? 'border-emerald-300 ring-2 ring-emerald-100'
                  : 'border-[#FFD166]/60 hover:border-[#FF8C42]'
              }`}
            >
              {/* Card Top */}
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${getBadgeColor(
                      item.typeTag
                    )}`}
                  >
                    {item.typeTag}
                    <span className="hidden sm:inline font-normal ml-1 opacity-75">
                      ({item.typeTagHy})
                    </span>
                  </span>

                  <button
                    onClick={() => onToggleLearned(item.id)}
                    className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isLearned
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400 hover:text-emerald-600'
                    }`}
                    title={isLearned ? 'Desmarcar' : 'Marcar como aprendido'}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">
                      {isLearned ? 'Aprendido' : 'Marcar'}
                    </span>
                  </button>
                </div>

                {/* Main Spanish Expression */}
                <div
                  onClick={() => toggleTranslation(item.id)}
                  className="cursor-pointer group/title"
                  title="Haz clic para ver la traducción al armenio"
                >
                  <h4 className="text-xl font-black text-[#750D32] group-hover/title:text-[#D62839] transition mb-1">
                    {item.expressionEs}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2">
                    {item.explanationEs}
                  </p>
                </div>

                {/* Translation & Cultural Explanation (Toggled on click) */}
                {isRevealed ? (
                  <div className="mt-4 pt-3 border-t border-[#FFD166] bg-[#FFF8EF] p-3.5 rounded-2xl border border-[#FFD166] animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] text-[#D62839] font-bold mb-1">
                      <span>Հայերեն թարգմանություն:</span>
                      <button
                        onClick={() => toggleTranslation(item.id)}
                        className="text-[10px] text-gray-500 hover:text-red-600 underline"
                      >
                        Թաքցնել
                      </button>
                    </div>

                    <p className="text-base font-black text-gray-900 font-sans mb-1.5">
                      {item.expressionHy}
                    </p>

                    <p className="text-xs text-gray-700 font-sans leading-relaxed">
                      {item.explanationHy}
                    </p>

                    {/* Example phrase */}
                    <div className="mt-2.5 pt-2 border-t border-[#FFD166]/60 text-[11px]">
                      <span className="font-bold text-[#750D32] block">Օրինակ տեսանյութից:</span>
                      <span className="italic text-gray-800 block">{item.exampleEs}</span>
                      <span className="text-gray-600 font-sans block mt-0.5">{item.exampleHy}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => toggleTranslation(item.id)}
                      className="w-full bg-[#FFF8EF] hover:bg-[#ffedd5] text-[#750D32] border border-[#FFD166] py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D62839]" />
                      <span>Ver traducción — Տեսնել հայերենը</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
