import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, ExternalLink, AlertTriangle, FastForward, Rewind, Volume2 } from 'lucide-react';
import { VideoMeta } from './types.ts';
import { formatTime } from './quizLogic.ts';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerViewProps {
  video: VideoMeta;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  seekTime: number | null;
  onSeekComplete: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  video,
  currentTime,
  onTimeUpdate,
  seekTime,
  onSeekComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [embedRestricted, setEmbedRestricted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<{ es: string; hy: string } | null>(null);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);

  // Initialize YouTube Iframe API
  useEffect(() => {
    let isMounted = true;
    setEmbedRestricted(false);
    setErrorMessage(null);
    setIsPlayerReady(false);
    setIsPlaying(false);

    // Function to initialize player once API is ready
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) return;

      // Clean existing player if any
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }

      try {
        playerRef.current = new window.YT.Player(`yt-player-${video.id}`, {
          videoId: video.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              if (isMounted) {
                setIsPlayerReady(true);
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // YT.PlayerState.PLAYING is 1
              if (event.data === 1) {
                setIsPlaying(true);
                startTracking();
              } else {
                setIsPlaying(false);
                stopTracking();
              }
            },
            onError: (event: any) => {
              if (!isMounted) return;
              // 101 or 150: The owner of the requested video does not allow it to be played in embedded players.
              if (event.data === 101 || event.data === 150) {
                setEmbedRestricted(true);
                setErrorMessage({
                  es: 'El propietario del vídeo en YouTube ha restringido la reproducción incrustada en otras webs (Error ' + event.data + ').',
                  hy: 'YouTube-ի տեսանյութի սեփականատերը սահմանափակել է նվագարկումն այլ կայքերում (Սխալ ' + event.data + ')։',
                });
                setIsManualMode(true);
              }
            },
          },
        });
      } catch (err) {
        console.error('Error creating YouTube player:', err);
        setEmbedRestricted(true);
      }
    };

    // Load YT API script if not already present
    if (!window.YT || !window.YT.Player) {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        if (isMounted) initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      stopTracking();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [video.id, video.youtubeId]);

  // Handle external seek requests from subtitles click
  useEffect(() => {
    if (seekTime !== null) {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && !embedRestricted) {
        try {
          playerRef.current.seekTo(seekTime, true);
          playerRef.current.playVideo();
        } catch (e) {
          // fallback to manual time update
          onTimeUpdate(seekTime);
        }
      } else {
        // Manual mode seek
        onTimeUpdate(seekTime);
      }
      onSeekComplete();
    }
  }, [seekTime, embedRestricted, onTimeUpdate, onSeekComplete]);

  const startTracking = () => {
    stopTracking();
    timerIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const time = playerRef.current.getCurrentTime();
          onTimeUpdate(time);
        } catch (e) {
          // ignore
        }
      }
    }, 250);
  };

  const stopTracking = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleTogglePlay = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function' && !embedRestricted) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } else {
      // Manual mode simulator
      setIsPlaying(!isPlaying);
    }
  };

  const currentTimeRef = useRef<number>(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Manual timer effect when playing in manual mode or if simulation is requested
  useEffect(() => {
    if (isManualMode && isPlaying) {
      const interval = setInterval(() => {
        const cur = currentTimeRef.current;
        if (cur >= video.durationSeconds) {
          setIsPlaying(false);
          onTimeUpdate(0);
        } else {
          onTimeUpdate(Math.min(video.durationSeconds, cur + 0.25));
        }
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isManualMode, isPlaying, video.durationSeconds, onTimeUpdate]);

  const handleSeekDelta = (delta: number) => {
    const nextTime = Math.max(0, Math.min(video.durationSeconds, currentTime + delta));
    if (playerRef.current && typeof playerRef.current.seekTo === 'function' && !embedRestricted) {
      try {
        playerRef.current.seekTo(nextTime, true);
      } catch (e) {
        onTimeUpdate(nextTime);
      }
    } else {
      onTimeUpdate(nextTime);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function' && !embedRestricted) {
      try {
        playerRef.current.seekTo(newTime, true);
      } catch (e) {
        onTimeUpdate(newTime);
      }
    } else {
      onTimeUpdate(newTime);
    }
  };

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#FFD166]/40">
      {/* Video Frame Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        <div ref={containerRef} className="w-full h-full">
          <div id={`yt-player-${video.id}`} className="w-full h-full" />
        </div>

        {/* Restricted Embedding Notice */}
        {embedRestricted && (
          <div className="absolute inset-0 bg-[#580824]/95 text-white p-6 flex flex-col items-center justify-center text-center z-20 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#D62839] flex items-center justify-center text-[#FFD166] mb-3 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
              Reproducción incrustada restringida
            </h4>
            <p className="text-xs text-[#FFD166] font-semibold mb-2">
              Ներկառուցված նվագարկումը սահմանափակված է
            </p>
            <p className="text-xs text-gray-200 max-w-md mb-2 leading-relaxed">
              {errorMessage?.es || 'Este vídeo de YouTube tiene restringida la reproducción dentro de otras aplicaciones.'}
            </p>
            <p className="text-xs text-gray-300 max-w-md mb-4 leading-relaxed font-sans">
              {errorMessage?.hy || 'Այս տեսանյութը կարող եք դիտել անմիջապես YouTube-ում և միաժամանակ օգտվել մեր ինտերակտիվ ենթագրերից ու վիկտորինայից։'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D62839] hover:bg-[#b51e2d] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition flex items-center gap-2 border border-[#FFD166]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir en YouTube — Բացել YouTube-ում</span>
              </a>
              <button
                onClick={() => setIsManualMode(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition"
              >
                Usar sincronizador manual — Մեխանիկական համաժամեցում
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Synchronized Player Control Bar */}
      <div className="bg-[#FFF8EF] p-4 sm:p-5 border-t border-[#FFD166]/50">
        <div className="flex flex-col gap-3">
          {/* Progress scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#750D32] min-w-[36px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={video.durationSeconds}
              step="0.5"
              value={Math.min(currentTime, video.durationSeconds)}
              onChange={handleSliderChange}
              className="flex-1 h-2 bg-[#FFD166] rounded-lg appearance-none cursor-pointer accent-[#D62839]"
            />
            <span className="text-xs font-mono font-medium text-gray-500 min-w-[36px]">
              {video.durationFormatted}
            </span>
          </div>

          {/* Action buttons & external link */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSeekDelta(-5)}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200 transition"
                title="-5 segundos"
              >
                <Rewind className="w-4 h-4 text-[#750D32]" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="px-4 py-2 rounded-xl bg-[#750D32] hover:bg-[#580824] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current text-[#FFD166]" />
                    <span>Pausa — Դադար</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-[#FFD166]" />
                    <span>Reproducir — Նվագարկել</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSeekDelta(5)}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200 transition"
                title="+5 segundos"
              >
                <FastForward className="w-4 h-4 text-[#750D32]" />
              </button>

              <button
                onClick={() => {
                  if (playerRef.current && typeof playerRef.current.seekTo === 'function' && !embedRestricted) {
                    playerRef.current.seekTo(0, true);
                  }
                  onTimeUpdate(0);
                }}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200 transition"
                title="Reiniciar desde el inicio — Սկսել սկզբից"
              >
                <RotateCcw className="w-4 h-4 text-[#750D32]" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D62839] hover:text-[#750D32] transition"
              >
                <span>Ver en YouTube</span>
                <span className="text-[10px] text-gray-500">(YouTube-ում)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
