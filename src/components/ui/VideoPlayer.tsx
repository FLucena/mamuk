import { useEffect, useState, useRef } from 'react';
import { Youtube, Video } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  onError?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  className = '',
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  aspectRatio = '16:9',
  onError
}: VideoPlayerProps) {
  const [videoInfo, setVideoInfo] = useState<{
    platform: 'youtube' | 'vimeo' | 'direct' | 'unknown';
    embedUrl: string | null;
    error: boolean;
    errorMessage: string;
  }>({
    platform: 'unknown',
    embedUrl: null,
    error: false,
    errorMessage: ''
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calcular el padding-bottom basado en la relación de aspecto
  const aspectRatioPadding = {
    '16:9': '56.25%',
    '4:3': '75%',
    '1:1': '100%'
  }[aspectRatio];

  useEffect(() => {
    if (!videoUrl) {
      setVideoInfo({
        platform: 'unknown',
        embedUrl: null,
        error: false,
        errorMessage: ''
      });
      return;
    }

    try {
      // Procesar información del video
      if (videoUrl.includes('youtube.com/watch')) {
        // YouTube: https://www.youtube.com/watch?v=VIDEO_ID
        const videoId = new URL(videoUrl).searchParams.get('v');
        if (videoId) {
          setVideoInfo({
            platform: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? '1' : '0'}&controls=${controls ? '1' : '0'}&loop=${loop ? '1' : '0'}&mute=${muted ? '1' : '0'}`,
            error: false,
            errorMessage: ''
          });
          return;
        }
      } else if (videoUrl.includes('youtube.com/embed/')) {
        // Ya es una URL de embed de YouTube
        const url = new URL(videoUrl);
        url.searchParams.set('autoplay', autoPlay ? '1' : '0');
        url.searchParams.set('controls', controls ? '1' : '0');
        url.searchParams.set('loop', loop ? '1' : '0');
        url.searchParams.set('mute', muted ? '1' : '0');
        
        setVideoInfo({
          platform: 'youtube',
          embedUrl: url.toString(),
          error: false,
          errorMessage: ''
        });
        return;
      } else if (videoUrl.includes('youtu.be/')) {
        // YouTube formato corto: https://youtu.be/VIDEO_ID
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          setVideoInfo({
            platform: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? '1' : '0'}&controls=${controls ? '1' : '0'}&loop=${loop ? '1' : '0'}&mute=${muted ? '1' : '0'}`,
            error: false,
            errorMessage: ''
          });
          return;
        }
      } else if (videoUrl.includes('vimeo.com/')) {
        // Vimeo: https://vimeo.com/VIDEO_ID
        if (videoUrl.includes('player.vimeo.com/video/')) {
          // Ya es una URL de embed de Vimeo
          const url = new URL(videoUrl);
          url.searchParams.set('autoplay', autoPlay ? '1' : '0');
          url.searchParams.set('loop', loop ? '1' : '0');
          url.searchParams.set('muted', muted ? '1' : '0');
          
          setVideoInfo({
            platform: 'vimeo',
            embedUrl: url.toString(),
            error: false,
            errorMessage: ''
          });
        } else {
          const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
          if (videoId) {
            setVideoInfo({
              platform: 'vimeo',
              embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? '1' : '0'}&loop=${loop ? '1' : '0'}&muted=${muted ? '1' : '0'}`,
              error: false,
              errorMessage: ''
            });
          }
        }
        return;
      } else if (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg')) {
        // Video directo (MP4, WebM, Ogg)
        setVideoInfo({
          platform: 'direct',
          embedUrl: videoUrl,
          error: false,
          errorMessage: ''
        });
        return;
      }
      
      // Si es una URL desconocida, intentamos tratarla como un embed directo
      setVideoInfo({
        platform: 'unknown',
        embedUrl: videoUrl,
        error: false,
        errorMessage: ''
      });
    } catch (e) {
      // Error al procesar la URL
      setVideoInfo({
        platform: 'unknown',
        embedUrl: null,
        error: true,
        errorMessage: e instanceof Error ? e.message : 'Error desconocido'
      });
      if (onError) onError();
    }
  }, [videoUrl, autoPlay, controls, loop, muted, onError]);

  // Manejar errores de iframe
  useEffect(() => {
    const handleIframeError = () => {
      setVideoInfo(prev => ({
        ...prev,
        error: true,
        errorMessage: 'Error al cargar el iframe. Puede ser debido a la política de seguridad de contenido.'
      }));
      if (onError) onError();
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('error', handleIframeError);
      return () => {
        iframe.removeEventListener('error', handleIframeError);
      };
    }
  }, [onError]);

  if (!videoUrl || videoInfo.error) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`} style={{ paddingBottom: aspectRatioPadding }}>
        <div className="text-center p-4">
          <Video size={48} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            {videoInfo.error ? 'Error al cargar el video' : 'No hay video disponible'}
          </p>
          {videoInfo.error && videoInfo.errorMessage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {videoInfo.errorMessage}
            </p>
          )}
          {videoInfo.error && videoUrl && (
            <a 
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Ver video en sitio externo
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ paddingBottom: aspectRatioPadding }}>
      {videoInfo.embedUrl ? (
        <>
          {videoInfo.platform === 'youtube' || videoInfo.platform === 'vimeo' ? (
            <iframe
              ref={iframeRef}
              src={videoInfo.embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
              onError={() => {
                setVideoInfo(prev => ({ ...prev, error: true, errorMessage: 'Error al cargar el iframe' }));
                if (onError) onError();
              }}
              loading="lazy"
            ></iframe>
          ) : videoInfo.platform === 'direct' ? (
            <video
              ref={videoRef}
              src={videoInfo.embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              controls={controls}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              playsInline
              onError={() => {
                setVideoInfo(prev => ({ ...prev, error: true, errorMessage: 'Error al cargar el video' }));
                if (onError) onError();
              }}
            >
              Tu navegador no soporta la reproducción de videos.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <div className="text-center p-4">
                <Video size={48} className="mx-auto mb-2 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-700 dark:text-gray-300">
                  No se puede reproducir este formato de video directamente.
                </p>
                <a 
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Abrir en sitio externo
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <div className="text-center p-4">
            <Video size={48} className="mx-auto mb-2 text-gray-500 dark:text-gray-400" />
            <p className="text-gray-700 dark:text-gray-300">
              No se pudo cargar el video
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 