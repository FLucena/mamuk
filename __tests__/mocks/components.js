import React from 'react';

// For async components like HomePage, we need to create a wrapper
export const AsyncComponentWrapper = ({ children }) => {
  return <div data-testid="async-wrapper">{children}</div>;
};

// Mock for HomePage since it's async
export const MockHomePage = () => {
  return (
    <AsyncComponentWrapper>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Mamuk Training Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
            <h1 className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">
              Mamuk Training
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Tu compañero de entrenamiento personal
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Mock SignInButtons */}
            <button>Sign In</button>
          </div>
        </div>
      </main>
    </AsyncComponentWrapper>
  );
};

// Mock for WorkoutPage
export const MockWorkoutPage = () => {
  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Mis Entrenamientos
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Gestiona tus rutinas de entrenamiento personalizadas
          </p>
        </div>
        
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Workout cards would go here */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Entrenamiento 1</h2>
              <p className="text-gray-600 dark:text-gray-400">Descripción del entrenamiento</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Mock for CoachDashboardPage
export const MockCoachDashboardPage = () => {
  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard de Entrenador
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Gestiona tus clientes y sus entrenamientos
          </p>
        </div>
        
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Client cards would go here */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cliente 1</h2>
              <p className="text-gray-600 dark:text-gray-400">Información del cliente</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Mock for ExerciseDetailPage
export const MockExerciseDetailPage = () => (
  <main>
    <h1>Push-up Exercise</h1>
    <img src="/images/pushup.jpg" alt="Push-up demonstration" />
    <p>The push-up is a classic bodyweight exercise that targets the chest, shoulders, and triceps.</p>
    <p>It's an excellent compound movement for building upper body strength.</p>
    <button>Add to Workout</button>
  </main>
);

// Mock for AccessiblePage
export const MockAccessiblePage = () => (
  <main>
    <a href="#main">Skip to content</a>
    <h1>Accessible Content</h1>
    <img src="/images/workout.jpg" alt="Person working out" />
    <button aria-label="Close modal">X</button>
  </main>
); 