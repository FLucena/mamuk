"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ExerciseCarousel() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const itemsPerPage = 5; // Items per page

  useEffect(() => {
    fetch('/api/')
      .then((response) => response.json())
      .then((data) => {
        setExercises(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching exercises:', error);
        setError('Error fetching exercises');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-screen">
        <div className="loader">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-screen">
        <p className="text-red-500">Hubo un problema al cargar los datos.</p>
      </div>
    );
  }

  // Pagination logic
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = exercises.slice(firstItemIndex, lastItemIndex);

  // Total number of pages
  const totalPages = Math.ceil(exercises.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((exercise, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {exercise.nombre_es} / {exercise.nombre_en}
            </h2>

            {exercise.foto && exercise.foto !== "link_foto" ? (
              <ImageLoader src={exercise.foto} alt={`Imagen de ${exercise.nombre_es}`} />
            ) : (
              <Placeholder type="image" />
            )}

            {exercise.video && exercise.video !== 'link_video' ? (
              <VideoLoader src={exercise.video} title={`Video de ${exercise.nombre_es}`} />
            ) : (
              <Placeholder type="video" />
            )}

            <p className="mt-4 text-gray-600">Notas: {exercise.comentarios}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          className={`px-4 py-2 mx-2 bg-blue-500 text-white rounded-md ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        <button
          className={`px-4 py-2 mx-2 bg-blue-500 text-white rounded-md ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

      {/* Page Indicator */}
      <div className="text-center mt-4 text-gray-600">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  );
}

function ImageLoader({ src, alt }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full h-auto mb-4 flex items-center justify-center">
      {loading && <Placeholder type="image" />}
      <Image
        src={src}
        alt={alt}
        width={300}
        height={300}
        objectFit="cover"
        className="rounded-md"
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  );
}

function VideoLoader({ src, title }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative mb-4">
      {loading && <Placeholder type="video" />}
      <iframe
        className="inset-0"
        allow="autoplay"
        src={src}
        title={title}
        allowFullScreen
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}

function Placeholder({ type }) {
  return (
    <div className={`w-full h-${type === 'image' ? '64' : '48'} bg-gray-200 animate-pulse rounded-md`} />
  );
}