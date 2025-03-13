import { Exercise } from '@/types/models';

interface ExerciseListItem extends Omit<Exercise, 'sets' | 'reps' | 'weight'> {
  type: string;
}

export const exerciseList: ExerciseListItem[] = [
  // Pecho
  {
    id: 'press-plano',
    name: 'Press de Banca Plano',
    type: 'Pecho',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    notes: 'Mantén los hombros hacia atrás y abajo, y los codos a 45 grados del cuerpo. Controla el movimiento tanto en la bajada como en la subida.'
  },
  {
    id: 'press-inclinado',
    name: 'Press de Banca Inclinado',
    type: 'Pecho',
    videoUrl: 'https://www.youtube.com/embed/SrqOu55lrYU',
    notes: 'El banco debe estar inclinado entre 30-45 grados. Mantén la misma técnica que en el press plano.'
  },
  {
    id: 'aperturas',
    name: 'Aperturas con Mancuernas',
    type: 'Pecho',
    videoUrl: 'https://www.youtube.com/embed/eozdVDA78K0',
    notes: 'Mantén un ligero doblez en los codos durante todo el movimiento. Siente el estiramiento en el pecho en la posición más baja.'
  },
  
  // Espalda
  {
    id: 'dominadas',
    name: 'Dominadas',
    type: 'Espalda',
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    notes: 'Comienza con un agarre ligeramente más ancho que los hombros. Mantén el core activado y las piernas rectas o ligeramente cruzadas.'
  },
  {
    id: 'remo-barra',
    name: 'Remo con Barra',
    type: 'Espalda',
    videoUrl: 'https://www.youtube.com/embed/G8l_8chR5BE',
    notes: 'Mantén la espalda recta y el core activado. Tira la barra hacia el abdomen inferior y aprieta los omóplatos al final del movimiento.'
  },
  
  // Piernas
  {
    id: 'sentadillas',
    name: 'Sentadillas',
    type: 'Piernas',
    videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
    notes: 'Mantén el pecho arriba y la espalda recta. Las rodillas deben seguir la dirección de los pies. Baja hasta que los muslos estén paralelos al suelo.'
  },
  {
    id: 'peso-muerto',
    name: 'Peso Muerto',
    type: 'Piernas',
    videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
    notes: 'Mantén la barra cerca del cuerpo durante todo el movimiento. La espalda debe permanecer recta y el core activado.'
  },
  
  // Hombros
  {
    id: 'press-militar',
    name: 'Press Militar',
    type: 'Hombros',
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI',
    notes: 'Mantén el core activado y evita arquear la espalda. Los codos deben estar ligeramente por delante de la barra en la posición más baja.'
  },
  {
    id: 'elevaciones-laterales',
    name: 'Elevaciones Laterales',
    type: 'Hombros',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
    notes: 'Mantén un ligero doblez en los codos. Levanta los brazos hasta que estén paralelos al suelo.'
  },
  
  // Brazos
  {
    id: 'curl-biceps',
    name: 'Curl de Bíceps',
    type: 'Brazos',
    videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
    notes: 'Mantén los codos pegados al cuerpo. Controla el movimiento tanto en la subida como en la bajada.'
  },
  {
    id: 'extension-triceps',
    name: 'Extensión de Tríceps',
    type: 'Brazos',
    videoUrl: 'https://www.youtube.com/embed/nRiJVZDpdL0',
    notes: 'Mantén los codos apuntando hacia arriba y cerca de la cabeza. Extiende completamente los brazos en la parte superior del movimiento.'
  },
  
  // Core
  {
    id: 'plancha',
    name: 'Plancha',
    type: 'Core',
    videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c',
    notes: 'Mantén el cuerpo en línea recta desde la cabeza hasta los talones. Activa el core y los glúteos durante todo el ejercicio.'
  },
  {
    id: 'crunch',
    name: 'Crunch Abdominal',
    type: 'Core',
    videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
    notes: 'Mantén la zona lumbar pegada al suelo. Concentra el movimiento en los abdominales superiores.'
  }
]; 