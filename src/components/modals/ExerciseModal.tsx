'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Exercise } from '@/types/models';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export default function ExerciseModal({ isOpen, onClose, exercise }: ExerciseModalProps) {
  if (!exercise) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  {exercise.name}
                </Dialog.Title>
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Series</p>
                      <p className="font-semibold">{exercise.sets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Repeticiones</p>
                      <p className="font-semibold">{exercise.reps}</p>
                    </div>
                    {exercise.weight && exercise.weight > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Peso</p>
                        <p className="font-semibold">{exercise.weight} kg</p>
                      </div>
                    )}
                  </div>

                  {exercise.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notas</p>
                      <p className="whitespace-pre-wrap">{exercise.notes}</p>
                    </div>
                  )}

                  {exercise.videoUrl && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Video</p>
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 block truncate"
                      >
                        {exercise.videoUrl}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-blue-900 px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 