"use client";

import { Navigation, Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ExerciseCarousel() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/')
      .then(response => response.json())
      .then(data => {
        setExercises(data);
        setLoading(false);
      })
      .catch(error => {
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

  return (
    <div className="container mx-auto p-4">
      
        {exercises.map((exercise, index) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-black dark:text-black">{exercise.nombre_es} / {exercise.nombre_en}</h2>

              {exercise.foto && exercise.foto !== "link_foto" ? (
                <div className="relative w-full max-w-md h-64 mb-4 flex items-center justify-center">
                  <Image
                    src={exercise.foto} 
                    alt={`Imagen de ${exercise.nombre_es}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              ) : (
                <p className="text-gray-500 mb-4">No hay imagen disponible</p>
              )}

              {exercise.video && exercise.video !== "link_video" ? ( 
                <video className="w-full rounded-md mb-4" controls>
                  <source src={exercise.video} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : (
                <p className="text-gray-500 mb-4">No hay video disponible</p>
              )}


              <p className="mt-4 text-gray-600">Notas: {exercise.comentarios}</p>
            </div>
        ))}
    </div>
  );
}