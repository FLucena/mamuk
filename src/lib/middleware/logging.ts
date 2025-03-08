export function idValidationLogger(context: string) {
  return function (id: string) {
    if (!validateMongoId(id)) {
      console.error(`[ID VALIDATION ERROR] Contexto: ${context}`, {
        id,
        type: typeof id,
        length: id?.length
      });
    }
  };
}

// Uso en los servicios:
const logWorkoutIds = idValidationLogger('workout-service'); 