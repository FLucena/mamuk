"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ExerciseCarousel() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const itemsPerPage = 8; // Items per page

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
      <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
        <div className="container mx-auto p-4 flex items-center justify-center h-screen">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ejercicios</h1>
          <div className="loader">Cargando...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
        <div className="container mx-auto p-4 flex flex-col items-center justify-center h-screen">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ejercicios</h1>
          <p className="text-red-500">Hubo un problema al cargar los datos.</p>
        </div>
      </main>
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

  // Function to determine if an image should have priority based on its index
  function shouldHavePriority(index) {
    // Only the first 4 images (visible above the fold) should have priority
    return index < 4;
  }

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Biblioteca de Ejercicios</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {currentItems.map((exercise, index) => (
            <div
              key={exercise._id || index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform hover:scale-105"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {exercise.nombre_es} / {exercise.nombre_en}
              </h2>

              {exercise.foto && exercise.foto !== 'link_foto' ? (
                <div className="relative w-full h-auto mb-4 flex items-center justify-center">
                  <Image
                    src={exercise.foto}
                    alt={`Imagen de ${exercise.nombre_es}`}
                    width={300}
                    height={300}
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                    {...(shouldHavePriority(index) ? { priority: true } : {})}
                  />
                </div>
              ) : (
                <span className="text-gray-500">Cargando imagen...</span>
              )}

              {exercise.video && exercise.video !== 'link_video' ? (
                <div className="relative mb-4 w-[300px]" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={exercise.video}
                    title={`Video de ${exercise.nombre_es}`}
                    allow="autoplay"
                    allowFullScreen
                    style={{ borderRadius: '8px' }}
                  />
                </div>
              ) : (
                <div className="relative w-[300px] h-[500px]" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-200 animate-pulse flex items-center justify-center rounded-md">
                    <span className="text-gray-500">Cargando video...</span>
                  </div>
                </div>
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

        <Image
          src="/images/workout-banner.jpg"
          alt="Ejercicios personalizados"
          width={1200}
          height={400}
          className="w-full h-64 object-cover rounded-lg mb-8"
          {...{ priority: true }}
        />
      </div>
    </main>
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
        style={{ objectFit: 'cover' }}
        className="rounded-md"
        onLoadingComplete={() => setLoading(false)}
        priority={false}
        quality={75}
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