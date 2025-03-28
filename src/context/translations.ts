export interface Translations {
  [key: string]: {
    [key: string]: string | {
      [key: string]: string;
    };
  };
}

// Our translations
export const translations: Translations = {
  en: {
    // App title
    'app_title': 'Mamuk Fitness',
    
    // Navigation
    'nav_dashboard': 'Dashboard',
    'nav_workouts': 'Workouts',
    'nav_exercises': 'Exercise Library',
    'nav_achievements': 'Achievements',
    'nav_users': 'Users',
    
    // User Menu
    'open_user_menu': 'Open user menu',
    'open_main_menu': 'Open main menu',
    'your_profile': 'Your Profile',
    'settings': 'Settings',
    'sign_out': 'Sign out',
    'switch_light_mode': 'Switch to Light Mode',
    'switch_dark_mode': 'Switch to Dark Mode',

    // Generic UI
    'welcome_back': 'Welcome back',
    'fitness_enthusiast': 'Fitness Enthusiast',
    'journey_overview': "Here's an overview of your fitness journey",
    'start_new_workout': 'Start New Workout',
    'view_all': 'View all',
    
    // Stats Cards
    'total_workouts': 'Total Workouts',
    'view_all_workouts': 'View all workouts',
    'current_streak': 'Current Streak',
    'day': 'day',
    'days': 'days',
    'keep_it_up': 'Keep it up!',
    'calories_burned': 'Calories Burned',
    'this_week': 'this week',
    'workouts_completed': 'Workouts Completed',
    'completion_rate': 'Completion Rate',
    
    // Sections
    'recent_workouts': 'Recent Workouts',
    'no_recent_workouts': 'No recent workouts found',
    'get_started': "Let's get started",
    'create_workout': 'Create a workout',
    'weekly_progress': 'Weekly Progress',
    'completed_count': 'workouts completed',
    'target': 'target',
    'of_weekly_goal': 'of weekly goal',
    'achievements': 'Achievements',
    'view_all_achievements': 'View all achievements',
    'recently_earned': 'Recently Earned',
    
    // Workout Status
    'status_active': 'Active',
    'status_completed': 'Completed',
    
    // Exercise-related
    'exercises': 'exercises',
    'day_singular': 'day',
    'day_plural': 'days',
    
    // Achievements page
    'track_your_fitness_milestones': 'Track your fitness milestones and accomplishments',
    'achieved_on': 'Achieved on',
    
    // Workouts page
    'new_workout': 'New Workout',
    'no_workouts_found': 'No workouts found. Create your first workout!',
    'block_singular': 'block',
    'block_plural': 'blocks',
    'exercise_singular': 'exercise',
    'updated': 'Updated',
    
    // Exercise Library page
    'add_custom_exercise': 'Add Custom Exercise',
    'search_exercises': 'Search exercises...',
    'filters': 'Filters',
    'category': 'Category',
    'all': 'All',
    'muscle_group': 'Muscle Group',
    'muscle_groups': 'Muscle Groups',
    'no_exercises_found': 'No exercises found with the current filters.',
    'clear_filters': 'Clear Filters',
    'custom': 'Custom',
    'no_description': 'No description available.',
    'more': 'more',
    'view_details': 'View Details',
    'close': 'Close',
    'description': 'Description',
    'instructions': 'Instructions',
    'default_sets': 'Default Sets',
    'default_reps': 'Default Reps',
    'default_weight': 'Default Weight',
    'use_in_workout': 'Use in Workout',
    'exercise_name': 'Exercise Name',
    'exercise_name_placeholder': 'e.g., Cable Tricep Extension',
    'default_weight_kg': 'Default Weight (kg)',
    'leave_blank_bodyweight': 'Leave blank for bodyweight',
    'description_placeholder': 'Brief description of the exercise',
    'instructions_placeholder': 'Step-by-step instructions on how to perform the exercise',
    'cancel': 'Cancel',
    'add_exercise': 'Add Exercise',
    'exercise_name_required': 'Exercise name is required',
    'select_muscle_group': 'Please select at least one muscle group',
    
    // Exercise categories
    'strength': 'Strength',
    'cardio': 'Cardio',
    'flexibility': 'Flexibility',
    'balance': 'Balance',
    'other': 'Other',
    
    // Muscle groups
    'chest': 'Chest',
    'back': 'Back',
    'shoulders': 'Shoulders',
    'biceps': 'Biceps',
    'triceps': 'Triceps',
    'quadriceps': 'Quadriceps',
    'hamstrings': 'Hamstrings',
    'glutes': 'Glutes',
    'calves': 'Calves',
    'core': 'Core',
    'lower back': 'Lower Back',
    'heart': 'Heart',
    'hip flexors': 'Hip Flexors',
    'ankles': 'Ankles',
    'legs': 'Legs',
    
    // Footer
    'language': 'Language',
    'english': 'English',
    'spanish': 'Spanish',
    'quick_links': 'Quick Links',
    'legal': 'Legal',
    'all_rights_reserved': 'All rights reserved.',
    
    // WorkoutForm page
    'edit_workout': 'Edit Workout',
    'workout_title': 'Workout Title',
    'workout_title_placeholder': 'e.g., Full Body Workout',
    'workout_description_placeholder': 'Describe your workout routine',
    'workout_days': 'Workout Days',
    'add_day': 'Add Day',
    'no_workout_days': 'No workout days added yet. Click "Add Day" to get started.',
    'day_name_placeholder': 'Day Name',
    'collapse_day': 'Collapse day',
    'expand_day': 'Expand day',
    'remove_day': 'Remove day',
    'workout_blocks': 'Workout Blocks',
    'add_block': 'Add Block',
    'no_blocks': 'No blocks added to this day yet.',
    'block_name_placeholder': 'Block Name',
    'randomize_exercises': 'Randomize exercises',
    'collapse_block': 'Collapse block',
    'expand_block': 'Expand block',
    'remove_block': 'Remove block',
    'exercise_library': 'Exercise Library',
    'browse_library': 'Browse Library',
    'no_exercises': 'No exercises added to this block yet.',
    'exercise': 'Exercise',
    'sets': 'Sets',
    'reps': 'Reps',
    'weight_kg_optional': 'Weight (kg, optional)',
    'notes_optional': 'Notes (optional)',
    'notes_placeholder': 'Any special instructions or form tips',
    'saving': 'Saving...',
    'save_changes': 'Save Changes',
    'workout_title_required': 'Workout title is required',
    'workout_description_required': 'Workout description is required',
    'at_least_one_day_required': 'At least one workout day is required',
    'day_name_required': 'All workout days must have a name',
    'day_must_have_block': 'Day must have at least one block',
    'block_name_required': 'All blocks must have a name',
    'block_must_have_exercise': 'Block must have at least one exercise',
    'sets_must_be_positive': 'Sets must be greater than 0',
    'reps_must_be_positive': 'Reps must be greater than 0',
    'login_required': 'You must be logged in to create or edit workouts',
    'save_workout_failed': 'Failed to save workout. Please try again.',
    
    // New translation keys
    'video_demonstration': 'Video Demonstration',
    'default_values': 'Default Values',
    'similar_exercises': 'Similar Exercises',
    'blank_workout': 'Blank Workout',
    'use_template': 'Use Template (3 days)',
    'template_description': 'A structured workout with 3 days, 4 blocks per day, and varied exercises',
    'blank_workout_description': 'Start with an empty workout and build from scratch',
    
    // Common
    'back_to_home': 'Back to Home',
    
    // Terms of Service
    'terms_of_service': 'Terms of Service',
    'terms_acceptance_title': '1. Acceptance of Terms',
    'terms_acceptance_content': 'By accessing and using Mamuk Fitness, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our service.',
    'terms_license_title': '2. Use License',
    'terms_license_content': 'Permission is granted to temporarily access Mamuk Fitness for personal, non-commercial use only. This license does not include:',
    'terms_license_items': {
      'modify': 'Modifying or copying the materials',
      'commercial': 'Using the materials for commercial purposes',
      'reverse': 'Attempting to decompile or reverse engineer any software',
      'copyright': 'Removing any copyright or proprietary notations'
    },
    'terms_responsibilities_title': '3. User Responsibilities',
    'terms_responsibilities_content': 'As a user of Mamuk Fitness, you are responsible for:',
    'terms_responsibilities_items': {
      'confidentiality': 'Maintaining the confidentiality of your account',
      'activities': 'All activities that occur under your account',
      'workout_plans': 'Ensuring your workout plans are appropriate for your fitness level',
      'healthcare': 'Consulting with healthcare professionals before starting any exercise program'
    },
    'terms_disclaimer_title': '4. Disclaimer',
    'terms_disclaimer_content': 'The materials on Mamuk Fitness are provided on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
    'terms_limitations_title': '5. Limitations',
    'terms_limitations_content': 'In no event shall Mamuk Fitness or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.',
    'terms_revisions_title': '6. Revisions and Errata',
    'terms_revisions_content': 'The materials appearing on Mamuk Fitness could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current. We may make changes to the materials contained on our website at any time without notice.',
    'terms_contact_title': '7. Contact Information',
    'terms_contact_content': 'If you have any questions about these Terms of Service, please contact us at:',
    
    // Privacy Policy
    'privacy_policy': 'Privacy Policy',
    'privacy_info_collect_title': '1. Information We Collect',
    'privacy_info_collect_content': 'We collect information that you provide directly to us when using Mamuk Fitness, including:',
    'privacy_info_collect_items': {
      'account': 'Account information (name, email, password)',
      'profile': 'Profile information (age, weight, height, fitness goals)',
      'workout': 'Workout data and progress tracking',
      'preferences': 'Exercise preferences and history'
    },
    'privacy_info_use_title': '2. How We Use Your Information',
    'privacy_info_use_content': 'We use the collected information to:',
    'privacy_info_use_items': {
      'provide': 'Provide and maintain our service',
      'personalize': 'Personalize your workout experience',
      'track': 'Track your progress and achievements',
      'updates': 'Send you important updates and notifications',
      'improve': 'Improve our services and user experience'
    },
    'privacy_security_title': '3. Data Security',
    'privacy_security_content': 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
    'privacy_sharing_title': '4. Data Sharing',
    'privacy_sharing_content': 'We do not sell or share your personal information with third parties except as described in this policy. We may share your information with:',
    'privacy_sharing_items': {
      'providers': 'Service providers who assist in our operations',
      'analytics': 'Analytics providers to improve our service',
      'law': 'Law enforcement when required by law'
    },
    'privacy_rights_title': '5. Your Rights',
    'privacy_rights_content': 'You have the right to:',
    'privacy_rights_items': {
      'access': 'Access your personal information',
      'correct': 'Correct inaccurate data',
      'delete': 'Request deletion of your data',
      'opt_out': 'Opt-out of marketing communications',
      'export': 'Export your data'
    },
    'privacy_cookies_title': '6. Cookies',
    'privacy_cookies_content': 'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
    'privacy_changes_title': '7. Changes to This Policy',
    'privacy_changes_content': 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
    'privacy_contact_title': '8. Contact Us',
    'privacy_contact_content': 'If you have any questions about this Privacy Policy, please contact us at:',
    
    // About Us
    'about_title': 'About Mamuk Fitness',
    'about_mission_title': 'Our Mission',
    'about_mission_content': 'At Mamuk Fitness, we\'re dedicated to making fitness accessible, enjoyable, and effective for everyone. Our platform combines cutting-edge technology with proven workout methodologies to help you achieve your fitness goals.',
    'about_features': {
      'community_title': 'Community Driven',
      'community_content': 'Join a supportive community of fitness enthusiasts who share your goals and motivate each other to succeed.',
      'goals_title': 'Personalized Goals',
      'goals_content': 'Set and track your fitness goals with our smart goal-setting system that adapts to your progress and preferences.',
      'health_title': 'Health First',
      'health_content': 'We prioritize your health and well-being, providing safe and effective workout plans suitable for all fitness levels.',
      'results_title': 'Proven Results',
      'results_content': 'Our platform is designed based on scientific research and real-world success stories to deliver measurable results.'
    },
    'about_story_title': 'Our Story',
    'about_story_content': 'Mamuk Fitness was founded in 2024 with a simple idea: make fitness accessible to everyone, regardless of their experience level or equipment access. What started as a small project has grown into a comprehensive fitness platform serving thousands of users worldwide.',
    'about_team_title': 'Our Team',
    'about_team_content': 'We\'re a diverse team of fitness enthusiasts, developers, and health professionals who are passionate about helping others achieve their fitness goals. Our team combines expertise in fitness, technology, and user experience to create the best possible platform for our users.',
    'about_contact_title': 'Get in Touch',
    'about_contact_content': 'Have questions or suggestions? We\'d love to hear from you! Reach out to us at:',
  },
  es: {
    // App title
    'app_title': 'Mamuk Fitness',
    
    // Navigation
    'nav_dashboard': 'Tablero',
    'nav_workouts': 'Entrenamientos',
    'nav_exercises': 'Biblioteca de Ejercicios',
    'nav_achievements': 'Logros',
    'nav_users': 'Usuarios',
    
    // User Menu
    'open_user_menu': 'Abrir menú de usuario',
    'open_main_menu': 'Abrir menú principal',
    'your_profile': 'Tu Perfil',
    'settings': 'Configuración',
    'sign_out': 'Cerrar sesión',
    'switch_light_mode': 'Cambiar a Modo Claro',
    'switch_dark_mode': 'Cambiar a Modo Oscuro',

    // Generic UI
    'welcome_back': 'Bienvenido de nuevo',
    'fitness_enthusiast': 'Entusiasta del Fitness',
    'journey_overview': 'Aquí tienes un resumen de tu viaje fitness',
    'start_new_workout': 'Iniciar Nuevo Entrenamiento',
    'view_all': 'Ver todo',
    
    // Stats Cards
    'total_workouts': 'Entrenamientos Totales',
    'view_all_workouts': 'Ver todos los entrenamientos',
    'current_streak': 'Racha Actual',
    'day': 'día',
    'days': 'días',
    'keep_it_up': '¡Sigue así!',
    'calories_burned': 'Calorías Quemadas',
    'this_week': 'esta semana',
    'workouts_completed': 'Entrenamientos Completados',
    'completion_rate': 'Tasa de Finalización',
    
    // Sections
    'recent_workouts': 'Entrenamientos Recientes',
    'no_recent_workouts': 'No se encontraron entrenamientos recientes',
    'get_started': 'Comencemos',
    'create_workout': 'Crear un entrenamiento',
    'weekly_progress': 'Progreso Semanal',
    'completed_count': 'entrenamientos completados',
    'target': 'objetivo',
    'of_weekly_goal': 'del objetivo semanal',
    'achievements': 'Logros',
    'view_all_achievements': 'Ver todos los logros',
    'recently_earned': 'Obtenidos Recientemente',
    
    // Workout Status
    'status_active': 'Activo',
    'status_completed': 'Completado',
    
    // Exercise-related
    'exercises': 'ejercicios',
    'day_singular': 'día',
    'day_plural': 'días',
    
    // Achievements page
    'track_your_fitness_milestones': 'Registra tus hitos y logros de fitness',
    'achieved_on': 'Logrado el',
    
    // Workouts page
    'new_workout': 'Nuevo Entrenamiento',
    'no_workouts_found': '¡No hay entrenamientos! Crea tu primer entrenamiento.',
    'block_singular': 'bloque',
    'block_plural': 'bloques',
    'exercise_singular': 'ejercicio',
    'updated': 'Actualizado',
    
    // Exercise Library page
    'add_custom_exercise': 'Añadir Ejercicio Personalizado',
    'search_exercises': 'Buscar ejercicios...',
    'filters': 'Filtros',
    'category': 'Categoría',
    'all': 'Todos',
    'muscle_group': 'Grupo Muscular',
    'muscle_groups': 'Grupos Musculares',
    'no_exercises_found': 'No se encontraron ejercicios con los filtros actuales.',
    'clear_filters': 'Limpiar Filtros',
    'custom': 'Personalizado',
    'no_description': 'Sin descripción disponible.',
    'more': 'más',
    'view_details': 'Ver Detalles',
    'close': 'Cerrar',
    'description': 'Descripción',
    'instructions': 'Instrucciones',
    'default_sets': 'Series Predeterminadas',
    'default_reps': 'Repeticiones Predeterminadas',
    'default_weight': 'Peso Predeterminado',
    'use_in_workout': 'Usar en Entrenamiento',
    'exercise_name': 'Nombre del Ejercicio',
    'exercise_name_placeholder': 'ej., Extensión de Tríceps con Cable',
    'default_weight_kg': 'Peso Predeterminado (kg)',
    'leave_blank_bodyweight': 'Dejar en blanco para peso corporal',
    'description_placeholder': 'Breve descripción del ejercicio',
    'instructions_placeholder': 'Instrucciones paso a paso sobre cómo realizar el ejercicio',
    'cancel': 'Cancelar',
    'add_exercise': 'Añadir Ejercicio',
    'exercise_name_required': 'El nombre del ejercicio es obligatorio',
    'select_muscle_group': 'Selecciona al menos un grupo muscular',
    
    // Exercise categories
    'strength': 'Fuerza',
    'cardio': 'Cardio',
    'flexibility': 'Flexibilidad',
    'balance': 'Equilibrio',
    'other': 'Otro',
    
    // Muscle groups
    'chest': 'Pecho',
    'back': 'Espalda',
    'shoulders': 'Hombros',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'quadriceps': 'Cuádriceps',
    'hamstrings': 'Isquiotibiales',
    'glutes': 'Glúteos',
    'calves': 'Pantorrillas',
    'core': 'Core',
    'lower back': 'Lumbar',
    'heart': 'Corazón',
    'hip flexors': 'Flexores de Cadera',
    'ankles': 'Tobillos',
    'legs': 'Piernas',
    
    // Footer
    'language': 'Idioma',
    'english': 'Inglés',
    'spanish': 'Español',
    'quick_links': 'Enlaces Rápidos',
    'legal': 'Legal',
    'all_rights_reserved': 'Todos los derechos reservados.',
    
    // WorkoutForm page
    'edit_workout': 'Editar Entrenamiento',
    'workout_title': 'Título del Entrenamiento',
    'workout_title_placeholder': 'ej., Entrenamiento de Cuerpo Completo',
    'workout_description_placeholder': 'Describe tu rutina de entrenamiento',
    'workout_days': 'Días de Entrenamiento',
    'add_day': 'Añadir Día',
    'no_workout_days': 'No hay días de entrenamiento añadidos. Haz clic en "Añadir Día" para comenzar.',
    'day_name_placeholder': 'Nombre del Día',
    'collapse_day': 'Contraer día',
    'expand_day': 'Expandir día',
    'remove_day': 'Eliminar día',
    'workout_blocks': 'Bloques de Entrenamiento',
    'add_block': 'Añadir Bloque',
    'no_blocks': 'No hay bloques añadidos a este día todavía.',
    'block_name_placeholder': 'Nombre del Bloque',
    'randomize_exercises': 'Aleatorizar ejercicios',
    'collapse_block': 'Contraer bloque',
    'expand_block': 'Expandir bloque',
    'remove_block': 'Eliminar bloque',
    'exercise_library': 'Biblioteca',
    'browse_library': 'Explorar Biblioteca',
    'no_exercises': 'No hay ejercicios añadidos a este bloque todavía.',
    'exercise': 'Ejercicio',
    'sets': 'Series',
    'reps': 'Repeticiones',
    'weight_kg_optional': 'Peso (kg, opcional)',
    'notes_optional': 'Notas (opcional)',
    'notes_placeholder': 'Cualquier instrucción especial o consejos de forma',
    'saving': 'Guardando...',
    'save_changes': 'Guardar Cambios',
    'workout_title_required': 'El título del entrenamiento es obligatorio',
    'workout_description_required': 'La descripción del entrenamiento es obligatoria',
    'at_least_one_day_required': 'Se requiere al menos un día de entrenamiento',
    'day_name_required': 'Todos los días de entrenamiento deben tener un nombre',
    'day_must_have_block': 'El día debe tener al menos un bloque',
    'block_name_required': 'Todos los bloques deben tener un nombre',
    'block_must_have_exercise': 'El bloque debe tener al menos un ejercicio',
    'sets_must_be_positive': 'Las series deben ser mayores que 0',
    'reps_must_be_positive': 'Las repeticiones deben ser mayores que 0',
    'login_required': 'Debes iniciar sesión para crear o editar entrenamientos',
    'save_workout_failed': 'No se pudo guardar el entrenamiento. Por favor, inténtalo de nuevo.',
    
    // New translation keys
    'video_demonstration': 'Demostración en Video',
    'default_values': 'Valores Predeterminados',
    'similar_exercises': 'Ejercicios Similares',
    'blank_workout': 'Entrenamiento en Blanco',
    'use_template': 'Usar Plantilla (3 días)',
    'template_description': 'Un entrenamiento estructurado con 3 días, 4 bloques por día y ejercicios variados',
    'blank_workout_description': 'Comienza con un entrenamiento vacío y constrúyelo desde cero',
    
    // Common
    'back_to_home': 'Volver al Inicio',
    
    // Terms of Service
    'terms_of_service': 'Términos de Servicio',
    'terms_acceptance_title': '1. Aceptación de Términos',
    'terms_acceptance_content': 'Al acceder y usar Mamuk Fitness, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, por favor no uses nuestro servicio.',
    'terms_license_title': '2. Licencia de Uso',
    'terms_license_content': 'Se otorga permiso para acceder temporalmente a Mamuk Fitness solo para uso personal y no comercial. Esta licencia no incluye:',
    'terms_license_items': {
      'modify': 'Modificar o copiar los materiales',
      'commercial': 'Usar los materiales para fines comerciales',
      'reverse': 'Intentar descompilar o ingeniería inversa de cualquier software',
      'copyright': 'Eliminar cualquier notación de copyright o propiedad'
    },
    'terms_responsibilities_title': '3. Responsabilidades del Usuario',
    'terms_responsibilities_content': 'Como usuario de Mamuk Fitness, eres responsable de:',
    'terms_responsibilities_items': {
      'confidentiality': 'Mantener la confidencialidad de tu cuenta',
      'activities': 'Todas las actividades que ocurran bajo tu cuenta',
      'workout_plans': 'Asegurar que tus planes de entrenamiento sean apropiados para tu nivel de fitness',
      'healthcare': 'Consultar con profesionales de la salud antes de comenzar cualquier programa de ejercicio'
    },
    'terms_disclaimer_title': '4. Descargo de Responsabilidad',
    'terms_disclaimer_content': 'Los materiales en Mamuk Fitness se proporcionan "tal cual". No ofrecemos garantías, expresas o implícitas, y por la presente renunciamos y negamos todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.',
    'terms_limitations_title': '5. Limitaciones',
    'terms_limitations_content': 'En ningún caso Mamuk Fitness o sus proveedores serán responsables por daños (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a interrupción del negocio) que surjan del uso o la imposibilidad de usar los materiales en nuestro sitio web.',
    'terms_revisions_title': '6. Revisiones y Errores',
    'terms_revisions_content': 'Los materiales que aparecen en Mamuk Fitness podrían incluir errores técnicos, tipográficos o fotográficos. No garantizamos que ninguno de los materiales sea preciso, completo o actual. Podemos hacer cambios en los materiales contenidos en nuestro sitio web en cualquier momento sin previo aviso.',
    'terms_contact_title': '7. Información de Contacto',
    'terms_contact_content': 'Si tienes alguna pregunta sobre estos Términos de Servicio, por favor contáctanos en:',
    
    // Privacy Policy
    'privacy_policy': 'Política de Privacidad',
    'privacy_info_collect_title': '1. Información que Recopilamos',
    'privacy_info_collect_content': 'Recopilamos información que nos proporcionas directamente al usar Mamuk Fitness, incluyendo:',
    'privacy_info_collect_items': {
      'account': 'Información de cuenta (nombre, correo electrónico, contraseña)',
      'profile': 'Información de perfil (edad, peso, altura, objetivos de fitness)',
      'workout': 'Datos de entrenamiento y seguimiento de progreso',
      'preferences': 'Preferencias e historial de ejercicios'
    },
    'privacy_info_use_title': '2. Cómo Usamos tu Información',
    'privacy_info_use_content': 'Usamos la información recopilada para:',
    'privacy_info_use_items': {
      'provide': 'Proporcionar y mantener nuestro servicio',
      'personalize': 'Personalizar tu experiencia de entrenamiento',
      'track': 'Seguir tu progreso y logros',
      'updates': 'Enviarte actualizaciones y notificaciones importantes',
      'improve': 'Mejorar nuestros servicios y experiencia de usuario'
    },
    'privacy_security_title': '3. Seguridad de Datos',
    'privacy_security_content': 'Implementamos medidas de seguridad apropiadas para proteger tu información personal. Sin embargo, ningún método de transmisión por internet es 100% seguro, y no podemos garantizar la seguridad absoluta.',
    'privacy_sharing_title': '4. Compartir Datos',
    'privacy_sharing_content': 'No vendemos ni compartimos tu información personal con terceros excepto como se describe en esta política. Podemos compartir tu información con:',
    'privacy_sharing_items': {
      'providers': 'Proveedores de servicios que nos ayudan en nuestras operaciones',
      'analytics': 'Proveedores de análisis para mejorar nuestro servicio',
      'law': 'Autoridades cuando lo requiera la ley'
    },
    'privacy_rights_title': '5. Tus Derechos',
    'privacy_rights_content': 'Tienes derecho a:',
    'privacy_rights_items': {
      'access': 'Acceder a tu información personal',
      'correct': 'Corregir datos inexactos',
      'delete': 'Solicitar la eliminación de tus datos',
      'opt_out': 'Darte de baja de las comunicaciones de marketing',
      'export': 'Exportar tus datos'
    },
    'privacy_cookies_title': '6. Cookies',
    'privacy_cookies_content': 'Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro servicio y mantener cierta información. Puedes instruir a tu navegador para que rechace todas las cookies o para que indique cuando se está enviando una cookie.',
    'privacy_changes_title': '7. Cambios en esta Política',
    'privacy_changes_content': 'Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos sobre cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última Actualización".',
    'privacy_contact_title': '8. Contáctanos',
    'privacy_contact_content': 'Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en:',
    
    // About Us
    'about_title': 'Sobre Mamuk Fitness',
    'about_mission_title': 'Nuestra Misión',
    'about_mission_content': 'En Mamuk Fitness, nos dedicamos a hacer que el fitness sea accesible, agradable y efectivo para todos. Nuestra plataforma combina tecnología de vanguardia con metodologías de entrenamiento probadas para ayudarte a alcanzar tus objetivos de fitness.',
    'about_features': {
      'community_title': 'Impulsado por la Comunidad',
      'community_content': 'Únete a una comunidad solidaria de entusiastas del fitness que comparten tus objetivos y se motivan mutuamente para triunfar.',
      'goals_title': 'Objetivos Personalizados',
      'goals_content': 'Establece y sigue tus objetivos de fitness con nuestro sistema inteligente de establecimiento de objetivos que se adapta a tu progreso y preferencias.',
      'health_title': 'La Salud Primero',
      'health_content': 'Priorizamos tu salud y bienestar, proporcionando planes de entrenamiento seguros y efectivos adecuados para todos los niveles de fitness.',
      'results_title': 'Resultados Comprobados',
      'results_content': 'Nuestra plataforma está diseñada basándose en investigación científica e historias de éxito reales para entregar resultados medibles.'
    },
    'about_story_title': 'Nuestra Historia',
    'about_story_content': 'Mamuk Fitness fue fundado en 2024 con una idea simple: hacer que el fitness sea accesible para todos, independientemente de su nivel de experiencia o acceso a equipamiento. Lo que comenzó como un pequeño proyecto ha crecido hasta convertirse en una plataforma integral de fitness que sirve a miles de usuarios en todo el mundo.',
    'about_team_title': 'Nuestro Equipo',
    'about_team_content': 'Somos un equipo diverso de entusiastas del fitness, desarrolladores y profesionales de la salud apasionados por ayudar a otros a alcanzar sus objetivos de fitness. Nuestro equipo combina experiencia en fitness, tecnología y experiencia de usuario para crear la mejor plataforma posible para nuestros usuarios.',
    'about_contact_title': 'Contáctanos',
    'about_contact_content': '¿Tienes preguntas o sugerencias? ¡Nos encantaría escucharte! Contáctanos en:',
  }
}; 