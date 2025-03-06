import { useEffect, useRef, useState } from 'react';
import { IoClose, IoLogoYoutube, IoLogoVimeo, IoVideocam } from 'react-icons/io5';
import Image from 'next/image';

interface ExerciseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  notes?: string;
}

export default function ExerciseVideoModal({ isOpen, onClose, videoUrl, notes }: ExerciseVideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [videoInfo, setVideoInfo] = useState<{
    platform: 'youtube' | 'vimeo' | 'unknown';
    videoId: string | null;
    thumbnailUrl: string | null;
    directUrl: string | null;
  }>({
    platform: 'unknown',
    videoId: null,
    thumbnailUrl: null,
    directUrl: null
  });

  useEffect(() => {
    if (videoUrl) {
      try {
        // Procesar información del video
        if (videoUrl.includes('youtube.com/watch')) {
          // YouTube: https://www.youtube.com/watch?v=VIDEO_ID
          const videoId = new URL(videoUrl).searchParams.get('v');
          if (videoId) {
            setVideoInfo({
              platform: 'youtube',
              videoId,
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              directUrl: `https://www.youtube.com/watch?v=${videoId}`
            });
            return;
          }
        } else if (videoUrl.includes('youtu.be/')) {
          // YouTube formato corto: https://youtu.be/VIDEO_ID
          const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
          if (videoId) {
            setVideoInfo({
              platform: 'youtube',
              videoId,
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              directUrl: `https://www.youtube.com/watch?v=${videoId}`
            });
            return;
          }
        } else if (videoUrl.includes('vimeo.com/')) {
          // Para Vimeo no podemos obtener la miniatura fácilmente desde el cliente
          // Se necesitaría la API de Vimeo para eso
          const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
          if (videoId) {
            setVideoInfo({
              platform: 'vimeo',
              videoId,
              thumbnailUrl: null, // No podemos obtener fácilmente la miniatura
              directUrl: `https://vimeo.com/${videoId}`
            });
            return;
          }
        }
        
        // Si es una URL desconocida
        setVideoInfo({
          platform: 'unknown',
          videoId: null,
          thumbnailUrl: null,
          directUrl: videoUrl
        });
      } catch (e) {
        // Error al procesar la URL
        setVideoInfo({
          platform: 'unknown',
          videoId: null,
          thumbnailUrl: null,
          directUrl: null
        });
      }
    } else {
      setVideoInfo({
        platform: 'unknown',
        videoId: null,
        thumbnailUrl: null,
        directUrl: null
      });
    }
  }, [videoUrl]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Video del ejercicio</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        {videoInfo.directUrl ? (
          <div className="mb-4">
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              {videoInfo.thumbnailUrl ? (
                <div className="relative w-full pb-[56.25%]">
                  <div className="absolute inset-0">
                    <div className="w-full h-full relative">
                      <Image 
                        src={videoInfo.thumbnailUrl} 
                        alt="Miniatura del video" 
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized // Para evitar problemas con dominios de imágenes externos
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="text-white text-center p-4">
                        <div className="flex justify-center mb-3">
                          {videoInfo.platform === 'youtube' && <IoLogoYoutube size={48} className="text-red-600 bg-white rounded-full p-2" />}
                          {videoInfo.platform === 'vimeo' && <IoLogoVimeo size={48} className="text-blue-500 bg-white rounded-full p-2" />}
                          {videoInfo.platform === 'unknown' && <IoVideocam size={48} className="text-gray-200 bg-white rounded-full p-2" />}
                        </div>
                        <p className="font-medium">Haz clic para ver el video</p>
                        <p className="text-sm opacity-80 mt-1">Se abrirá en una nueva pestaña</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-10">
                  {videoInfo.platform === 'youtube' && <IoLogoYoutube size={64} className="text-red-600" />}
                  {videoInfo.platform === 'vimeo' && <IoLogoVimeo size={64} className="text-blue-500" />}
                  {videoInfo.platform === 'unknown' && <IoVideocam size={64} className="text-gray-400 dark:text-gray-300" />}
                </div>
              )}
            </div>
            
            <a 
              href={videoInfo.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Ver video en {videoInfo.platform === 'youtube' ? 'YouTube' : videoInfo.platform === 'vimeo' ? 'Vimeo' : 'sitio externo'}
            </a>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-4 text-center">
            No hay video disponible
          </div>
        )}

        {notes && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Notas:</h4>
            <p className="text-gray-600 dark:text-gray-300">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
} 