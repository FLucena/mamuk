"use client"

import { useState } from 'react';

interface ExerciseProps {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export function Exercise({ name: initialName, sets: initialSets, reps: initialReps, weight: initialWeight }: ExerciseProps) {
  const [name, setName] = useState(initialName);
  const [sets, setSets] = useState(initialSets);
  const [reps, setReps] = useState(initialReps);
  const [weight, setWeight] = useState(initialWeight);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-medium bg-gray-800 rounded px-3 py-1 text-white"
          />
        ) : (
          <h4 className="text-lg font-medium">{name}</h4>
        )}
        <button 
          className="text-sm text-gray-400 hover:text-white"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Sets</label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Reps</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            min={0}
          />
        </div>
      </div>
    </div>
  );
} 