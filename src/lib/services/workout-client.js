/**
 * Cliente para el servicio de workout
 * Este archivo contiene funciones para interactuar con la API de workout
 */

/**
 * Obtiene todos los workouts
 * @returns {Promise<Array>} - Lista de workouts
 */
export async function fetchWorkouts() {
  const response = await fetch('/api/workout')
  
  if (!response.ok) {
    throw new Error(`Error fetching workouts: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Obtiene un workout por su ID
 * @param {string} id - ID del workout
 * @returns {Promise<Object>} - Workout
 */
export async function fetchWorkoutById(id) {
  const response = await fetch(`/api/workout/${id}`)
  
  if (!response.ok) {
    throw new Error(`Error fetching workout: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Crea un nuevo workout
 * @param {Object} workout - Datos del workout
 * @returns {Promise<Object>} - Workout creado
 */
export async function createWorkout(workout) {
  const response = await fetch('/api/workout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workout)
  })
  
  if (!response.ok) {
    throw new Error(`Error creating workout: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Actualiza un workout existente
 * @param {string} id - ID del workout
 * @param {Object} workout - Datos actualizados del workout
 * @returns {Promise<Object>} - Workout actualizado
 */
export async function updateWorkout(id, workout) {
  const response = await fetch(`/api/workout/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workout)
  })
  
  if (!response.ok) {
    throw new Error(`Error updating workout: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Elimina un workout
 * @param {string} id - ID del workout
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function deleteWorkout(id) {
  const response = await fetch(`/api/workout/${id}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error(`Error deleting workout: ${response.statusText}`)
  }
  
  return response.status === 204
} 