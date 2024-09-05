"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            // Limit to show a maximum of 5 dots
            if (index < 5) {
              return `<span class="${className} mt-24"></span>`;
            }
            return '';
          },
        }}
      >
        {exercises.map((exercise, index) => (
          <SwiperSlide key={index}>
            <div className="p-4 bg-white rounded-lg shadow-lg flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-6 text-black dark:text-black">
                {exercise.nombre_es} / {exercise.nombre_en}
              </h2>

              {exercise.foto && exercise.foto !== 'link_foto' ? (
  <div className="relative w-full h-auto mb-4 flex items-center justify-center">
    <Image
      src={exercise.foto}
      alt={`Imagen de ${exercise.nombre_es}`}
      width={300}
      height={300}
      objectFit="cover"
      className="rounded-md"
    />
  </div>
) : (
  <div className="relative w-[300px] h-[300px] bg-gray-200 animate-pulse flex items-center justify-center rounded-md mb-4">
    <span className="text-gray-500">Cargando imagen...</span>
  </div>
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


              <p className="my-4 text-gray-600">Notas: {exercise.comentarios}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}