import React from 'react';
import { Play, BookOpen, HelpCircle, Gamepad2, Clock, Users, CheckCircle2 } from 'lucide-react';
import { VideoMeta, VideoProgress } from './types.ts';

interface VideoCardProps {
  video: VideoMeta;
  progress: VideoProgress;
  onAction: (videoId: 'video1' | 'video2', action: 'video' | 'dictionary' | 'quiz' | 'games') => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, progress, onAction }) => {
  const isVideo1 = video.id === 'video1';
  const badgeColor = isVideo1 ? 'bg-[#750D32]' : 'bg-[#D62839]';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#FFD166]/50 hover:border-[#FF8C42] transition-all duration-300 flex flex-col justify-between group">
      {/* Visual Header / Banner */}
      <div className="relative bg-gradient-to-br from-[#750D32] via-[#D62839] to-[#FF8C42] p-6 text-white overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#FFD166]/20 blur-lg pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFD166] text-[#750D32] shadow-sm">
            {isVideo1 ? 'Vídeo 1' : 'Vídeo 2'}
          </span>
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white">
            <Clock className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>{video.durationFormatted}</span>
          </div>
        </div>

        <h3 className="text-2xl font-black tracking-tight text-white mb-1 group-hover:text-[#FFD166] transition">
          {video.cardTitleEs}
        </h3>
        <p className="text-sm font-semibold text-[#FFD166] mb-3">
          {video.cardTitleHy}
        </p>

        <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
          {video.descriptionEs}
        </p>
      </div>

      {/* Card Content & Stats */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-[#FFF8EF] p-2.5 rounded-xl border border-[#FFD166]/40">
            <Users className="w-4 h-4 text-[#FF8C42] flex-shrink-0" />
            <div>
              <span className="font-bold text-gray-800">{video.charactersEs}</span>
              <span className="block text-[11px] text-gray-500">{video.charactersHy}</span>
            </div>
          </div>

          {/* Quick learning status */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Subtítulos</span>
              <span className="text-sm font-extrabold text-[#750D32]">
                {progress.subtitlesRevealedCount} revelados
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Quiz récord</span>
              <span className="text-sm font-extrabold text-[#D62839]">
                {progress.quizHighScore} / {progress.quizTotalQuestions || 13}
              </span>
            </div>
          </div>

          {progress.quizCompleted && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Quiz completado — Վիկտորինան ավարտված է</span>
            </div>
          )}
        </div>

        {/* 4 Dedicated Action Buttons */}
        <div className="space-y-2">
          {/* Button 1: Ver vídeo */}
          <button
            onClick={() => onAction(video.id, 'video')}
            className="w-full bg-[#750D32] hover:bg-[#580824] text-white py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-between group/btn cursor-pointer focus:ring-2 focus:ring-[#FF8C42]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FF8C42] flex items-center justify-center text-white">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="tracking-wide">Ver vídeo</span>
            </div>
            <span className="text-xs text-[#FFD166] font-medium opacity-90">Դիտել տեսանյութը</span>
          </button>

          {/* Button 2: Aprender expresiones */}
          <button
            onClick={() => onAction(video.id, 'dictionary')}
            className="w-full bg-[#D62839] hover:bg-[#b51e2d] text-white py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-between group/btn cursor-pointer focus:ring-2 focus:ring-[#FFD166]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FFD166] flex items-center justify-center text-[#750D32]">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="tracking-wide">Aprender expresiones</span>
            </div>
            <span className="text-xs text-[#FFF8EF] font-medium opacity-90">Սովորել արտահայտություններ</span>
          </button>

          {/* Button 3: Hacer el quiz */}
          <button
            onClick={() => onAction(video.id, 'quiz')}
            className="w-full bg-[#FF8C42] hover:bg-[#e07530] text-white py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-between group/btn cursor-pointer focus:ring-2 focus:ring-[#750D32]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="tracking-wide">Hacer el quiz</span>
            </div>
            <span className="text-xs text-white font-medium opacity-95">Անցնել վիկտորինան</span>
          </button>

          {/* Mini-Games Button */}
          <button
            onClick={() => onAction(video.id, 'games')}
            className="w-full bg-[#FFF8EF] hover:bg-[#ffedd5] text-[#750D32] border-2 border-[#FF8C42]/50 py-2.5 px-4 rounded-2xl font-bold text-xs transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#D62839]" />
              <span>Juegos interactivos</span>
            </div>
            <span className="text-[11px] text-[#D62839]">Ինտերակտիվ խաղեր</span>
          </button>
        </div>
      </div>
    </div>
  );
};
