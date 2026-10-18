import React, { useState, useEffect } from 'react';
import { VIDEOS_DATA, SUBTITLES_VIDEO_1, SUBTITLES_VIDEO_2 } from './videoData.ts';
import { DICTIONARY_VIDEO_1, DICTIONARY_VIDEO_2 } from './dictionaryData.ts';
import { QUIZ_VIDEO_1, QUIZ_VIDEO_2 } from './quizData.ts';
import { GAMES_VIDEO_1, GAMES_VIDEO_2 } from './gamesData.ts';
import { AppProgressState, VideoProgress } from './types.ts';
import { calculateOverallProgress } from './quizLogic.ts';

import { Header } from './Header.tsx';
import { VideoCard } from './VideoCard.tsx';
import { VideoPlayerView } from './VideoPlayerView.tsx';
import { SubtitlesView } from './SubtitlesView.tsx';
import { QuizView } from './QuizView.tsx';
import { DictionaryView } from './DictionaryView.tsx';
import { GamesView } from './GamesView.tsx';
import { ProgressView } from './ProgressView.tsx';
import { Sparkles, Play, BookOpen, HelpCircle, Gamepad2, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'es_con_monita_progress_v1';

const initialVideoProgress: VideoProgress = {
  subtitlesRevealedCount: 0,
  quizHighScore: 0,
  quizTotalQuestions: 13,
  quizCompleted: false,
  vocabLearnedIds: [],
  gamesCompletedIds: [],
};

const initialProgressState: AppProgressState = {
  video1: { ...initialVideoProgress },
  video2: { ...initialVideoProgress },
};

export default function App() {
  const [selectedVideoId, setSelectedVideoId] = useState<'video1' | 'video2'>('video1');
  const [activeTab, setActiveTab] = useState<'video' | 'dictionary' | 'quiz' | 'games' | 'progress'>('video');
  const [isHomeView, setIsHomeView] = useState<boolean>(true);

  // Video playback & subtitle synchronization
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Local storage progress state
  const [progressState, setProgressState] = useState<AppProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return initialProgressState;
  });

  // Save to localStorage whenever progress updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));
    } catch (e) {
      console.warn('Could not write to localStorage', e);
    }
  }, [progressState]);

  const currentVideo = VIDEOS_DATA[selectedVideoId];
  const currentSubtitles = selectedVideoId === 'video1' ? SUBTITLES_VIDEO_1 : SUBTITLES_VIDEO_2;
  const currentDictionary = selectedVideoId === 'video1' ? DICTIONARY_VIDEO_1 : DICTIONARY_VIDEO_2;
  const currentQuiz = selectedVideoId === 'video1' ? QUIZ_VIDEO_1 : QUIZ_VIDEO_2;
  const currentGames = selectedVideoId === 'video1' ? GAMES_VIDEO_1 : GAMES_VIDEO_2;
  const currentProgress = progressState[selectedVideoId];

  // Handler for actions directly from Home cards
  const handleCardAction = (
    videoId: 'video1' | 'video2',
    action: 'video' | 'dictionary' | 'quiz' | 'games'
  ) => {
    setSelectedVideoId(videoId);
    setActiveTab(action);
    setIsHomeView(false);
    setCurrentTime(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subtitle reveal tracker
  const handleSubtitleRevealed = (subtitleId: string) => {
    setProgressState((prev) => {
      const vProg = prev[selectedVideoId];
      const count = Math.min(vProg.subtitlesRevealedCount + 1, currentSubtitles.length);
      return {
        ...prev,
        [selectedVideoId]: {
          ...vProg,
          subtitlesRevealedCount: count,
        },
      };
    });
  };

  // Quiz completion tracker
  const handleQuizComplete = (score: number, total: number) => {
    setProgressState((prev) => {
      const vProg = prev[selectedVideoId];
      const newHigh = Math.max(vProg.quizHighScore, score);
      return {
        ...prev,
        [selectedVideoId]: {
          ...vProg,
          quizHighScore: newHigh,
          quizTotalQuestions: total,
          quizCompleted: true,
        },
      };
    });
  };

  // Vocab learned toggle
  const handleToggleVocabLearned = (vocabId: string) => {
    setProgressState((prev) => {
      const vProg = prev[selectedVideoId];
      const exists = vProg.vocabLearnedIds.includes(vocabId);
      const updated = exists
        ? vProg.vocabLearnedIds.filter((id) => id !== vocabId)
        : [...vProg.vocabLearnedIds, vocabId];

      return {
        ...prev,
        [selectedVideoId]: {
          ...vProg,
          vocabLearnedIds: updated,
        },
      };
    });
  };

  // Game complete tracker
  const handleGameComplete = (gameId: string) => {
    setProgressState((prev) => {
      const vProg = prev[selectedVideoId];
      if (vProg.gamesCompletedIds.includes(gameId)) return prev;
      return {
        ...prev,
        [selectedVideoId]: {
          ...vProg,
          gamesCompletedIds: [...vProg.gamesCompletedIds, gameId],
        },
      };
    });
  };

  // Reset all learning progress
  const handleResetProgress = () => {
    if (window.confirm('¿Deseas reiniciar todo tu progreso de aprendizaje? / Ցանկանո՞ւմ եք ջնջել ձեր ամբողջ առաջընթացը։')) {
      setProgressState(initialProgressState);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Overall percentage
  const overallPercentage = Math.round(
    (calculateOverallProgress(
      progressState.video1.subtitlesRevealedCount,
      SUBTITLES_VIDEO_1.length,
      progressState.video1.quizHighScore,
      QUIZ_VIDEO_1.length,
      progressState.video1.vocabLearnedIds.length,
      DICTIONARY_VIDEO_1.length
    ) +
      calculateOverallProgress(
        progressState.video2.subtitlesRevealedCount,
        SUBTITLES_VIDEO_2.length,
        progressState.video2.quizHighScore,
        QUIZ_VIDEO_2.length,
        progressState.video2.vocabLearnedIds.length,
        DICTIONARY_VIDEO_2.length
      )) /
      2
  );

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-gray-900 flex flex-col font-sans">
      {/* Header bar */}
      <Header
        currentVideo={currentVideo}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsHomeView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectVideo={(id) => {
          setSelectedVideoId(id);
          setCurrentTime(0);
        }}
        onGoHome={() => {
          setIsHomeView(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isHomeView={isHomeView}
        completionPercentage={overallPercentage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: HOME PAGE — "Elige un vídeo" */}
        {isHomeView ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#750D32] via-[#D62839] to-[#FF8C42] text-white p-6 sm:p-10 shadow-2xl border-4 border-[#FFD166]">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#FFD166] text-[#750D32] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Español Rioplatense — Արգենտինական իսպաներեն</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Español con Monita
                </h2>
                <h3 className="text-xl sm:text-2xl font-bold text-[#FFD166]">
                  Իսպաներեն Մոնիտայի հետ
                </h3>

                <p className="text-sm sm:text-base text-white/95 leading-relaxed pt-1">
                  Aprende español argentino auténtico con escenas de la serie. Mira los vídeos originales, descubre los subtítulos interactivos con traducción al armenio al hacer clic, domina el vocabulario coloquial y pon a prueba tus conocimientos con el quiz.
                </p>
                <p className="text-xs sm:text-sm text-[#FFD166] font-medium leading-relaxed font-sans">
                  Սովորեք կենդանի արգենտինական իսպաներեն՝ դիտելով բնօրինակ տեսանյութերը։ Բացահայտեք հայերեն թարգմանությունները սեղմելով, ուսումնասիրեք խոսակցական բառարանը և անցեք ինտերակտիվ վիկտորինան։
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 blur-3xl pointer-events-none" />
            </div>

            {/* Title Section for Cards */}
            <div className="text-center space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-[#750D32]">
                Elige un vídeo — Ընտրեք տեսանյութ
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                Selecciona una de las dos escenas para comenzar a aprender
              </p>
            </div>

            {/* The 2 Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <VideoCard
                video={VIDEOS_DATA.video1}
                progress={progressState.video1}
                onAction={handleCardAction}
              />
              <VideoCard
                video={VIDEOS_DATA.video2}
                progress={progressState.video2}
                onAction={handleCardAction}
              />
            </div>

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-[#FFD166]/50 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#750D32] text-[#FFD166] flex items-center justify-center font-bold mb-3">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <h4 className="font-black text-[#750D32] text-sm mb-1">
                  Subtítulos por clic
                </h4>
                <p className="text-xs text-gray-600">
                  El texto en español se muestra por defecto. Al tocar cualquier frase, aparece su traducción armenia.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-[#FFD166]/50 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D62839] text-[#FFD166] flex items-center justify-center font-bold mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-black text-[#D62839] text-sm mb-1">
                  Diccionario argentino
                </h4>
                <p className="text-xs text-gray-600">
                  Expresiones auténticas como <em>fajar, mina, plata, partuza</em> y notas culturales rioplatenses.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-[#FFD166]/50 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#FF8C42] text-white flex items-center justify-center font-bold mb-3">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-black text-[#FF8C42] text-sm mb-1">
                  Quiz & Juegos interactivos
                </h4>
                <p className="text-xs text-gray-600">
                  13 preguntas por vídeo y 3 minijuegos con explicaciones traducibles por clic.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: ACTIVE LEARNING VIEW (Video, Dictionary, Quiz, Games, Progress) */
          <div className="space-y-6 animate-fadeIn">
            {/* Top context sub-header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-[#FFD166]/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsHomeView(true)}
                  className="p-2 rounded-xl bg-[#FFF8EF] hover:bg-[#ffedd5] text-[#750D32] border border-[#FFD166] transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Elige un vídeo</span>
                </button>

                <div>
                  <span className="text-xs font-black uppercase text-[#D62839]">
                    {currentVideo.id === 'video1' ? 'Vídeo 1' : 'Vídeo 2'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#750D32] leading-tight">
                    {currentVideo.cardTitleEs}
                  </h3>
                  <p className="text-xs text-gray-500 font-sans">
                    {currentVideo.cardTitleHy}
                  </p>
                </div>
              </div>

              {/* Video Switcher */}
              <div className="flex items-center gap-1 bg-[#FFF8EF] p-1 rounded-xl border border-[#FFD166]">
                <button
                  onClick={() => {
                    setSelectedVideoId('video1');
                    setCurrentTime(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedVideoId === 'video1'
                      ? 'bg-[#750D32] text-white shadow'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Vídeo 1
                </button>
                <button
                  onClick={() => {
                    setSelectedVideoId('video2');
                    setCurrentTime(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedVideoId === 'video2'
                      ? 'bg-[#750D32] text-white shadow'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Vídeo 2
                </button>
              </div>
            </div>

            {/* TAB 1: Video Player and Synchronized Subtitles */}
            {activeTab === 'video' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Video Player (Sticky so user can watch video while reading subtitles) */}
                <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24 z-20">
                  <VideoPlayerView
                    video={currentVideo}
                    currentTime={currentTime}
                    onTimeUpdate={setCurrentTime}
                    seekTime={seekTime}
                    onSeekComplete={() => setSeekTime(null)}
                  />

                  {/* Quick video summary card */}
                  <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-[#FFD166]/40 space-y-2">
                    <h4 className="text-sm font-black text-[#750D32] uppercase tracking-wider">
                      Acerca de esta escena / Տեսարանի մասին
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {currentVideo.descriptionEs}
                    </p>
                    <p className="text-xs text-gray-600 font-sans leading-relaxed">
                      {currentVideo.descriptionHy}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTab('quiz')}
                        className="px-4 py-2 bg-[#FF8C42] hover:bg-[#e07530] text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Hacer el quiz ({currentQuiz.length} preguntas)
                      </button>
                      <button
                        onClick={() => setActiveTab('dictionary')}
                        className="px-4 py-2 bg-[#FFF8EF] hover:bg-[#ffedd5] text-[#750D32] border border-[#FFD166] font-bold text-xs rounded-xl transition"
                      >
                        Aprender expresiones ({currentDictionary.length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Interactive Subtitles */}
                <div className="lg:col-span-5">
                  <SubtitlesView
                    subtitles={currentSubtitles}
                    currentTime={currentTime}
                    onSeek={(seconds) => setSeekTime(seconds)}
                    onSubtitleRevealed={handleSubtitleRevealed}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Dictionary */}
            {activeTab === 'dictionary' && (
              <DictionaryView
                video={currentVideo}
                items={currentDictionary}
                learnedIds={currentProgress.vocabLearnedIds}
                onToggleLearned={handleToggleVocabLearned}
              />
            )}

            {/* TAB 3: Quiz */}
            {activeTab === 'quiz' && (
              <QuizView
                video={currentVideo}
                questions={currentQuiz}
                onComplete={handleQuizComplete}
                onBackToVideo={() => setActiveTab('video')}
                savedHighScore={currentProgress.quizHighScore}
              />
            )}

            {/* TAB 4: Mini-Games */}
            {activeTab === 'games' && (
              <GamesView
                video={currentVideo}
                games={currentGames}
                onGameComplete={handleGameComplete}
                completedGameIds={currentProgress.gamesCompletedIds}
              />
            )}

            {/* TAB 5: Progress */}
            {activeTab === 'progress' && (
              <ProgressView
                progressState={progressState}
                video1Meta={VIDEOS_DATA.video1}
                video2Meta={VIDEOS_DATA.video2}
                video1SubsTotal={SUBTITLES_VIDEO_1.length}
                video2SubsTotal={SUBTITLES_VIDEO_2.length}
                video1VocabTotal={DICTIONARY_VIDEO_1.length}
                video2VocabTotal={DICTIONARY_VIDEO_2.length}
                onNavigateTo={(vid, tab) => {
                  setSelectedVideoId(vid);
                  setActiveTab(tab);
                  setIsHomeView(false);
                }}
                onResetProgress={handleResetProgress}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#750D32] text-white py-6 border-t-4 border-[#FF8C42] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h5 className="font-black text-white text-base">
              Español con Monita — Իսպաներեն Մոնիտայի հետ
            </h5>
            <p className="text-xs text-[#FFD166]">
              Aprende español argentino con vídeos y subtítulos bilingües
            </p>
          </div>

          <div className="text-xs text-white/80">
            <span>Diseñado con pasión rioplatense</span>
            <span className="mx-2 text-[#FFD166]">•</span>
            <span>Արգենտինական իսպաներենի ինտերակտիվ դասընթաց</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
