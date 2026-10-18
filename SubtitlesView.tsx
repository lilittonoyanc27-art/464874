import React, { useState, useEffect, useRef } from 'react';
import { Play, Languages, AlertCircle, Eye, EyeOff, Search, Compass, Navigation, Sliders } from 'lucide-react';
import { SubtitleItem } from './types.ts';
import { formatTime, getActiveSubtitleIndex } from './quizLogic.ts';

interface SubtitlesViewProps {
  subtitles: SubtitleItem[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSubtitleRevealed: (id: string) => void;
}

export const SubtitlesView: React.FC<SubtitlesViewProps> = ({
  subtitles,
  currentTime,
  onSeek,
  onSubtitleRevealed,
}) => {
  // Store revealed state per subtitle ID (ONLY revealed on click!)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Default auto-scroll to false so user has complete freedom to browse subtitles and watch video
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(false);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);
  const userScrollTimeoutRef = useRef<any>(null);

  const activeIndex = getActiveSubtitleIndex(subtitles, currentTime);
  const activeSubRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  // Smoothly scroll ONLY within the internal container element (NEVER scroll the browser window!)
  const scrollToActiveSubtitle = (smooth: boolean = true) => {
    const container = listContainerRef.current;
    const element = activeSubRef.current;
    if (!container || !element) return;

    // Calculate relative position strictly inside the container
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const elementTop = element.offsetTop - container.offsetTop;
    const elementHeight = element.offsetHeight;

    const targetScroll = elementTop - containerHeight / 2 + elementHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Only auto-scroll when user explicitly has auto-scroll enabled and is not manually scrolling
  useEffect(() => {
    if (autoScrollEnabled && !isUserScrolling && activeIndex >= 0) {
      scrollToActiveSubtitle(true);
    }
  }, [activeIndex, autoScrollEnabled, isUserScrolling]);

  // Handle manual user scrolling to pause auto-scroll temporarily if enabled
  const handleContainerScroll = () => {
    if (!autoScrollEnabled) return;
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 4000);
  };

