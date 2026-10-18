import React from 'react';
import { Film, BookOpen, HelpCircle, Gamepad2, Award, ChevronRight } from 'lucide-react';
import { VideoMeta } from './types.ts';

interface HeaderProps {
  currentVideo: VideoMeta;
  activeTab: 'video' | 'dictionary' | 'quiz' | 'games' | 'progress';
  onTabChange: (tab: 'video' | 'dictionary' | 'quiz' | 'games' | 'progress') => void;
  onSelectVideo: (videoId: 'video1' | 'video2') => void;
  onGoHome: () => void;
  isHomeView: boolean;
  completionPercentage: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentVideo,
  activeTab,
  onTabChange,
  onSelectVideo,
  onGoHome,
  isHomeView,
  completionPercentage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#750D32] text-white shadow-lg border-b-4 border-[#FF8C42]">
      {/* Top bar with branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-[#FFD166] rounded-xl p-1 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#D62839] flex items-center justify-center text-white font-black text-2xl shadow-md border-2 border-[#FFD166] group-hover:scale-105 transition transform">
              M
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Español con Monita
                <span className="hidden sm:inline-block text-xs bg-[#FF8C42] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  Rioplatense
                </span>
              </h1>
              <p className="text-xs text-[#FFD166] font-medium tracking-wide">
                Իսպաներեն Մոնիտայի հետ
              </p>
            </div>
          </button>

          {/* Video Switcher and Progress Badge */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center bg-[#580824] p-1 rounded-xl border border-[#941341]">
              <button
                onClick={() => {
                  onSelectVideo('video1');
                  if (isHomeView) onTabChange('video');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentVideo.id === 'video1' && !isHomeView
                    ? 'bg-[#D62839] text-white shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Vídeo 1: Ricardo y Martín
              </button>
              <button
                onClick={() => {
                  onSelectVideo('video2');
                  if (isHomeView) onTabChange('video');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentVideo.id === 'video2' && !isHomeView
                    ? 'bg-[#D62839] text-white shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Vídeo 2: Fiesta privada
              </button>
            </div>

            {/* Overall Progress Widget */}
            <button
              onClick={() => onTabChange('progress')}
              className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#ff7a26] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition border border-[#FFD166]"
              title="Progreso — Առաջընթաց"
            >
              <Award className="w-4 h-4 text-[#FFD166]" />
              <span>{completionPercentage}%</span>
              <span className="hidden sm:inline text-[11px] opacity-90">Առաջընթաց</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs (visible when viewing a video or learning modules) */}
      {!isHomeView && (
        <div className="bg-[#580824] border-t border-[#941341]/60 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max">
              <button
                onClick={onGoHome}
                className="px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#750D32] transition flex items-center gap-1"
              >
                <span>Elige un vídeo</span>
                <span className="text-[10px] text-[#FFD166]">(Ընտրել)</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </button>

              <button
                onClick={() => onTabChange('video')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'video'
                    ? 'bg-[#D62839] text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-[#750D32]'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Vídeo y Subtítulos</span>
                <span className="text-[10px] opacity-80">(Տեսանյութ)</span>
              </button>

              <button
                onClick={() => onTabChange('dictionary')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'dictionary'
                    ? 'bg-[#D62839] text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-[#750D32]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Expresiones</span>
                <span className="text-[10px] opacity-80">(Բառարան)</span>
              </button>

              <button
                onClick={() => onTabChange('quiz')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-[#D62839] text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-[#750D32]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Quiz</span>
                <span className="text-[10px] opacity-80">(Վիկտորինա)</span>
              </button>

              <button
                onClick={() => onTabChange('games')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'games'
                    ? 'bg-[#D62839] text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-[#750D32]'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Juegos</span>
                <span className="text-[10px] opacity-80">(Խաղեր)</span>
              </button>

              <button
                onClick={() => onTabChange('progress')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'progress'
                    ? 'bg-[#D62839] text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-[#750D32]'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Progreso</span>
                <span className="text-[10px] opacity-80">(Առաջընթաց)</span>
              </button>
            </div>

            {/* Video label for mobile */}
            <div className="md:hidden ml-2 flex-shrink-0">
              <span className="text-[11px] bg-[#750D32] px-2 py-1 rounded text-[#FFD166] font-semibold border border-[#941341]">
                {currentVideo.id === 'video1' ? 'Vídeo 1' : 'Vídeo 2'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
