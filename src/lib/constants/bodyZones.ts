export const bodyZones = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Piernas',
  'Abdominales',
  'Glúteos',
  'Core',
  'Cardio',
  'Full Body'
] as const;

export type BodyZone = typeof bodyZones[number]; 