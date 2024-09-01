"use client"; 

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';

export default function ExerciseCarousel() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetch('/api/')
      .then(response => response.json())
      .then(data => setExercises(data))
      .catch(error => console.error('Error fetching exercises:', error));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
      >
        {exercises.map((exercise, index) => (
          <SwiperSlide key={index}>
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-2">{exercise.nombre_es} / {exercise.nombre_en}</h2>

              {/* Imagen del ejercicio */}
              <img
                src={exercise.foto} 
                alt={`Imagen de ${exercise.nombre_es}`}
                className="w-full h-64 object-cover rounded-md mb-4"
              />

              {/* Video del ejercicio */}
              <video className="w-full rounded-md mb-4" controls>
                <source src={exercise.video} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>

              

              {/* Comentarios */}
              <p className="mt-4 text-gray-600">{exercise.comentarios}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}