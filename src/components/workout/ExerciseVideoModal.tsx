import { useEffect, useRef, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import VideoPlayer from '../ui/VideoPlayer';

interface ExerciseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  notes?: string;
}

export default function ExerciseVideoModal({ isOpen, onClose, videoUrl, notes }: ExerciseVideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [videoError, setVideoError] = useState(false);

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

  // Resetear el estado de error cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setVideoError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 max-w-3xl w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Video del ejercicio</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          {videoError && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-yellow-500 dark:text-yellow-400 w-5 h-5 mr-2" />
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  No se pudo cargar el video. Esto puede deberse a la política de seguridad del navegador o a que el video no está disponible.
                </p>
              </div>
              {videoUrl && (
                <div className="mt-2">
                  <a 
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                  >
                    Abrir video en una nueva pestaña
                  </a>
                </div>
              )}
            </div>
          )}
          
          <VideoPlayer 
            videoUrl={videoUrl} 
            autoPlay={true}
            controls={true}
            aspectRatio="16:9"
            onError={() => setVideoError(true)}
          />
        </div>

        {notes && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Notas:</h4>
            <p className="text-gray-700 dark:text-gray-300">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
} 