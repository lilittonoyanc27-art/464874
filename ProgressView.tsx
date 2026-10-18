import React from 'react';
import { Award, BookOpen, Film, HelpCircle, Gamepad2, RotateCcw, CheckCircle2, ChevronRight } from 'lucide-react';
import { AppProgressState, VideoMeta } from './types.ts';
import { calculateOverallProgress } from './quizLogic.ts';

interface ProgressViewProps {
  progressState: AppProgressState;
  video1Meta: VideoMeta;
  video2Meta: VideoMeta;
  video1SubsTotal: number;
  video2SubsTotal: number;
  video1VocabTotal: number;
  video2VocabTotal: number;
  onNavigateTo: (videoId: 'video1' | 'video2', tab: 'video' | 'dictionary' | 'quiz' | 'games') => void;
  onResetProgress: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progressState,
  video1Meta,
  video2Meta,
  video1SubsTotal,
  video2SubsTotal,
  video1VocabTotal,
  video2VocabTotal,
  onNavigateTo,
  onResetProgress,
}) => {
  const p1 = progressState.video1;
  const p2 = progressState.video2;

  const score1 = calculateOverallProgress(
    p1.subtitlesRevealedCount,
    video1SubsTotal,
    p1.quizHighScore,
    p1.quizTotalQuestions || 13,
    p1.vocabLearnedIds.length,
    video1VocabTotal
  );

  const score2 = calculateOverallProgress(
    p2.subtitlesRevealedCount,
    video2SubsTotal,
    p2.quizHighScore,
    p2.quizTotalQuestions || 13,
    p2.vocabLearnedIds.length,
    video2VocabTotal
  );

  const overallAvg = Math.round((score1 + score2) / 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#750D32] via-[#D62839] to-[#FF8C42] text-white p-6 sm:p-8 rounded-3xl shadow-xl border-4 border-[#FFD166] flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#FFD166] bg-black/20 px-3 py-1 rounded-full">
            Progreso general — Ընդհանուր առաջընթաց
          </span>
          <h3 className="text-3xl font-black text-white mt-2">
            Tu viaje con Monita
          </h3>
          <p className="text-sm font-semibold text-[#FFD166]">
            Քո ուսումնական ճանապարհը Մոնիտայի հետ
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md p-4 rounded-3xl border border-white/20">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD166] text-[#750D32] flex items-center justify-center font-black text-2xl shadow-lg">
            {overallAvg}%
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Nivel completado
            </div>
            <div className="text-xs text-[#FFD166] font-sans">
              Ավարտված մակարդակ
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards per Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video 1 Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#FFD166]/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-[#D62839] bg-[#FFF8EF] px-2.5 py-1 rounded-lg border border-[#FFD166]">
                Vídeo 1
              </span>
              <span className="text-sm font-black text-[#750D32]">{score1}%</span>
            </div>

            <h4 className="text-xl font-black text-gray-900 mb-1">{video1Meta.cardTitleEs}</h4>
            <p className="text-xs font-semibold text-[#FF8C42] mb-4">{video1Meta.cardTitleHy}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#750D32]" />
                  Subtítulos revelados
                </span>
                <span className="font-bold text-gray-900">
                  {p1.subtitlesRevealedCount} / {video1SubsTotal}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#D62839]" />
                  Récord en el Quiz
                </span>
                <span className="font-bold text-gray-900">
                  {p1.quizHighScore} / {p1.quizTotalQuestions || 13}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#FF8C42]" />
                  Expresiones aprendidas
                </span>
                <span className="font-bold text-gray-900">
                  {p1.vocabLearnedIds.length} / {video1VocabTotal}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTo('video1', 'quiz')}
              className="px-3 py-2 bg-[#FF8C42] hover:bg-[#e07530] text-white font-bold text-xs rounded-xl shadow transition text-center"
            >
              Hacer Quiz
            </button>
            <button
              onClick={() => onNavigateTo('video1', 'video')}
              className="px-3 py-2 bg-[#750D32] hover:bg-[#580824] text-white font-bold text-xs rounded-xl shadow transition text-center"
            >
              Ver vídeo
            </button>
          </div>
        </div>

        {/* Video 2 Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#FFD166]/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-[#D62839] bg-[#FFF8EF] px-2.5 py-1 rounded-lg border border-[#FFD166]">
                Vídeo 2
              </span>
              <span className="text-sm font-black text-[#750D32]">{score2}%</span>
            </div>

            <h4 className="text-xl font-black text-gray-900 mb-1">{video2Meta.cardTitleEs}</h4>
            <p className="text-xs font-semibold text-[#FF8C42] mb-4">{video2Meta.cardTitleHy}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#750D32]" />
                  Subtítulos revelados
                </span>
                <span className="font-bold text-gray-900">
                  {p2.subtitlesRevealedCount} / {video2SubsTotal}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#D62839]" />
                  Récord en el Quiz
                </span>
                <span className="font-bold text-gray-900">
                  {p2.quizHighScore} / {p2.quizTotalQuestions || 13}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#FF8C42]" />
                  Expresiones aprendidas
                </span>
                <span className="font-bold text-gray-900">
                  {p2.vocabLearnedIds.length} / {video2VocabTotal}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTo('video2', 'quiz')}
              className="px-3 py-2 bg-[#FF8C42] hover:bg-[#e07530] text-white font-bold text-xs rounded-xl shadow transition text-center"
            >
              Hacer Quiz
            </button>
            <button
              onClick={() => onNavigateTo('video2', 'video')}
              className="px-3 py-2 bg-[#750D32] hover:bg-[#580824] text-white font-bold text-xs rounded-xl shadow transition text-center"
            >
              Ver vídeo
            </button>
          </div>
        </div>
      </div>

      {/* Reset Progress Button */}
      <div className="text-center pt-4">
        <button
          onClick={onResetProgress}
          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition flex items-center justify-center gap-1.5 mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar todos los progresos — Ջնջել ամբողջ առաջընթացը</span>
        </button>
      </div>
    </div>
  );
};