  const toggleTranslation = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setRevealedIds((prev) => {
      const isCurrentlyRevealed = !!prev[id];
      const nextState = !isCurrentlyRevealed;
      if (nextState) {
        onSubtitleRevealed(id);
      }
      return { ...prev, [id]: nextState };
    });
  };

  const filteredSubtitles = subtitles.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.spanish.toLowerCase().includes(query) ||
      sub.armenian.toLowerCase().includes(query) ||
      sub.speaker.toLowerCase().includes(query)
    );
  });

  const revealedCount = Object.values(revealedIds).filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-[#FFD166]/40 flex flex-col h-full max-h-[680px] overflow-hidden">
      {/* Subtitles Header & Controls */}
      <div className="bg-[#750D32] text-white p-4 sm:p-5 border-b-2 border-[#FF8C42]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#FFD166]" />
              <span>Subtítulos interactivos</span>
            </h3>
            <p className="text-xs text-[#FFD166] font-medium">
              Ինտերակտիվ ենթագրեր — Սեղմեք հայերեն թարգմանությունը տեսնելու համար
            </p>
          </div>

          {/* Quick Counter */}
          <span className="text-xs bg-[#580824] px-2.5 py-1 rounded-full text-[#FFD166] font-bold border border-[#941341]">
            {revealedCount} / {subtitles.length} թարգմանություն
          </span>
        </div>

        {/* Scroll Mode Controls: Free vs Auto-scroll & Jump to current */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          {/* Toggle Free scroll vs Auto-scroll */}
          <button
            onClick={() => {
              const nextState = !autoScrollEnabled;
              setAutoScrollEnabled(nextState);
              if (nextState) {
                setIsUserScrolling(false);
                scrollToActiveSubtitle(true);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              autoScrollEnabled
                ? 'bg-[#FF8C42] text-white ring-2 ring-[#FFD166]'
                : 'bg-[#580824] text-gray-200 hover:text-white border border-[#941341]'
            }`}
            title="Activar o desactivar auto-scroll"
          >
            <Compass className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>
              {autoScrollEnabled
                ? 'Auto-scroll: Activo (Ավտո-ոլորում)'
                : 'Modo libre (Ազատ թերթում)'}
            </span>
          </button>

          {/* Jump to current active line button */}
          <button
            onClick={() => scrollToActiveSubtitle(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#580824] hover:bg-[#941341] text-[#FFD166] border border-[#941341] transition flex items-center gap-1.5 cursor-pointer"
            title="Desplazarse a la frase que se escucha ahora"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Ir a la frase actual — Ընթացիկ խոսքին</span>
          </button>
        </div>

        {/* User friendly guidance banner */}
        <div className="bg-[#580824]/90 p-2.5 rounded-xl text-[11px] text-white/90 flex items-start gap-2 border border-[#941341]">
          <span className="text-[#FFD166] font-bold">Ազատ ռեժիմ:</span>
          <span>
            Կարող եք հանգիստ թերթել ենթագրերը և միաժամանակ դիտել տեսանյութը։ Էջը ավտոմատ չի թռչի։ Սեղմեք ցանկացած տողի՝ հայերեն թարգմանությունը տեսնելու համար։
          </span>
        </div>

        {/* Search bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar frase o palabra... / Որոնել բառ կամ արտահայտություն..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#580824] text-white placeholder-gray-300 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#941341] focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
          />
        </div>
      </div>

      {/* Subtitle Items List with smooth internal scroll */}
      <div
        ref={listContainerRef}
        onScroll={handleContainerScroll}
        className="divide-y divide-gray-100 overflow-y-auto p-3 sm:p-4 space-y-2.5 subtitles-scroll flex-1 relative"
      >
        {filteredSubtitles.map((sub, idx) => {
          const isActive = idx === activeIndex && !searchQuery;
          const isRevealed = !!revealedIds[sub.id];

          return (
            <div
              key={sub.id}
              ref={isActive ? activeSubRef : null}
              className={`p-3.5 rounded-2xl transition-all duration-200 border-2 ${
                isActive
                  ? 'bg-[#FFF8EF] border-[#FF8C42] shadow-md ring-2 ring-[#FF8C42]/20'
                  : 'bg-white border-transparent hover:bg-orange-50/50 hover:border-[#FFD166]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Timestamp seek button */}
                  <button
                    onClick={() => onSeek(sub.startSeconds)}
                    className="flex items-center gap-1 bg-[#750D32] hover:bg-[#580824] text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition shadow-sm cursor-pointer"
                    title={`Saltar a ${formatTime(sub.startSeconds)}`}
                  >
                    <Play className="w-3 h-3 fill-current text-[#FFD166]" />
                    <span>{formatTime(sub.startSeconds)}</span>
                  </button>

                  {/* Speaker pill */}
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#D62839] bg-[#FFF8EF] px-2 py-0.5 rounded-md border border-[#FFD166]/50">
                    {sub.speaker}
                  </span>

                  {isActive && (
                    <span className="text-[10px] bg-[#FF8C42] text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Ahora — Հիմա
                    </span>
                  )}
                </div>

                {/* Translation toggle button */}
                <button
                  onClick={(e) => toggleTranslation(sub.id, e)}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                    isRevealed
                      ? 'bg-[#D62839] text-white shadow-sm'
                      : 'bg-[#FFF8EF] text-[#750D32] border border-[#FFD166] hover:bg-[#FFD166]/30'
                  }`}
                  aria-label={isRevealed ? 'Ocultar armenio' : 'Ver armenio'}
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#FFD166]" />
                      <span>Հայերեն</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#D62839]" />
                      <span>Հայերեն</span>
                    </>
                  )}
                </button>
              </div>

              {/* Spanish Line (Clicking it toggles translation as requested) */}
              <div
                onClick={() => toggleTranslation(sub.id)}
                className="cursor-pointer group/line pt-1"
                title="Haz clic para ver/ocultar traducción armenia"
              >
                <p className="text-base sm:text-lg font-bold text-gray-900 group-hover/line:text-[#D62839] transition">
                  {sub.spanish}
                </p>
              </div>

              {/* Armenian Translation (Only shown when revealed by click) */}
              {isRevealed && (
                <div className="mt-2.5 pt-2.5 border-t border-[#FFD166]/60 bg-[#FFF8EF] p-2.5 rounded-xl border border-[#FFD166] animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] text-[#750D32] font-semibold mb-0.5">
                    <span>Հայերեն թարգմանություն:</span>
                    <button
                      onClick={() => toggleTranslation(sub.id)}
                      className="text-[10px] text-gray-500 hover:text-red-700 underline"
                    >
                      Թաքցնել
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 font-sans leading-relaxed">
                    {sub.armenian}
                  </p>
                </div>
              )}

              {/* Verification alert if unclear/approximate in audio */}
              {sub.needsVerification && (
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      Transcripción por verificar — Ստուգման ենթակա:
                    </span>
                    <span className="block text-gray-700">{sub.verificationNote?.es}</span>
                    <span className="block text-gray-600 font-sans">{sub.verificationNote?.hy}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSubtitles.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">
            No se encontraron subtítulos coincidentes. / Ենթագրեր չեն գտնվել։
          </div>
        )}
      </div>
    </div>
  );
};
